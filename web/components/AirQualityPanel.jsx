'use client';
import { useEffect, useState } from 'react';
import { getAirQuality, aqiBand } from '@/lib/airquality';

// Live air quality (Open-Meteo) — the environmental-protection tie-in.
export default function AirQualityPanel({ lat = -26.2041, lng = 28.0473, place = 'Johannesburg' }) {
  const [aq, setAq] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setAq(null); setErr(null);
    getAirQuality(lat, lng).then((d) => alive && setAq(d)).catch(() => alive && setErr('Could not load air quality'));
    return () => { alive = false; };
  }, [lat, lng]);

  const band = aq ? aqiBand(aq.aqi) : null;
  return (
    <div className="panel">
      <h3>🌫️ Air quality · {place}</h3>
      {err && <div className="muted" style={{ fontSize: 13 }}>{err}</div>}
      {!aq && !err && <div className="muted" style={{ fontSize: 13 }}>Loading live air quality…</div>}
      {aq && (
        <>
          <div className="row" style={{ alignItems: 'baseline', gap: 12 }}>
            <div className="mono" style={{ fontSize: 40, color: band.color }}>{aq.aqi ?? '—'}</div>
            <div>
              <div style={{ color: band.color, fontWeight: 600 }}>{band.label}</div>
              <div className="muted" style={{ fontSize: 11 }}>European AQI</div>
            </div>
          </div>
          <div className="grid cols-2" style={{ gap: 10, marginTop: 12 }}>
            <Mini l="PM2.5" v={aq.pm25} u="µg/m³" />
            <Mini l="PM10" v={aq.pm10} u="µg/m³" />
            <Mini l="NO₂" v={aq.no2} u="µg/m³" />
            <Mini l="CO" v={aq.co} u="µg/m³" />
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 12 }}>Live via Open-Meteo Air Quality API.</div>
        </>
      )}
    </div>
  );
}

function Mini({ l, v, u }) {
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }}>
      <div className="muted" style={{ fontSize: 11 }}>{l}</div>
      <div className="mono" style={{ fontSize: 17 }}>{v != null ? Math.round(v) : '—'} <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{u}</span></div>
    </div>
  );
}
