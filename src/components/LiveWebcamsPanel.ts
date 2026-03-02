import { Panel } from './Panel';
import { isDesktopRuntime, getRemoteApiBaseUrl } from '@/services/runtime';
import { escapeHtml } from '@/utils/sanitize';
import { t } from '../services/i18n';
import { trackWebcamSelected, trackWebcamRegionFiltered } from '@/services/analytics';
import { getStreamQuality, subscribeStreamQualityChange } from '@/services/ai-flow-settings';

type WebcamRegion = 'middle-east' | 'europe' | 'asia' | 'americas' | 'india';

interface WebcamFeed {
  id: string;
  city: string;
  country: string;
  region: WebcamRegion;
  channelHandle: string;
  fallbackVideoId: string;
}

// Dynamic feed from the India discovery API
interface IndiaLiveFeed {
  id: string;
  label: string;
  city: string;
  category: string;
  channelHandle: string;
  videoId: string;
  title: string | null;
  thumbnail: string;
  verifiedAt: string;
}

interface IndiaFeedsResponse {
  grid: IndiaLiveFeed[];
  all: IndiaLiveFeed[];
  totalChecked: number;
  totalVerified: number;
  cachedAt: string;
  error?: string;
}

// Verified YouTube live stream IDs — validated Feb 2026 via title cross-check.
// IDs may rotate; update when stale.
const WEBCAM_FEEDS: WebcamFeed[] = [
  // Middle East — Jerusalem & Tehran adjacent (conflict hotspots)
  { id: 'jerusalem', city: 'Jerusalem', country: 'Israel', region: 'middle-east', channelHandle: '@TheWesternWall', fallbackVideoId: 'UyduhBUpO7Q' },
  { id: 'tehran', city: 'Tehran', country: 'Iran', region: 'middle-east', channelHandle: '@IranHDCams', fallbackVideoId: '-zGuR1qVKrU' },
  { id: 'dubai', city: 'Dubai', country: 'UAE', region: 'middle-east', channelHandle: '@DubaiLiveHD', fallbackVideoId: 'bXZZGHIN0s0' },
  { id: 'istanbul', city: 'Istanbul', country: 'Turkey', region: 'middle-east', channelHandle: '@IstanbulCam', fallbackVideoId: 'HD4EIVEdho4' },
  { id: 'mecca', city: 'Mecca', country: 'Saudi Arabia', region: 'middle-east', channelHandle: '@alabortt', fallbackVideoId: '-v3bG_eabrc' },
  // Europe — Conflict \u0026 strategic cities
  { id: 'kyiv', city: 'Kyiv', country: 'Ukraine', region: 'europe', channelHandle: '@KyivLiveCam', fallbackVideoId: '2cyQPN5iDiI' },
  { id: 'london', city: 'London', country: 'UK', region: 'europe', channelHandle: '@LondonLiveCam', fallbackVideoId: 'b3EgiKJhXVA' },
  { id: 'paris', city: 'Paris', country: 'France', region: 'europe', channelHandle: '@ParisLiveCam', fallbackVideoId: 'cFz__TaaMKk' },
  { id: 'rome', city: 'Rome', country: 'Italy', region: 'europe', channelHandle: '@SkylineWebcamsRome', fallbackVideoId: 'UT0aYKkpHSk' },
  // Americas
  { id: 'washington', city: 'Washington D.C.', country: 'USA', region: 'americas', channelHandle: '@EarthCamTV', fallbackVideoId: 'TNCVkzraJ0I' },
  { id: 'nyc', city: 'New York City', country: 'USA', region: 'americas', channelHandle: '@EarthCamNYC', fallbackVideoId: '1-iS7LArMPA' },
  { id: 'miami', city: 'Miami', country: 'USA', region: 'americas', channelHandle: '@MiamiBeachLiveCam', fallbackVideoId: '_9OBfCR0j5M' },
  // Asia
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', region: 'asia', channelHandle: '@TokyoLiveCam4K', fallbackVideoId: '4pu9sF5Qssw' },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', region: 'asia', channelHandle: '@UNvillage_live', fallbackVideoId: '-JhoMGoAfFc' },
  { id: 'sydney', city: 'Sydney', country: 'Australia', region: 'asia', channelHandle: '@WebcamSydney', fallbackVideoId: '7pcL-0Wo77U' },
];

