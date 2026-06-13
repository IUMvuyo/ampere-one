// AI Resource Coach — rule-based insight engine that turns live telemetry into
// ranked, Rand-denominated actions. (Optional LLM enrichment can layer on top via the proxy.)

import { ELECTRICITY_R_PER_KWH, isPeakNow, waterMarginalRate } from './tariffs';
import { GRID_CO2_KG_PER_KWH } from './carbon';

// telemetry: { w, tank, lpm, leak }
// ctx: { appliances: [{name,watts}], stage, monthlyWaterKl, psh }
export function coachInsights(telemetry, ctx = {}) {
  const out = [];
  const { w = 0, lpm = 0, leak = false } = telemetry;
  const { appliances = [], stage = 0, monthlyWaterKl = 15 } = ctx;

  // 1) Leak — highest priority.
  if (leak) {
    const klMonth = +(lpm * 60 * 24 * 30 / 1000).toFixed(1);
    const cost = Math.round(klMonth * waterMarginalRate(monthlyWaterKl));
    out.push({
      icon: '💧', priority: 1, rand: cost,
      text: `Continuous flow with no tap event — likely a leak. At ${lpm.toFixed(2)} L/min that is ~${klMonth} kL/month`,
      action: `≈ R${cost}/mo wasted. Check toilet valves & outside taps.`,
    });
  }

  // 2) Geyser during peak.
  const geyser = appliances.find((a) => /geyser/i.test(a.name));
  if (geyser && isPeakNow()) {
    const kwh = geyser.watts / 1000;
    const save = Math.round(kwh * 2 * 30 * ELECTRICITY_R_PER_KWH * 0.4); // ~40% shiftable
    out.push({
      icon: '🔥', priority: 2, rand: save,
      text: `Geyser is heating during peak tariff (${(geyser.watts / 1000).toFixed(1)} kW).`,
      action: `Shift to 04:00–06:00 off-peak → save ~R${save}/mo.`,
    });
  }

  // 3) Load-shedding pre-charge advice.
  if (stage >= 2) {
    out.push({
      icon: '⚡', priority: 3, rand: 0,
      text: `Stage ${stage} active. Heavy loads (geyser, pool pump) risk running into a slot.`,
      action: `Pre-heat water & finish laundry before the next slot.`,
    });
  }

  // 4) High standby / baseline.
  const baseline = w - appliances.reduce((s, a) => s + a.watts, 0);
  if (baseline > 250) {
    const kwhMonth = (baseline / 1000) * 24 * 30;
    const cost = Math.round(kwhMonth * ELECTRICITY_R_PER_KWH);
    out.push({
      icon: '🔌', priority: 4, rand: cost,
      text: `Always-on standby load is ~${Math.round(baseline)} W.`,
      action: `That is R${cost}/mo running 24/7 — switch off idle devices at the wall.`,
    });
  }

  // 5) Big instantaneous draw.
  if (w > 4000) {
    out.push({
      icon: '📈', priority: 5, rand: 0,
      text: `Drawing ${(w / 1000).toFixed(1)} kW right now — multiple high-load appliances together.`,
      action: `Stagger them to avoid tripping your main & smooth your bill.`,
    });
  }

  if (out.length === 0) {
    out.push({ icon: '✅', priority: 9, rand: 0, text: 'All resources nominal.', action: 'No waste detected right now.' });
  }
  return out.sort((a, b) => a.priority - b.priority);
}

// CO2 saved if the user acts on the energy insights (rough monthly figure).
export function projectedCo2Saved(insights) {
  const randTotal = insights.filter((i) => /geyser|standby|🔌|🔥/.test(i.icon + i.text)).reduce((s, i) => s + (i.rand || 0), 0);
  const kwh = randTotal / ELECTRICITY_R_PER_KWH;
  return Math.round(kwh * GRID_CO2_KG_PER_KWH);
}
