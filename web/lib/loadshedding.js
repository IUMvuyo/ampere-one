// Live load-shedding via the ampere-proxy /loadshedding endpoint (EskomSePush, key
// server-side). Returns null on any failure so the UI falls back to the manual stage.
import { proxyBase } from './proxy';

const JHB = { lat: -26.2041, lng: 28.0473 };

function parseStage(note) {
  const m = /stage\s*(\d+)/i.exec(note || '');
  return m ? +m[1] : 0;
}

export async function getLoadShedding(lat = JHB.lat, lng = JHB.lng) {
  const base = proxyBase();
  if (!base) return null;
  try {
    const r = await fetch(`${base}/loadshedding?lat=${lat}&lng=${lng}`);
    if (!r.ok) return null; // 503 fallback or upstream error
    const j = await r.json();
    const events = Array.isArray(j.events) ? j.events : [];
    const now = Date.now();
    const parsed = events
      .map((e) => ({
        start: new Date(e.start).getTime(),
        end: new Date(e.end).getTime(),
        stage: parseStage(e.note),
        note: e.note,
      }))
      .filter((e) => Number.isFinite(e.start) && Number.isFinite(e.end))
      .sort((a, b) => a.start - b.start);

    const active = parsed.find((e) => e.start <= now && now < e.end) || null;
    const next = parsed.find((e) => e.start > now) || null;
    return {
      live: true,
      areaName: j?.info?.name || null,
      stage: active ? active.stage : 0,
      active,
      next,
    };
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