const MAX_GRID_CELLS = 4;

type RegionFilter = 'all' | WebcamRegion;
type ViewMode = 'grid' | 'single';

export class LiveWebcamsPanel extends Panel {
  private activeFeed: WebcamFeed = WEBCAM_FEEDS[0]!;
  private regionFilter: RegionFilter = 'all';
  private viewMode: ViewMode = 'grid';
  private iframes: HTMLIFrameElement[] = [];
  private toolbar!: HTMLDivElement;
  private observer: IntersectionObserver | null = null;
  private isVisible = false;
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private boundIdleResetHandler!: () => void;
  private boundVisibilityHandler!: () => void;
  private readonly IDLE_PAUSE_MS = 5 * 60 * 1000;
  private isIdle = false;

  // India dynamic feeds state
  private indiaFeeds: IndiaLiveFeed[] = [];
  private indiaAllFeeds: IndiaLiveFeed[] = [];
  private indiaLoading = false;
  private indiaError: string | null = null;
  private indiaSelectedFeedIdx: number | null = null; // for dropdown single-view
  private indiaFetched = false;

  constructor() {
    super({ id: 'live-webcams', title: t('panels.liveWebcams') });
    this.element.classList.add('panel-wide');
    this.createToolbar();
    this.setupIntersectionObserver();
    this.setupIdleDetection();
    subscribeStreamQualityChange(() => this.render());
    this.render();
  }

  private get filteredFeeds(): WebcamFeed[] {
    if (this.regionFilter === 'all') return WEBCAM_FEEDS;
    return WEBCAM_FEEDS.filter(f => f.region === this.regionFilter);
  }

  private static readonly ALL_GRID_IDS = ['jerusalem', 'tehran', 'kyiv', 'washington'];

  private get gridFeeds(): WebcamFeed[] {
    if (this.regionFilter === 'all') {
      return LiveWebcamsPanel.ALL_GRID_IDS
        .map(id => WEBCAM_FEEDS.find(f => f.id === id)!)
        .filter(Boolean);
    }
    return this.filteredFeeds.slice(0, MAX_GRID_CELLS);
  }

