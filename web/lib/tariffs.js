// South African residential tariffs — 2026 working values.
// Refine against docs/PUBLIC_APIS.md once the api-specialist confirms current rates.

// Electricity: City Power Joburg residential blended ~329 c/kWh incl. VAT (FY2025/26).
// (Eskom Homepower FY2027 is ~355 c/kWh incl.) See docs/PUBLIC_APIS.md.
export const ELECTRICITY_R_PER_KWH = 3.30;

// Time-of-use windows (24h, local). Peak is when shifting load matters most.
export const PEAK_HOURS = [
  [6, 9],   // morning peak
  [17, 20], // evening peak
];

export function isPeakNow(date = new Date()) {
  const h = date.getHours();
  return PEAK_HOURS.some(([a, b]) => h >= a && h < b);
}

// Joburg Water residential stepped blocks (R per kL), FY2025/26 (+13.9%). See docs/PUBLIC_APIS.md.
export const WATER_BLOCKS = [
  { upTo: 6, rate: 0 },        // free basic allowance
  { upTo: 10, rate: 25.35 },
  { upTo: 15, rate: 26.46 },
  { upTo: 20, rate: 37.10 },
  { upTo: 30, rate: 51.26 },
  { upTo: 40, rate: 56.08 },
  { upTo: 50, rate: 70.77 },
  { upTo: Infinity, rate: 75.81 },
];

// Cost of an incremental kL at a given monthly cumulative usage (marginal rate).
export function waterMarginalRate(monthlyKl) {
  for (const b of WATER_BLOCKS) {
    if (monthlyKl <= b.upTo) return b.rate;
  }
  return WATER_BLOCKS[WATER_BLOCKS.length - 1].rate;
}

// Full monthly water bill for a given consumption (stepped).
export function waterBill(monthlyKl) {
  let bill = 0, prev = 0;
  for (const b of WATER_BLOCKS) {
    const span = Math.max(0, Math.min(monthlyKl, b.upTo) - prev);
    bill += span * b.rate;
    prev = b.upTo;
    if (monthlyKl <= b.upTo) break;
  }
  return bill;
}
