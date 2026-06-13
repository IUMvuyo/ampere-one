'use client';

// Circular gauge for tank level (0–100%).
export default function Gauge({ value = 0, color = '#38bdf8', label = '', size = 140 }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 54, c = 2 * Math.PI * r;
  const off = c * (1 - v / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#2a3236" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ fontSize: 30, fontWeight: 600, color }}>{Math.round(v)}<span style={{ fontSize: 15 }}>%</span></div>
        {label && <div style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>}
      </div>
    </div>
  );
}
