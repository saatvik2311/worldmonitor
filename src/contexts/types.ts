import type maplibregl from 'maplibre-gl';

export interface GeopoliticalContext {
    id: string; // e.g., 'india', 'global'
    name: string; // e.g., 'India Context', 'Global Standard'
    labelOverrides: Record<string, string>;
    hasGeometryOverrides: boolean;
    feedOverrides?: Record<string, import('@/types').Feed[]>;

    applyLabels: (map: maplibregl.Map) => void;
    applyGeometry: (map: maplibregl.Map) => void;
}
