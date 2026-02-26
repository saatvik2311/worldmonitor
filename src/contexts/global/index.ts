import type maplibregl from 'maplibre-gl';
import type { GeopoliticalContext } from '../types';

export const GlobalContext: GeopoliticalContext = {
    id: 'global',
    name: 'Global Standard',
    labelOverrides: {},
    hasGeometryOverrides: false,

    applyLabels: (map: maplibregl.Map) => {
        // Standard UN/Carto map labels apply 
    },

    applyGeometry: (map: maplibregl.Map) => {
        // Standard UN borders apply 
    }
};
