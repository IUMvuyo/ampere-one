'use client';
import { useEffect, useState } from 'react';
import { getSAContext } from '@/lib/context';
import { num } from '@/lib/format';

// South Africa national context (World Bank, via proxy) — grant-credible framing.
export default function SAContext() {
  const [c, setC] = useState(null);
  useEffect(() => { let a = true; getSAContext().then((d) => a && setC(d)); return () => { a = false; }; }, []);
  if (!c) return null;
  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <h3>🇿🇦 South Africa context · World Bank{c.year ? ` (${c.year})` : ''}</h3>
      <div className="grid cols-3" style={{ gap: 12 }}>
        {c.electricityAccessPct != null && <Stat n={`${num(c.electricityAccessPct, 1)}%`} l="Access to electricity" />}
        {c.renewablePct != null && <Stat n={`${num(c.renewablePct, 1)}%`} l="Electricity from renewables" />}
        {c.co2PerCapita != null && <Stat n={`${num(c.co2PerCapita, 1)} t`} l="CO₂ per capita / yr" />}
      </div>
      <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>Live via World Bank Indicators API.</div>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
      <div className="mono" style={{ fontSize: 22, color: 'var(--green)' }}>{n}</div>
      <div className="muted" style={{ fontSize: 12 }}>{l}</div>
    </div>
  );
}
