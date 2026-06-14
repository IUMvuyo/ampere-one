'use client';
import { useEffect, useState } from 'react';
import { getLoadShedding, fmtTime } from '@/lib/loadshedding';
import { hasProxy } from '@/lib/proxy';

// Live national load-shedding stage (EskomSePush /status via ampere-proxy).
// Falls back to a manual stage selector if the proxy/key is unavailable.
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
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, [setStage]);

  return (
    <div className="panel">
      <h3>⚡ Load-shedding {live && <span className="tag" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>● LIVE · EskomSePush</span>}</h3>

      {live ? (
        <div style={{ marginBottom: 12 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{live.areaName} (national)</div>
          {live.stage > 0 ? (
            <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: 18 }}>⚠ Stage {live.stage} active now</div>
          ) : (
            <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 18 }}>No load-shedding ✅ (Stage 0)</div>
          )}
          {live.next && (
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              Next change: Stage {live.next.stage} at {fmtTime(live.next.start)}
            </div>
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
            ? 'Live feed unavailable — using manual stage.'
            : 'Manual stage feeds the coach.'}
      </div>
    </div>
  );
}
