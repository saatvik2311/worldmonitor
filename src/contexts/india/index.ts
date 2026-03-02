import type maplibregl from 'maplibre-gl';
import { applyLabelOverrides, hideDisputedBorders } from '../utils';
import { indiaLabelOverrides } from './labels';
import type { GeopoliticalContext } from '../types';
import { rss } from '@/config/feeds';

export const IndiaContext: GeopoliticalContext = {
    id: 'india',
    name: 'India Context',
    labelOverrides: indiaLabelOverrides,
    hasGeometryOverrides: true,

    // --- Feed Overrides ---
    feedOverrides: {
        finance: [
            { name: 'LiveMint', url: rss('https://www.livemint.com/rss/markets') },
            { name: 'Business Standard', url: rss('https://www.business-standard.com/rss/markets-106.rss') },
            { name: 'Moneycontrol', url: rss('https://www.moneycontrol.com/rss/MCtopnews.xml') },
            { name: 'Economic Times', url: rss('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms') },
            { name: 'Financial Times', url: rss('https://www.ft.com/rss/home') },
        ],
        politics: [
            { name: 'PTI', url: rss('https://news.google.com/rss/search?q=site:ptinews.com+when:1d&hl=en-IN&gl=IN&ceid=IN:en') },
            { name: 'The Hindu', url: rss('https://www.thehindu.com/news/national/feeder/default.rss') },
            { name: 'Hindustan Times', url: rss('https://www.hindustantimes.com/rss/india/rssfeed.xml') },
            { name: 'Indian Express', url: rss('https://indianexpress.com/section/india/feed/') },
            { name: 'Reuters India', url: rss('https://news.google.com/rss/search?q=site:reuters.com+India+when:1d&hl=en-IN&gl=IN&ceid=IN:en') },
        ],
        thinktanks: [
            { name: 'ORF', url: rss('https://www.orfonline.org/feed') },
            { name: 'MP-IDSA', url: rss('https://news.google.com/rss/search?q=site:idsa.in+when:7d&hl=en-IN&gl=IN&ceid=IN:en') },
            { name: 'Carnegie India', url: rss('https://news.google.com/rss/search?q=site:carnegieindia.org+when:7d&hl=en-IN&gl=IN&ceid=IN:en') },
            { name: 'Takshashila', url: rss('https://news.google.com/rss/search?q=site:takshashila.org.in+when:7d&hl=en-IN&gl=IN&ceid=IN:en') },
            { name: 'CSIS India', url: rss('https://news.google.com/rss/search?q=site:csis.org+India+when:7d&hl=en-US&gl=US&ceid=US:en') },
        ],
        energy: [
            { name: 'India Energy', url: rss('https://news.google.com/rss/search?q=(ONGC+OR+NTPC+OR+PowerGrid+OR+"Indian+energy"+OR+IOCL)+when:3d&hl=en-IN&gl=IN&ceid=IN:en') },
            { name: 'India Nuclear', url: rss('https://news.google.com/rss/search?q=(NPCIL+OR+"nuclear+power"+India+OR+BARC)+when:7d&hl=en-IN&gl=IN&ceid=IN:en') },
            { name: 'India Renewables', url: rss('https://news.google.com/rss/search?q=(solar+India+OR+"green+hydrogen"+India+OR+IREDA)+when:3d&hl=en-IN&gl=IN&ceid=IN:en') },
        ],
        asia: [
            { name: 'NDTV', url: rss('https://feeds.feedburner.com/ndtvnews-top-stories') },
            { name: 'India Today', url: rss('https://www.indiatoday.in/rss/home') },
            { name: 'Scroll.in', url: rss('https://scroll.in/feed') },
            { name: 'The Wire', url: rss('https://thewire.in/feed') },
            { name: 'Firstpost', url: rss('https://www.firstpost.com/rss/india.xml') },
            // Keep global fallbacks
            { name: 'BBC Asia', url: rss('https://feeds.bbci.co.uk/news/world/asia/rss.xml') },
            { name: 'Reuters Asia', url: rss('https://news.google.com/rss/search?q=site:reuters.com+(India+OR+Pakistan+OR+Bangladesh+OR+Sri+Lanka)+when:3d&hl=en-US&gl=US&ceid=US:en') },
        ],
    },

    // --- Webcam Overrides: Default grid shows Indian cities ---
    webcamOverrides: ['delhi', 'mumbai', 'varanasi', 'kolkata'],

    // --- Panel Name Overrides ---
    panelOverrides: {
        'asia': 'India & South Asia',
    },

    // --- Map Layer Defaults: Auto-enable AQI + EEZ ---
    mapLayerDefaults: {
        aqi: true,
        eez: true,
    },

    applyLabels: (map: maplibregl.Map) => {
        applyLabelOverrides(map, indiaLabelOverrides);
    },

    applyGeometry: (map: maplibregl.Map) => {
        hideDisputedBorders(map);
    }
};
