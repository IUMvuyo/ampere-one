// South Africa macro context from the World Bank Indicators API (free, keyless,
// but NOT CORS-enabled) — fetched via the ampere-proxy /context route. Adds
// grant-credible national figures (World Bank attribution) to the impact page.
import { proxyBase } from './proxy';

export async function getSAContext() {
  const base = proxyBase();
  if (!base) return null;
  try {
    const r = await fetch(`${base}/context`);
    if (!r.ok) return null;
    return await r.json(); // { electricityAccessPct, co2PerCapita, renewablePct, year }
  } catch (_) {
    return null;
  }
}
