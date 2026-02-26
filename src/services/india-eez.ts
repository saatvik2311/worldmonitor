export interface EezPolygon {
    type: 'FeatureCollection';
    features: {
        type: 'Feature';
        properties: {
            name: string;
            areaSqKm: number;
        };
        geometry: {
            type: 'Polygon' | 'MultiPolygon';
            coordinates: number[][][] | number[][][][];
        };
    }[];
}

export async function fetchIndiaEez(): Promise<EezPolygon> {
    // In a real scenario, this would load the Flanders Marine Institute dataset.
    // We mock the rough EEZ boundary for India as a simplified polygon for architectural proof.
    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    name: 'India Exclusive Economic Zone',
                    areaSqKm: 2305143,
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [68.1, 23.7], // Gujarat coast
                            [65.0, 20.0], // West Arabian Sea
                            [68.0, 15.0],
                            [71.0, 8.0],  // Near Lakshadweep / Maldives
                            [76.0, 6.0],  // South of Kanyakumari
                            [82.0, 5.0],  // South of Sri Lanka
                            [90.0, 5.0],  // Andaman Sea South
                            [94.0, 7.0],  // Andaman East
                            [93.0, 14.0], // Andaman North
                            [89.0, 21.5], // Bengal coast
                            [85.0, 19.5], // Odisha coast
                            [80.0, 15.5], // Andhra coast
                            [78.0, 8.5],  // Tamil Nadu edge
                            [74.0, 15.0], // Karnataka/Goa edge
                            [70.0, 22.0], // Gujarat edge
                            [68.1, 23.7], // Close loop
                        ]
                    ]
                }
            }
        ]
    };
}
