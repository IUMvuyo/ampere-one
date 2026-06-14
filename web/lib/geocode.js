// Open-Meteo Geocoding — free, keyless, CORS-enabled. Suburb/city -> coordinates,
// so the whole dashboard localises to the user instead of hardcoded Johannesburg.
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}`
    + `&count=8&language=en&format=json`;
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const j = await r.json();
    return (j.results || []).map((p) => ({
      id: p.id,
      name: p.name,
      admin: p.admin1 || '',
      country: p.country || '',
      cc: p.country_code || '',
      lat: p.latitude,
      lng: p.longitude,
    }));
  } catch (_) {
    return [];
  }
}
