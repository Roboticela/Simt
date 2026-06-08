export interface GeocodeResult {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
}

/** Global place search via OpenStreetMap Nominatim (no country or bbox filter). */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: '25',
    dedupe: '1',
  });

  const res = await fetch(`${NOMINATIM_SEARCH}?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error(`Geocode ${res.status}`);

  const data = (await res.json()) as NominatimItem[];
  return data.map((item) => ({
    placeId: String(item.place_id),
    name: item.name ?? item.display_name.split(',')[0]?.trim() ?? item.display_name,
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
