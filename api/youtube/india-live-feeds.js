// India Live Feeds Discovery API
// Batch-checks a curated list of Indian YouTube channels for live streams,
// verifies each is actually live, caches for 5 minutes, and returns
// a random 4 + the full verified list.

import { getCorsHeaders, isDisallowedOrigin } from '../_cors.js';

export const config = {
    runtime: 'edge',
};

// Curated list of Indian YouTube channels likely to have 24/7 live streams.
// Mix of national English news, Hindi news, business, and regional channels.
const INDIA_CHANNELS = [
    { handle: '@IndiaToday', label: 'India Today', city: 'New Delhi', category: 'news' },
    { handle: '@ABORTTV', label: 'Aaj Tak', city: 'New Delhi', category: 'news' },
    { handle: '@NDTV', label: 'NDTV 24x7', city: 'New Delhi', category: 'news' },
    { handle: '@NDTVIndia', label: 'NDTV India', city: 'New Delhi', category: 'news' },
    { handle: '@RepublicWorld', label: 'Republic TV', city: 'Mumbai', category: 'news' },
    { handle: '@WIONews', label: 'WION', city: 'New Delhi', category: 'news' },
    { handle: '@DDIndia', label: 'DD India', city: 'New Delhi', category: 'news' },
    { handle: '@DDNational', label: 'DD National', city: 'New Delhi', category: 'news' },
    { handle: '@TimesNow', label: 'Times Now', city: 'Mumbai', category: 'news' },
    { handle: '@CNNNews18', label: 'CNN-News18', city: 'Noida', category: 'news' },
    { handle: '@News18India', label: 'News18 India', city: 'Noida', category: 'news' },
    { handle: '@ABPNews', label: 'ABP News', city: 'Noida', category: 'news' },
    { handle: '@TV9Bharatvarsh', label: 'TV9 Bharatvarsh', city: 'Noida', category: 'news' },
    { handle: '@ZeeNews', label: 'Zee News', city: 'Noida', category: 'news' },
    { handle: '@firstaborttv', label: 'Good News Today', city: 'New Delhi', category: 'news' },
    { handle: '@MirrorNowNews', label: 'Mirror Now', city: 'Mumbai', category: 'news' },
    { handle: '@ETNOWlive', label: 'ET Now', city: 'Mumbai', category: 'business' },
    { handle: '@CNBCBajar', label: 'CNBC Awaaz', city: 'Mumbai', category: 'business' },
    { handle: '@LokSabhaTV', label: 'Sansad TV', city: 'New Delhi', category: 'gov' },
    { handle: '@rajaborttv', label: 'Rajya Sabha TV', city: 'New Delhi', category: 'gov' },
];

// Simple in-memory cache (edge runtime: per-isolate)
let _cache = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function checkChannelLive(handle) {
    const channelHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const liveUrl = `https://www.youtube.com/${channelHandle}/live`;
    try {
        const response = await fetch(liveUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) return null;
        const html = await response.text();

        // Extract videoId and isLive from videoDetails block
        const detailsIdx = html.indexOf('"videoDetails"');
        if (detailsIdx === -1) return null;

        const block = html.substring(detailsIdx, detailsIdx + 5000);
        const vidMatch = block.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        const liveMatch = block.match(/"isLive"\s*:\s*true/);

        if (!vidMatch || !liveMatch) return null;

        // Extract title
        const titleMatch = block.match(/"title":"([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : null;

        // Extract thumbnail
        const videoId = vidMatch[1];
        const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

        return { videoId, title, thumbnail };
    } catch {
        return null;
    }
}

async function discoverFeeds() {
    // Check cache
    if (_cache && Date.now() - _cacheTs < CACHE_TTL_MS) {
        return _cache;
    }

    // Fan out: check all channels concurrently
    const results = await Promise.allSettled(
        INDIA_CHANNELS.map(async (ch) => {
            const live = await checkChannelLive(ch.handle);
            if (!live) return null;
            return {
                id: ch.handle.replace('@', '').toLowerCase(),
                label: ch.label,
                city: ch.city,
                category: ch.category,
                channelHandle: ch.handle,
                videoId: live.videoId,
                title: live.title,
                thumbnail: live.thumbnail,
                verifiedAt: new Date().toISOString(),
            };
        })
    );

    const verified = results
        .filter((r) => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value);

    _cache = verified;
    _cacheTs = Date.now();

    return verified;
}

function shuffleAndPick(arr, n) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
}

export default async function handler(request) {
    const cors = getCorsHeaders(request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (isDisallowedOrigin(request)) {
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: cors });
    }

    try {
        const verified = await discoverFeeds();

        // Pick random 4 for the grid
        const gridFeeds = shuffleAndPick(verified, 4);

        return new Response(JSON.stringify({
            grid: gridFeeds,              // random 4 for immediate display
            all: verified,                // full list for dropdown
            totalChecked: INDIA_CHANNELS.length,
            totalVerified: verified.length,
            cachedAt: new Date(_cacheTs).toISOString(),
        }), {
            status: 200,
            headers: {
                ...cors,
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error('India live feeds discovery error:', error);
        return new Response(JSON.stringify({
            grid: [],
            all: [],
            error: error.message,
        }), {
            status: 500,
            headers: { ...cors, 'Content-Type': 'application/json' },
        });
    }
}
