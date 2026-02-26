import type maplibregl from 'maplibre-gl';

export const buildLabelExpression = (overrides: Record<string, string>) => {
    if (Object.keys(overrides).length === 0) return null;

    const caseExpr: any[] = ['case'];
    for (const [original, substitute] of Object.entries(overrides)) {
        // English name match
        caseExpr.push(['==', ['get', 'name_en'], original]);
        caseExpr.push(substitute);
        // Localized name match
        caseExpr.push(['==', ['get', 'name'], original]);
        caseExpr.push(substitute);
    }

    // Also handle some specific translation mapping if needed (e.g. Chinese to English if specified)
    // For now, the overrides dictionary will handle the primary matching.

    return caseExpr;
};

export const applyLabelOverrides = (map: maplibregl.Map, overrides: Record<string, string>) => {
    if (Object.keys(overrides).length === 0) return;

    try {
        const style = map.getStyle();
        if (!style || !style.layers) return;

        const caseMapping = buildLabelExpression(overrides);
        if (!caseMapping) return;

        style.layers.forEach((layer) => {
            if (layer.type === 'symbol' && layer.layout && (layer.layout as any)['text-field']) {
                const currentTextField = (layer.layout as any)['text-field'];

                // Helper to convert legacy text-field '{prop}' strings or stops into valid MapLibre expressions
                const convertToExpression = (val: any): any => {
                    if (typeof val === 'string') {
                        const match = val.match(/^\{([^}]+)\}$/);
                        if (match) return ['get', match[1]];
                        return val;
                    }
                    if (val && typeof val === 'object' && Array.isArray(val.stops)) {
                        const stops: any[] = val.stops;
                        const stepExpr: any[] = ['step', ['zoom']];
                        if (stops.length > 0) {
                            stepExpr.push(convertToExpression(stops[0][1]));
                            for (let i = 1; i < stops.length; i++) {
                                stepExpr.push(stops[i][0]); // zoom level
                                stepExpr.push(convertToExpression(stops[i][1])); // value
                            }
                            return stepExpr;
                        }
                    }
                    return val;
                };

                const fallbackExpression = convertToExpression(currentTextField);

                map.setLayoutProperty(layer.id, 'text-field', [
                    ...caseMapping,
                    fallbackExpression
                ]);
            }
        });
    } catch (e) {
        console.warn('[ContextEngine] Failed to apply label overrides', e);
    }
};

export const hideDisputedBorders = (map: maplibregl.Map) => {
    try {
        const style = map.getStyle();
        if (!style || !style.layers) return;
        style.layers.forEach((layer) => {
            const id = layer.id.toLowerCase();
            // Target boundary and admin layers
            if (id.includes('boundary') || id.includes('admin') || (layer as any).sourceLayer === 'boundary') {
                if (id.includes('disputed')) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                } else if (layer.type === 'line') {
                    const currentFilter = map.getFilter(layer.id) || ['all'];
                    const isAllArray = Array.isArray(currentFilter) && currentFilter[0] === 'all';
                    const filterArr = isAllArray ? currentFilter as any[] : ['all', currentFilter];

                    map.setFilter(layer.id, [
                        ...filterArr,
                        ['!=', ['get', 'disputed'], 1],
                        ['!=', ['get', 'disputed'], 'true'],
                        ['!=', ['get', 'disputed'], true],
                        ['!=', ['get', 'admin_level'], 4],
                        ['!=', ['get', 'admin_level'], 6]
                    ] as any);
                }
            }
        });
    } catch (e) {
        console.warn('[ContextEngine] Failed to hide disputed borders', e);
    }
};
