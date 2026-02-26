export interface GeocodeResult {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lon: number;
}

export interface IGeocoder {
  forward(query: string): Promise<GeocodeResult[]>;
  reverse?(lat: number, lon: number): Promise<GeocodeResult | null>;
}

// A generic implementation using Nominatim (OpenStreetMap) as a fallback
export class NominatimGeocoder implements IGeocoder {
  async forward(query: string): Promise<GeocodeResult[]> {
    if (!query || query.length < 3) return [];

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();

      return data.map((item: any) => ({
        id: `geo-${item.place_id}`,
        title: item.display_name.split(',')[0],
        subtitle: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    } catch (e) {
      console.warn('[Geocoder] Nominatim forward search failed:', e);
      return [];
    }
  }
}

// MapmyIndia/Mappls specific implementation for Tier-2 Indian cities
export class MapmyIndiaGeocoder implements IGeocoder {
  private apiKey = import.meta.env.VITE_MAPMYINDIA_KEY || '';

  async forward(query: string): Promise<GeocodeResult[]> {
    if (!query || query.length < 3) return [];
    // If no API key is provided, gracefully drop to empty results (could fallback, but isolating is cleaner)
    if (!this.apiKey) {
      console.warn('[Geocoder] No MapmyIndia API Key found; skipping search.');
      return [];
    }

    try {
      // Dummy API representation of MapmyIndia (In production, replace with actual HTTP call to outPOST/GET)
      // Mappls generally requires an OAuth token fetched using Client ID & Secret
      // This is a placeholder showing where the integration sits.
      const url = `https://atlas.mapmyindia.com/api/places/search/json?query=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      const data = await res.json();

      if (!data.suggestedLocations) return [];

      return data.suggestedLocations.map((item: any) => ({
        id: `mmi-${item.eLoc}`,
        title: item.placeName,
        subtitle: item.placeAddress,
        lat: item.latitude,
        lon: item.longitude
      }));
    } catch (e) {
      console.warn('[Geocoder] MapmyIndia search failed:', e);
      return [];
    }
  }
}

// Singleton provider that logic can reference
// We can switch the instantiated class based on app environment or context
export const geocoderProvider: IGeocoder = new NominatimGeocoder();
// Once the token flow is secured, switch to: new MapmyIndiaGeocoder();
