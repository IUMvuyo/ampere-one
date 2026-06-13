'use client';
import { useEffect, useState } from 'react';
import { getSolar, sizeSolar } from '@/lib/weather';
import { ELECTRICITY_R_PER_KWH } from '@/lib/tariffs';
import { rand, num } from '@/lib/format';

// Live solar right-sizing from Open-Meteo irradiance + the home's measured daily use.
export default function SolarPanel({ dailyKwh = 12 }) {
  const [solar, setSolar] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    getSolar().then((s) => alive && setSolar(s)).catch(() => alive && setErr('Could not load solar data'));
    return () => { alive = false; };
  }, []);

  const sizing = solar ? sizeSolar({ dailyKwh, psh: solar.psh }) : null;
  const annualSaving = sizing ? Math.round(sizing.annualKwh * ELECTRICITY_R_PER_KWH * 0.7) : 0; // ~70% offset

  return (
    <div className="panel">
      <h3>☀️ Solar right-sizing · Johannesburg</h3>
      {err && <div className="muted" style={{ fontSize: 13 }}>{err}</div>}
      {!solar && !err && <div className="muted" style={{ fontSize: 13 }}>Loading live irradiance…</div>}
      {solar && (
        <>
          <div className="row" style={{ gap: 24, marginBottom: 14 }}>
            <div><div className="mono" style={{ fontSize: 24, color: 'var(--energy)' }}>{solar.psh}</div><div className="muted" style={{ fontSize: 11 }}>PEAK SUN HRS TODAY</div></div>
            <div><div className="mono" style={{ fontSize: 24 }}>{num(dailyKwh, 1)}</div><div className="muted" style={{ fontSize: 11 }}>kWh/DAY MEASURED</div></div>
          </div>
          {sizing && (
            <div className="grid cols-3" style={{ gap: 10 }}>
              <Stat n={`${sizing.kWp} kWp`} l="Recommended array" />
              <Stat n={`${sizing.batteryKwh} kWh`} l="Battery (½-day)" />
              <Stat n={rand(annualSaving)} l="Est. saving/yr" />
            </div>
          )}
          <div className="muted" style={{ fontSize: 11, marginTop: 12 }}>Live irradiance via Open-Meteo · sizing from your measured consumption.</div>
        </>
      )}
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
      <div className="mono" style={{ fontSize: 18 }}>{n}</div>
      <div className="muted" style={{ fontSize: 11 }}>{l}</div>
    </div>
  );
}
