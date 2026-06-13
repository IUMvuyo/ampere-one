'use client';

// Minimal dependency-free SVG sparkline for the live power feed.
export default function Sparkline({ data = [], color = '#f5b301', height = 56, fill = true }) {
  const w = 100, h = 100; // viewBox units; scales to container
  if (data.length < 2) {
    return <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }} />;
  }
  const ys = data.map((d) => d.w);
  const max = Math.max(...ys, 1);
  const min = Math.min(...ys, 0);
  const span = Math.max(max - min, 1);
  const step = w / (data.length - 1);
  const pts = ys.map((y, i) => [i * step, h - ((y - min) / span) * (h - 6) - 3]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
