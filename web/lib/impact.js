// Fleet impact model — the GCIP grant numbers, made interactive.
// Conservative per-home savings from the venture brief.

import { ELECTRICITY_R_PER_KWH, waterBill } from './tariffs';
import { GRID_CO2_KG_PER_KWH, klToCo2 } from './carbon';

export const DEFAULTS = {
  homes: 100000,
  energyPct: 8,        // % electricity reduction from feedback (5–15% evidenced)
  waterPct: 12,        // % water reduction from leak detection + behaviour (10–15%)
  baselineKwhYr: 4800, // typical SA grid-connected household / year
  baselineKlYr: 216,   // ~18 kL/month
};

export function computeImpact(opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const kwhSavedHome = o.baselineKwhYr * (o.energyPct / 100);
  const klSavedHome = o.baselineKlYr * (o.waterPct / 100);

  const randEnergyHome = kwhSavedHome * ELECTRICITY_R_PER_KWH;
  // value water saving at the marginal upper-block rate (most homes save off the top block)
  const randWaterHome = waterBill(o.baselineKlYr) - waterBill(o.baselineKlYr - klSavedHome);
  const co2Home = kwhSavedHome * GRID_CO2_KG_PER_KWH + klToCo2(klSavedHome);

  const f = o.homes;
  return {
    perHome: {
      kwh: Math.round(kwhSavedHome),
      kl: +klSavedHome.toFixed(1),
      rand: Math.round(randEnergyHome + randWaterHome),
      co2: Math.round(co2Home),
    },
    fleet: {
      homes: f,
      kwh: Math.round(kwhSavedHome * f),
      litres: Math.round(klSavedHome * f * 1000),
      tco2: Math.round((co2Home * f) / 1000),
      rand: Math.round((randEnergyHome + randWaterHome) * f),
    },
  };
}
