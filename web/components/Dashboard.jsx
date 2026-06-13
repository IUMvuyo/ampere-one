'use client';
import { useState, useMemo } from 'react';
import { useTelemetry } from '@/lib/useTelemetry';
import { ELECTRICITY_R_PER_KWH } from '@/lib/tariffs';
import { GRID_CO2_KG_PER_KWH } from '@/lib/carbon';
import { coachInsights } from '@/lib/coach';
import { rand, num } from '@/lib/format';
import Sparkline from './Sparkline';
import Gauge from './Gauge';
import LoadShedding from './LoadShedding';
import SolarPanel from './SolarPanel';
import AirQualityPanel from './AirQualityPanel';

export default function Dashboard() {
  const t = useTelemetry();
  const [stage, setStage] = useState(0);
  const { latest, history, appliances, source, error, totals, supported } = t;

  const avgW = history.length ? history.reduce((s, p) => s + p.w, 0) / history.length : latest.w;
  const dailyKwh = Math.max(2, (avgW / 1000) * 24);
  const costToday = totals.kwh * ELECTRICITY_R_PER_KWH;
  const co2Today = totals.kwh * GRID_CO2_KG_PER_KWH;

  const insights = useMemo(
    () => coachInsights(latest, { appliances, stage, monthlyWaterKl: 15 }),
    [latest, appliances, stage]
  );

  const dot = source === 'device' ? 'live' : source === 'demo' ? 'demo' : 'off';
  const srcLabel = source === 'device' ? 'Live device' : source === 'demo' ? 'Demo mode' : 'Not connected';

  return (
    <div className="wrap" style={{ padding: '24px 20px 60px' }}>
      {/* device bar */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="spread">
          <div className="row">
            <span className={`dot ${dot}`} />
            <b>{srcLabel}</b>
            {source !== 'idle' && <span className="tag">{source === 'device' ? 'ESP32 · BLE' : 'simulated telemetry'}</span>}
          </div>
          <div className="row">
            <button className="btn primary" onClick={t.connectDevice} disabled={!supported} title={supported ? '' : 'Use Chrome/Edge desktop or Android'}>
              🔗 Connect device
            </button>
            <button className="btn" onClick={t.startDemo}>▶ Run demo</button>
            {source !== 'idle' && <button className="btn ghost" onClick={t.stop}>■ Stop</button>}
          </div>
        </div>
        {error && <div className="muted" style={{ fontSize: 13, marginTop: 10, color: 'var(--red)' }}>{error}</div>}
        {!supported && <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Web Bluetooth needs Chrome/Edge on desktop or Android. On any browser, hit <b>Run demo</b> to see the full product live.</div>}
        {source === 'idle' && !error && <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>Connect the Ampere One box over Bluetooth, or <b>Run demo</b> for a simulated SA-home day.</div>}
      </div>

      {/* leak alert */}
      {latest.leak && (
        <div className="alert" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>💧</span>
          <div>
            <span className="big">Leak detected.</span> Continuous flow of {latest.lpm.toFixed(2)} L/min with no tap event —
            ≈ {num(latest.lpm * 60 * 24 * 30 / 1000, 1)} kL/month if unchecked. Check toilets & outside taps.
          </div>
        </div>
      )}

      {/* ENERGY */}
      <div className="kicker" style={{ marginBottom: 8 }}>Electricity</div>
      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="tile energy">
          <span className="accent" />
          <div className="label">Power now</div>
          <div className="value">{num(latest.w)}<span className="unit">W</span></div>
          <div style={{ margin: '8px -4px -4px' }}><Sparkline data={history} color="#f5b301" /></div>
        </div>
        <div className="tile energy"><span className="accent" /><div className="label">Energy today</div><div className="value">{num(totals.kwh, 2)}<span className="unit">kWh</span></div><div className="sub">avg {num(avgW)} W</div></div>
        <div className="tile energy"><span className="accent" /><div className="label">Cost today</div><div className="value">{rand(costToday, 2)}</div><div className="sub">@ {rand(ELECTRICITY_R_PER_KWH, 2)}/kWh</div></div>
        <div className="tile energy"><span className="accent" /><div className="label">CO₂ today</div><div className="value">{num(co2Today, 2)}<span className="unit">kg</span></div><div className="sub">{GRID_CO2_KG_PER_KWH} kg/kWh grid</div></div>
      </div>

      {/* WATER */}
      <div className="kicker" style={{ marginBottom: 8 }}>Water</div>
      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gauge value={latest.tank < 0 ? 0 : latest.tank} color="#38bdf8" label="Tank level" />
        </div>
        <div className="tile water"><span className="accent" /><div className="label">Flow now</div><div className="value">{num(latest.lpm, 2)}<span className="unit">L/min</span></div><div className="sub">{latest.lpm > 0 ? 'water moving' : 'no flow'}</div></div>
        <div className="tile water"><span className="accent" /><div className="label">Water today</div><div className="value">{num(totals.litres, 1)}<span className="unit">L</span></div><div className="sub">{num(totals.litres / 1000, 3)} kL</div></div>
        <div className="tile water" style={{ borderColor: latest.leak ? 'var(--red)' : 'var(--line)' }}>
          <span className="accent" style={{ background: latest.leak ? 'var(--red)' : 'var(--water)' }} />
          <div className="label">Leak status</div>
          <div className="value" style={{ color: latest.leak ? 'var(--red)' : 'var(--green)', fontSize: 30 }}>{latest.leak ? 'LEAK' : 'Clear'}</div>
          <div className="sub">3-min continuous-flow rule</div>
        </div>
      </div>

      {/* COACH + APPLIANCES */}
      <div className="grid cols-2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <h3>🧠 AI resource coach</h3>
          {insights.map((i, k) => (
            <div className="insight" key={k}>
              <span className="ic">{i.icon}</span>
              <div className="txt">{i.text} {i.action && <span><br /><span className={i.rand ? 'rand' : 'muted'}>{i.action}</span></span>}</div>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>🔍 Appliances detected (NILM)</h3>
          {appliances.length === 0 && <div className="muted" style={{ fontSize: 13 }}>No distinct appliances right now. Switch on a kettle in demo mode to watch disaggregation fire.</div>}
          <div>
            {appliances.map((a) => (
              <span className="chip" key={a.id}><span>{a.icon}</span> {a.name} <span className="w">{num(a.watts)}W</span></span>
            ))}
          </div>
          {appliances.length > 0 && <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>Inferred from step-changes in whole-home power — no per-plug sensors.</div>}
        </div>
      </div>

      {/* CONTEXT: load-shedding / solar / air */}
      <div className="grid cols-3">
        <LoadShedding stage={stage} setStage={setStage} />
        <SolarPanel dailyKwh={dailyKwh} />
        <AirQualityPanel />
      </div>
    </div>
  );
}
