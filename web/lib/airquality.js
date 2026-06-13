// Open-Meteo Air Quality — free, keyless, CORS-enabled.
// https://air-quality-api.open-meteo.com/v1/air-quality

const JHB = { lat: -26.2041, lon: 28.0473 };

export async function getAirQuality(lat = JHB.lat, lon = JHB.lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}`
    + `&current=pm2_5,pm10,european_aqi,carbon_monoxide,nitrogen_dioxide&timezone=Africa%2FJohannesburg`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('air quality fetch failed');
  const j = await r.json();
  const c = j.current || {};
  return {
    pm25: c.pm2_5 ?? null,
    pm10: c.pm10 ?? null,
    aqi: c.european_aqi ?? null,
    no2: c.nitrogen_dioxide ?? null,
    co: c.carbon_monoxide ?? null,
  };
}

export function aqiBand(aqi) {
  if (aqi == null) return { label: '—', color: '#5f6c68' };
  if (aqi <= 20) return { label: 'Good', color: '#34d399' };
  if (aqi <= 40) return { label: 'Fair', color: '#a3e635' };
  if (aqi <= 60) return { label: 'Moderate', color: '#f5b301' };
  if (aqi <= 80) return { label: 'Poor', color: '#fb923c' };
  if (aqi <= 100) return { label: 'Very poor', color: '#f0556a' };
  return { label: 'Hazardous', color: '#b91c1c' };
}
