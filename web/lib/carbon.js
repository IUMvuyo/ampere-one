// SA grid carbon intensity. Official DFFE 2023 Grid Emission Factor = 0.942 kgCO2e/kWh
// (DFFE Grid Emission Factors Report, published Jul 2025). See docs/PUBLIC_APIS.md.
export const GRID_CO2_KG_PER_KWH = 0.942;

export function kwhToCo2(kwh) {
  return kwh * GRID_CO2_KG_PER_KWH;
}

// Treated/pumped water carries embedded energy ~0.6 kWh/kL in SA (abstraction + treatment + distribution).
export const WATER_KWH_PER_KL = 0.6;
export function klToCo2(kl) {
  return kl * WATER_KWH_PER_KL * GRID_CO2_KG_PER_KWH;
}
