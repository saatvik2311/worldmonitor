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
    feedOverrides: {
        finance: [
            { name: 'LiveMint', url: rss('https://www.livemint.com/rss/markets') },
            { name: 'Business Standard', url: rss('https://www.business-standard.com/rss/markets-106.rss') },
            { name: 'Moneycontrol', url: rss('https://www.moneycontrol.com/rss/MCtopnews.xml') },
            { name: 'Economic Times', url: rss('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms') },
            // keep standard global fallback
            { name: 'Financial Times', url: rss('https://www.ft.com/rss/home') },
        ],
        politics: [
            { name: 'PTI', url: rss('https://news.google.com/rss/search?q=site:ptinews.com+when:1d&hl=en-IN&gl=IN&ceid=IN:en') },
            { name: 'The Hindu', url: rss('https://www.thehindu.com/news/national/feeder/default.rss') },
            { name: 'Hindustan Times', url: rss('https://www.hindustantimes.com/rss/india/rssfeed.xml') },
            { name: 'Indian Express', url: rss('https://indianexpress.com/section/india/feed/') },
            // keep standard global fallback
            { name: 'Reuters India', url: rss('https://news.google.com/rss/search?q=site:reuters.com+India+when:1d&hl=en-IN&gl=IN&ceid=IN:en') },
        ],
    },

    applyLabels: (map: maplibregl.Map) => {
        applyLabelOverrides(map, indiaLabelOverrides);
    },

    applyGeometry: (map: maplibregl.Map) => {
        hideDisputedBorders(map);
        // The actual Deck.gl GeoJson boundary overlay is handled centrally in DeckGLMap
        // but toggled via the hasGeometryOverrides boolean here.
    }
};
