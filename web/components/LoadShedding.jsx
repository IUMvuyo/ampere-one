'use client';

// Load-shedding context. EskomSePush needs a key + is CORS-blocked in-browser,
// so the live schedule routes through the ampere-proxy backend; here we expose a
// stage selector that feeds the AI coach. (Wire NEXT_PUBLIC_PROXY_BASE to go live.)
export default function LoadShedding({ stage, setStage }) {
  return (
    <div className="panel">
      <h3>⚡ Load-shedding stage</h3>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3, 4, 5, 6].map((s) => (
          <button
            key={s}
            className={'btn ' + (stage === s ? 'primary' : 'ghost')}
            style={{ padding: '8px 14px', minWidth: 44 }}
            onClick={() => setStage(s)}
          >
            {s === 0 ? 'Off' : s}
          </button>
        ))}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        {stage === 0
          ? 'Grid stable — no scheduled cuts.'
          : `Stage ${stage}: the coach will recommend pre-charging heavy loads before your next slot.`}
      </div>
    </div>
  );
}
