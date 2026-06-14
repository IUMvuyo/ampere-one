// AI Resource Coach — rule-based insight engine that turns live telemetry into
// ranked, Rand-denominated actions. (Optional LLM enrichment can layer on top via the proxy.)

import { ELECTRICITY_R_PER_KWH, isPeakNow, waterMarginalRate } from './tariffs';
import { GRID_CO2_KG_PER_KWH } from './carbon';
import { proxyBase } from './proxy';

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

const AI_SYSTEM = [
  "You are Ampere One's resource coach for a South African home or small business.",
  'You receive live electricity (watts) and water (litres/min, tank %, leak) telemetry plus detected appliances and the load-shedding stage.',
  'Reply with ONE punchy, specific, actionable sentence (max 30 words).',
  'Denominate savings in Rand where possible. Reference SA context (load-shedding, geyser, peak tariff, leaks).',
  'No preamble, no greeting, no markdown — just the sentence.',
].join(' ');

function aiUserMsg(telemetry, context) {
  return `Telemetry: ${JSON.stringify(telemetry)}\nContext: ${JSON.stringify(context)}\nGive the single highest-value action right now.`;
}

// localStorage helpers for the bring-your-own-key flow.
export const AI_KEY_LS = 'ampere_ai_key';
export const AI_MODEL_LS = 'ampere_ai_model';
export const DEFAULT_AI_MODEL = 'claude-haiku-4-5-20251001';

export function getStoredAiKey() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(AI_KEY_LS) || '';
}
export function getStoredAiModel() {
  if (typeof window === 'undefined') return DEFAULT_AI_MODEL;
  return window.localStorage.getItem(AI_MODEL_LS) || DEFAULT_AI_MODEL;
}

// AI coach line. Bring-your-own-key first: the user's own Claude key (stored only
// in their browser) calls Anthropic directly. Falls back to the proxy /coach if a
// server key is set, else null → the rule-based insights stand alone.
export async function getAiCoachLine(telemetry, context) {
  // 1) Bring-your-own-key — browser → Anthropic directly (key never hits our servers).
  const key = getStoredAiKey();
  if (key) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: getStoredAiModel(),
          max_tokens: 120,
          system: AI_SYSTEM,
          messages: [{ role: 'user', content: aiUserMsg(telemetry, context) }],
        }),
      });
      if (r.ok) {
        const j = await r.json();
        const t = (j?.content?.[0]?.text || '').trim();
        if (t) return t;
      }
    } catch (_) { /* fall through */ }
  }

  // 2) Optional server fallback (only if the proxy has its own key set).
  const base = proxyBase();
  if (base) {
    try {
      const r = await fetch(`${base}/coach`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ telemetry, context }),
      });
      if (r.ok) {
        const j = await r.json();
        if (j && j.text) return j.text;
      }
    } catch (_) { /* fall through */ }
  }
  return null;
}

// CO2 saved if the user acts on the energy insights (rough monthly figure).
export function projectedCo2Saved(insights) {
  const randTotal = insights.filter((i) => /geyser|standby|🔌|🔥/.test(i.icon + i.text)).reduce((s, i) => s + (i.rand || 0), 0);
  const kwh = randTotal / ELECTRICITY_R_PER_KWH;
  return Math.round(kwh * GRID_CO2_KG_PER_KWH);
}
