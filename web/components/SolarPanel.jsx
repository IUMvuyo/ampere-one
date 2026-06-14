'use client';
import { useEffect, useState } from 'react';
import { getSolar, sizeSolar } from '@/lib/weather';
import { ELECTRICITY_R_PER_KWH } from '@/lib/tariffs';
import { rand, num } from '@/lib/format';

// Live solar right-sizing from Open-Meteo irradiance + the home's measured daily use.
export default function SolarPanel({ dailyKwh = 12, lat = -26.2041, lng = 28.0473, place = 'Johannesburg' }) {
  const [solar, setSolar] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setSolar(null); setErr(null);
    getSolar(lat, lng).then((s) => alive && setSolar(s)).catch(() => alive && setErr('Could not load solar data'));
    return () => { alive = false; };
  }, [lat, lng]);

  const sizing = solar ? sizeSolar({ dailyKwh, psh: solar.psh }) : null;
  const annualSaving = sizing ? Math.round(sizing.annualKwh * ELECTRICITY_R_PER_KWH * 0.7) : 0;

  return (
    <div className="panel">
      <h3>☀️ Solar right-sizing · {place}</h3>
      {err && <div className="muted" style={{ fontSize: 13 }}>{err}</div>}
      {!solar && !err && <div className="muted" style={{ fontSize: 13 }}>Loading live irradiance…</div>}
      {solar && (
        <>
          <div className="row" style={{ gap: 22, marginBottom: 12 }}>
            <div><div className="mono" style={{ fontSize: 22, color: 'var(--energy)' }}>{solar.psh}</div><div className="muted" style={{ fontSize: 10 }}>PEAK SUN HRS</div></div>
            <div><div className="mono" style={{ fontSize: 22 }}>{num(dailyKwh, 1)}</div><div className="muted" style={{ fontSize: 10 }}>kWh/DAY USED</div></div>
            {solar.uv != null && <div><div className="mono" style={{ fontSize: 22, color: 'var(--water)' }}>{Math.round(solar.uv)}</div><div className="muted" style={{ fontSize: 10 }}>UV INDEX</div></div>}
          </div>
          {sizing && (
            <div className="grid cols-3" style={{ gap: 10 }}>
              <Stat n={`${sizing.kWp} kWp`} l="Array" />
              <Stat n={`${sizing.batteryKwh} kWh`} l="Battery" />
              <Stat n={rand(annualSaving)} l="Saving/yr" />
            </div>
          )}
          <div className="muted" style={{ fontSize: 11, marginTop: 12 }}>
            ☀ {solar.sunrise}–{solar.sunset}{solar.daylightH ? ` · ${solar.daylightH}h daylight` : ''} · Open-Meteo live.
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
      <div className="mono" style={{ fontSize: 17 }}>{n}</div>
      <div className="muted" style={{ fontSize: 11 }}>{l}</div>
    </div>
  );
}