  private createToolbar(): void {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'webcam-toolbar';

    const regionGroup = document.createElement('div');
    regionGroup.className = 'webcam-toolbar-group';

    const regions: { key: RegionFilter; label: string }[] = [
      { key: 'all', label: t('components.webcams.regions.all') },
      { key: 'middle-east', label: t('components.webcams.regions.mideast') },
      { key: 'europe', label: t('components.webcams.regions.europe') },
      { key: 'americas', label: t('components.webcams.regions.americas') },
      { key: 'asia', label: t('components.webcams.regions.asia') },
      { key: 'india', label: 'INDIA' },
    ];

    regions.forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.className = `webcam-region-btn${key === this.regionFilter ? ' active' : ''}`;
      btn.dataset.region = key;
      btn.textContent = label;
      btn.addEventListener('click', () => this.setRegionFilter(key));
      regionGroup.appendChild(btn);
    });

    const viewGroup = document.createElement('div');
    viewGroup.className = 'webcam-toolbar-group';

    const gridBtn = document.createElement('button');
    gridBtn.className = `webcam-view-btn${this.viewMode === 'grid' ? ' active' : ''}`;
    gridBtn.dataset.mode = 'grid';
    gridBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>';
    gridBtn.title = 'Grid view';
    gridBtn.addEventListener('click', () => this.setViewMode('grid'));

    const singleBtn = document.createElement('button');
    singleBtn.className = `webcam-view-btn${this.viewMode === 'single' ? ' active' : ''}`;
    singleBtn.dataset.mode = 'single';
    singleBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="14" rx="2"/><rect x="3" y="19" width="18" height="2" rx="1"/></svg>';
    singleBtn.title = 'Single view';
    singleBtn.addEventListener('click', () => this.setViewMode('single'));

    viewGroup.appendChild(gridBtn);
    viewGroup.appendChild(singleBtn);

    this.toolbar.appendChild(regionGroup);
    this.toolbar.appendChild(viewGroup);
    this.element.insertBefore(this.toolbar, this.content);
  }

  private setRegionFilter(filter: RegionFilter): void {
    if (filter === this.regionFilter) return;
    trackWebcamRegionFiltered(filter);
    this.regionFilter = filter;
    this.toolbar?.querySelectorAll('.webcam-region-btn').forEach(btn => {
      (btn as HTMLElement).classList.toggle('active', (btn as HTMLElement).dataset.region === filter);
    });
    if (filter === 'india') {
      // Fetch India feeds dynamically
      this.indiaSelectedFeedIdx = null;
      if (!this.indiaFetched) {
        this.fetchIndiaFeeds();
      } else {
        this.render();
      }
      return;
    }
    const feeds = this.filteredFeeds;
    if (feeds.length > 0 && !feeds.includes(this.activeFeed)) {
      this.activeFeed = feeds[0]!;
    }
    this.render();
  }

  private async fetchIndiaFeeds(): Promise<void> {
    this.indiaLoading = true;
    this.indiaError = null;
    this.render();

    try {
      const baseUrl = isDesktopRuntime() ? getRemoteApiBaseUrl() : '';
      const res = await fetch(`${baseUrl}/api/youtube/india-live-feeds`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: IndiaFeedsResponse = await res.json();
      this.indiaFeeds = data.grid;
      this.indiaAllFeeds = data.all;
      this.indiaError = data.error || null;
      this.indiaFetched = true;
    } catch (e: any) {
      this.indiaError = e.message || 'Failed to fetch India feeds';
      this.indiaFeeds = [];
      this.indiaAllFeeds = [];
    } finally {
      this.indiaLoading = false;
      this.render();
    }
  }

  private setViewMode(mode: ViewMode): void {
    if (mode === this.viewMode) return;
    this.viewMode = mode;
    this.toolbar?.querySelectorAll('.webcam-view-btn').forEach(btn => {
      (btn as HTMLElement).classList.toggle('active', (btn as HTMLElement).dataset.mode === mode);
    });
    this.render();
  }

  private buildEmbedUrlFromVideoId(videoId: string): string {
    const quality = getStreamQuality();
    if (isDesktopRuntime()) {
      const remoteBase = getRemoteApiBaseUrl();
      const params = new URLSearchParams({
        videoId,
        autoplay: '1',
        mute: '1',
      });
      if (quality !== 'auto') params.set('vq', quality);
      return `${remoteBase}/api/youtube/embed?${params.toString()}`;
    }
    const vq = quality !== 'auto' ? `&vq=${quality}` : '';
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0${vq}`;
  }

  private buildEmbedUrl(feed: WebcamFeed): string {
    return this.buildEmbedUrlFromVideoId(feed.fallbackVideoId);
  }

  private createIframe(feed: WebcamFeed): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.className = 'webcam-iframe';
    iframe.src = this.buildEmbedUrl(feed);
    iframe.title = `${feed.city} live webcam`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    return iframe;
  }

  private createIframeFromVideoId(videoId: string, title: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.className = 'webcam-iframe';
    iframe.src = this.buildEmbedUrlFromVideoId(videoId);
    iframe.title = title;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    return iframe;
  }

  private render(): void {
    this.destroyIframes();

    if (!this.isVisible || this.isIdle) {
      this.content.innerHTML = '<div class="webcam-placeholder">Webcams paused</div>';
      return;
    }

    if (this.regionFilter === 'india') {
      this.renderIndia();
      return;
    }

    if (this.viewMode === 'grid') {
      this.renderGrid();
    } else {
      this.renderSingle();
    }
  }

  private renderGrid(): void {
    this.content.innerHTML = '';
    this.content.className = 'panel-content webcam-content';

    const grid = document.createElement('div');
    grid.className = 'webcam-grid';

    this.gridFeeds.forEach(feed => {
      const cell = document.createElement('div');
      cell.className = 'webcam-cell';
      cell.addEventListener('click', () => {
        trackWebcamSelected(feed.id, feed.city, 'grid');
        this.activeFeed = feed;
        this.setViewMode('single');
      });

      const label = document.createElement('div');
      label.className = 'webcam-cell-label';
      label.innerHTML = `<span class="webcam-live-dot"></span><span class="webcam-city">${escapeHtml(feed.city.toUpperCase())}</span>`;

      const iframe = this.createIframe(feed);
      cell.appendChild(iframe);
      cell.appendChild(label);
      grid.appendChild(cell);
      this.iframes.push(iframe);
    });

    this.content.appendChild(grid);
  }

  // --- India dynamic feeds ---

  private renderIndia(): void {
    this.content.innerHTML = '';
    this.content.className = 'panel-content webcam-content';

    if (this.indiaLoading) {
      this.content.innerHTML = `
        <div class="webcam-india-loading">
          <div class="webcam-india-spinner"></div>
          <div class="webcam-india-loading-text">Discovering live Indian streams...</div>
          <div class="webcam-india-loading-sub">Checking ${20} channels</div>
        </div>`;
      return;
    }

    if (this.indiaError && this.indiaFeeds.length === 0) {
      this.content.innerHTML = `
        <div class="webcam-india-error">
          <div style="font-size:1.5em;margin-bottom:8px">⚠️</div>
          <div>${escapeHtml(this.indiaError)}</div>
          <button class="webcam-india-retry" id="india-retry">Retry</button>
        </div>`;
      this.content.querySelector('#india-retry')?.addEventListener('click', () => {
        this.indiaFetched = false;
        this.fetchIndiaFeeds();
      });
      return;
    }

    if (this.indiaSelectedFeedIdx !== null && this.indiaAllFeeds[this.indiaSelectedFeedIdx]) {
      this.renderIndiaSingle(this.indiaAllFeeds[this.indiaSelectedFeedIdx]!);
      return;
    }

    // Grid view — show random 4
    this.renderIndiaGrid();
  }

  private renderIndiaGrid(): void {
    const feeds = this.indiaFeeds;

    if (feeds.length === 0) {
      this.content.innerHTML = '<div class="webcam-placeholder">No live Indian streams found. Try again later.</div>';
      return;
    }

    // Header row with feed count and dropdown
    const header = document.createElement('div');
    header.className = 'webcam-india-header';
    header.innerHTML = `
      <span class="webcam-india-count">${this.indiaAllFeeds.length} live channels verified</span>
      <button class="webcam-india-refresh" id="india-refresh" title="Refresh feeds">↻ Refresh</button>
    `;
    this.content.appendChild(header);
    header.querySelector('#india-refresh')?.addEventListener('click', () => {
      this.indiaFetched = false;
      this.fetchIndiaFeeds();
    });

    // Grid
    const grid = document.createElement('div');
    grid.className = 'webcam-grid';

    feeds.forEach((feed, _idx) => {
      const cell = document.createElement('div');
      cell.className = 'webcam-cell';
      cell.addEventListener('click', () => {
        const allIdx = this.indiaAllFeeds.findIndex(f => f.id === feed.id);
        this.indiaSelectedFeedIdx = allIdx >= 0 ? allIdx : 0;
        this.render();
      });

      const label = document.createElement('div');
      label.className = 'webcam-cell-label';
      label.innerHTML = `<span class="webcam-live-dot"></span><span class="webcam-city">${escapeHtml(feed.label.toUpperCase())}</span>`;

      const iframe = this.createIframeFromVideoId(feed.videoId, `${feed.label} live`);
      cell.appendChild(iframe);
      cell.appendChild(label);
      grid.appendChild(cell);
      this.iframes.push(iframe);
    });

    this.content.appendChild(grid);

    // Dropdown: all verified feeds
    if (this.indiaAllFeeds.length > feeds.length) {
      const dropdown = document.createElement('div');
      dropdown.className = 'webcam-india-dropdown';

      const select = document.createElement('select');
      select.className = 'webcam-india-select';
      select.innerHTML = '<option value="">▼ All verified Indian channels (' + this.indiaAllFeeds.length + ')</option>';
      this.indiaAllFeeds.forEach((f, i) => {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = `${f.label} — ${f.city} (${f.category})`;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => {
        const val = select.value;
        if (val !== '') {
          this.indiaSelectedFeedIdx = parseInt(val, 10);
          this.render();
        }
      });
      dropdown.appendChild(select);
      this.content.appendChild(dropdown);
    }
  }

  private renderIndiaSingle(feed: IndiaLiveFeed): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'webcam-single';

    const iframe = this.createIframeFromVideoId(feed.videoId, `${feed.label} live`);
    wrapper.appendChild(iframe);
    this.iframes.push(iframe);
    this.content.appendChild(wrapper);

    // Switcher bar
    const switcher = document.createElement('div');
    switcher.className = 'webcam-switcher';

    const backBtn = document.createElement('button');
    backBtn.className = 'webcam-feed-btn webcam-back-btn';
    backBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> Grid';
    backBtn.addEventListener('click', () => {
      this.indiaSelectedFeedIdx = null;
      this.render();
    });
    switcher.appendChild(backBtn);

    // Feed buttons from all verified
    this.indiaAllFeeds.forEach((f, i) => {
      const btn = document.createElement('button');
      btn.className = `webcam-feed-btn${i === this.indiaSelectedFeedIdx ? ' active' : ''}`;
      btn.textContent = f.label;
      btn.addEventListener('click', () => {
        this.indiaSelectedFeedIdx = i;
        this.render();
      });
      switcher.appendChild(btn);
    });

    this.content.appendChild(switcher);
  }

  private renderSingle(): void {
    this.content.innerHTML = '';
    this.content.className = 'panel-content webcam-content';

    const wrapper = document.createElement('div');
    wrapper.className = 'webcam-single';

    const iframe = this.createIframe(this.activeFeed);
    wrapper.appendChild(iframe);
    this.iframes.push(iframe);

    const switcher = document.createElement('div');
    switcher.className = 'webcam-switcher';

    const backBtn = document.createElement('button');
    backBtn.className = 'webcam-feed-btn webcam-back-btn';
    backBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> Grid';
    backBtn.addEventListener('click', () => this.setViewMode('grid'));
    switcher.appendChild(backBtn);

    this.filteredFeeds.forEach(feed => {
      const btn = document.createElement('button');
      btn.className = `webcam-feed-btn${feed.id === this.activeFeed.id ? ' active' : ''}`;
      btn.textContent = feed.city;
      btn.addEventListener('click', () => {
        trackWebcamSelected(feed.id, feed.city, 'single');
        this.activeFeed = feed;
        this.render();
      });
      switcher.appendChild(btn);
    });

    this.content.appendChild(wrapper);
    this.content.appendChild(switcher);
  }

  private destroyIframes(): void {
    this.iframes.forEach(iframe => {
      iframe.src = 'about:blank';
      iframe.remove();
    });
    this.iframes = [];
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const wasVisible = this.isVisible;
        this.isVisible = entries.some(e => e.isIntersecting);
        if (this.isVisible && !wasVisible && !this.isIdle) {
          this.render();
        } else if (!this.isVisible && wasVisible) {
          this.destroyIframes();
        }
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this.element);
  }

  private setupIdleDetection(): void {
    this.boundVisibilityHandler = () => {
      if (document.hidden) {
        if (this.idleTimeout) clearTimeout(this.idleTimeout);
      } else {
        if (this.isIdle) {
          this.isIdle = false;
          if (this.isVisible) this.render();
        }
        this.boundIdleResetHandler();
      }
    };
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);

    this.boundIdleResetHandler = () => {
      if (this.idleTimeout) clearTimeout(this.idleTimeout);
      if (this.isIdle) {
        this.isIdle = false;
        if (this.isVisible) this.render();
      }
      this.idleTimeout = setTimeout(() => {
        this.isIdle = true;
        this.destroyIframes();
        this.content.innerHTML = '<div class="webcam-placeholder">Webcams paused — move mouse to resume</div>';
      }, this.IDLE_PAUSE_MS);
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(event => {
      document.addEventListener(event, this.boundIdleResetHandler, { passive: true });
    });

    this.boundIdleResetHandler();
  }

  public refresh(): void {
    if (this.isVisible && !this.isIdle) {
      this.render();
    }
  }

  public destroy(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(event => {
      document.removeEventListener(event, this.boundIdleResetHandler);
    });
    this.observer?.disconnect();
    this.destroyIframes();
    super.destroy();
  }
}
