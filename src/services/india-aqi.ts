export interface AqiStation {
    id: string;
    name: string;
    lat: number;
    lon: number;
    aqi: number;
    pm25: number;
    status: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
    lastUpdated: number;
}

export async function fetchCpcbAqi(): Promise<AqiStation[]> {
    // In a real application, this would fetch from data.gov.in / CPCB APIs.
    // For the architectural demonstration of the context engine, we mock a few major stations.
    const mockStations: AqiStation[] = [
        { id: '1', name: 'Delhi', lat: 28.6139, lon: 77.2090, aqi: 350, pm25: 180, status: 'Very Poor', lastUpdated: Date.now() },
        { id: '2', name: 'Mumbai', lat: 19.0760, lon: 72.8777, aqi: 150, pm25: 80, status: 'Moderate', lastUpdated: Date.now() },
        { id: '3', name: 'Bangalore', lat: 12.9716, lon: 77.5946, aqi: 65, pm25: 30, status: 'Satisfactory', lastUpdated: Date.now() },
        { id: '4', name: 'Kolkata', lat: 22.5726, lon: 88.3639, aqi: 210, pm25: 110, status: 'Poor', lastUpdated: Date.now() },
        { id: '5', name: 'Chennai', lat: 13.0827, lon: 80.2707, aqi: 85, pm25: 40, status: 'Satisfactory', lastUpdated: Date.now() },
        { id: '6', name: 'Hyderabad', lat: 17.3850, lon: 78.4867, aqi: 110, pm25: 55, status: 'Moderate', lastUpdated: Date.now() },
        { id: '7', name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, aqi: 180, pm25: 90, status: 'Moderate', lastUpdated: Date.now() },
        { id: '8', name: 'Lucknow', lat: 26.8467, lon: 80.9462, aqi: 320, pm25: 160, status: 'Very Poor', lastUpdated: Date.now() },
        { id: '9', name: 'Kanpur', lat: 26.4499, lon: 80.3319, aqi: 360, pm25: 190, status: 'Severe', lastUpdated: Date.now() },
        { id: '10', name: 'Pune', lat: 18.5204, lon: 73.8567, aqi: 120, pm25: 60, status: 'Moderate', lastUpdated: Date.now() },
    ];

    return mockStations;
}
