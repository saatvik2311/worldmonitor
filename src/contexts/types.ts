import type maplibregl from 'maplibre-gl';
import type { MapLayers } from '@/types';

export interface GeopoliticalContext {
    id: string; // e.g., 'india', 'global'
    name: string; // e.g., 'India Context', 'Global Standard'
    labelOverrides: Record<string, string>;
    hasGeometryOverrides: boolean;
    feedOverrides?: Record<string, import('@/types').Feed[]>;
    /** IDs of webcam feeds to show in the default grid view */
    webcamOverrides?: string[];
    /** Panel name overrides, e.g. { 'asia': 'India & South Asia' } */
    panelOverrides?: Record<string, string>;
    /** Map layer defaults to merge when context is active */
    mapLayerDefaults?: Partial<MapLayers>;

    applyLabels: (map: maplibregl.Map) => void;
    applyGeometry: (map: maplibregl.Map) => void;
}
