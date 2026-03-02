import type maplibregl from 'maplibre-gl';
import type { GeopoliticalContext } from '../types';

export const GlobalContext: GeopoliticalContext = {
    id: 'global',
    name: 'Global Standard',
    labelOverrides: {},
    hasGeometryOverrides: false,

    applyLabels: (_map: maplibregl.Map) => {
        // Standard UN/Carto map labels apply 
    },

    applyGeometry: (_map: maplibregl.Map) => {
        // Standard UN borders apply 
    }
};
