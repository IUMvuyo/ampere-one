// Open-Meteo — free, keyless, CORS-enabled. Solar irradiance for PV sizing + temperature.
// https://api.open-meteo.com/v1/forecast

const JHB = { lat: -26.2041, lon: 28.0473, name: 'Johannesburg' };

export async function getSolar(lat = JHB.lat, lon = JHB.lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=shortwave_radiation_sum,sunshine_duration,temperature_2m_max`
    + `&hourly=shortwave_radiation&timezone=Africa%2FJohannesburg&forecast_days=1`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('weather fetch failed');
  const j = await r.json();
  // shortwave_radiation_sum is MJ/m²/day -> kWh/m²/day (peak sun hours) via /3.6
  const mj = j.daily?.shortwave_radiation_sum?.[0] ?? 0;
  const psh = +(mj / 3.6).toFixed(2);               // ≈ peak sun hours
  const tmax = j.daily?.temperature_2m_max?.[0] ?? null;
  const hourly = (j.hourly?.shortwave_radiation || []).map((v, i) => ({ h: i, w: v }));
  return { psh, tmax, hourly };
}

// Right-size a PV + battery system from daily consumption and local sun hours.
export function sizeSolar({ dailyKwh, psh, autonomyDays = 0.5, derate = 0.78 }) {
  const kWp = psh > 0 ? +(dailyKwh / (psh * derate)).toFixed(2) : 0;          // panel array
  const batteryKwh = +(dailyKwh * autonomyDays).toFixed(1);                    // usable storage
  const annualKwh = dailyKwh * 365;
  return { kWp, batteryKwh, annualKwh };
}
