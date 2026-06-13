'use client';
import { useEffect, useState } from 'react';
import { getLoadShedding, fmtTime } from '@/lib/loadshedding';
import { hasProxy } from '@/lib/proxy';

// Live load-shedding (EskomSePush via ampere-proxy). Falls back to a manual stage
// selector when NEXT_PUBLIC_PROXY_BASE isn't set or the upstream is unavailable.
export default function LoadShedding({ stage, setStage }) {
  const [live, setLive] = useState(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!hasProxy()) { setTried(true); return; }
    let alive = true;
    const load = () => getLoadShedding().then((d) => {
      if (!alive) return;
      setTried(true);
      if (d) { setLive(d); setStage(d.stage); }
    });
    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => { alive = false; clearInterval(id); };
  }, [setStage]);

  return (
    <div className="panel">
      <h3>⚡ Load-shedding {live && <span className="tag" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>● LIVE · EskomSePush</span>}</h3>

      {live ? (
        <div style={{ marginBottom: 12 }}>
          {live.areaName && <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{live.areaName}</div>}
          {live.active ? (
            <div style={{ color: 'var(--red)', fontWeight: 700 }}>
              ⚠ Stage {live.active.stage} NOW — until {fmtTime(live.active.end)}
            </div>
          ) : live.next ? (
            <div>Next: <b>Stage {live.next.stage}</b> at {fmtTime(live.next.start)}–{fmtTime(live.next.end)}</div>
          ) : (
            <div style={{ color: 'var(--green)' }}>No scheduled cuts ahead. ✅</div>
          )}
        </div>
      ) : (
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((s) => (
            <button key={s} className={'btn ' + (stage === s ? 'primary' : 'ghost')} style={{ padding: '8px 14px', minWidth: 44 }} onClick={() => setStage(s)}>
              {s === 0 ? 'Off' : s}
            </button>
          ))}
        </div>
      )}

      <div className="muted" style={{ fontSize: 12 }}>
        {live
          ? 'The AI coach uses this live stage to recommend pre-charging heavy loads.'
          : tried && hasProxy()
            ? 'Live feed unavailable (set ESKOMSEPUSH_KEY on the proxy). Using manual stage.'
            : 'Set NEXT_PUBLIC_PROXY_BASE for live EskomSePush; manual stage feeds the coach for now.'}
      </div>
    </div>
  );
}
