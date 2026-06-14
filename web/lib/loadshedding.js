// Live load-shedding via the ampere-proxy /status endpoint (EskomSePush national
// stage — reliable on the free tier; areas_search is 410). Returns null on failure
// so the UI falls back to the manual stage selector.
import { proxyBase } from './proxy';

export async function getLoadShedding() {
  const base = proxyBase();
  if (!base) return null;
  try {
    const r = await fetch(`${base}/status`);
    if (!r.ok) return null; // 503 fallback or upstream error
    const j = await r.json();
    const e = j?.status?.eskom;
    if (!e) return null;
    const stage = parseInt(e.stage, 10) || 0;
    const ns = Array.isArray(e.next_stages)
      ? e.next_stages.find((s) => (parseInt(s.stage, 10) || 0) !== stage)
      : null;
    const next = ns
      ? { stage: parseInt(ns.stage, 10) || 0, start: new Date(ns.stage_start_timestamp).getTime() }
      : null;
    return { live: true, stage, areaName: e.name || 'National grid', next };
  } catch (_) {
    return null;
  }
}

export function fmtTime(ms) {
  if (!ms) return '';
  try {
    return new Date(ms).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}
