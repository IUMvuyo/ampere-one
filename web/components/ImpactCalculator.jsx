'use client';
import { useState } from 'react';
import { computeImpact, DEFAULTS } from '@/lib/impact';
import { rand, num, compact } from '@/lib/format';

// Interactive version of the GCIP impact thesis — drag the dials, watch the climate math.
export default function ImpactCalculator() {
  const [homes, setHomes] = useState(DEFAULTS.homes);
  const [energyPct, setEnergyPct] = useState(DEFAULTS.energyPct);
  const [waterPct, setWaterPct] = useState(DEFAULTS.waterPct);

  const r = computeImpact({ homes, energyPct, waterPct });

  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="panel">
        <h3>Assumptions</h3>
        <div className="field">
          <label>Homes deployed <b>{compact(homes)}</b></label>
          <input type="range" min="1000" max="2000000" step="1000" value={homes} onChange={(e) => setHomes(+e.target.value)} />
          <div className="muted" style={{ fontSize: 11 }}>SA has ~17m households — even {((homes / 17000000) * 100).toFixed(1)}% is a fleet.</div>
        </div>
        <div className="field">
          <label>Electricity reduction <b>{energyPct}%</b></label>
          <input type="range" min="3" max="15" step="1" value={energyPct} onChange={(e) => setEnergyPct(+e.target.value)} />
          <div className="muted" style={{ fontSize: 11 }}>Real-time feedback drives 5–15% (evidenced).</div>
        </div>
        <div className="field">
          <label>Water reduction <b>{waterPct}%</b></label>
          <input type="range" min="5" max="20" step="1" value={waterPct} onChange={(e) => setWaterPct(+e.target.value)} />
          <div className="muted" style={{ fontSize: 11 }}>Leak detection + behaviour: 10–15%.</div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 6 }}>
          <div className="muted" style={{ fontSize: 12 }}>Per home / year</div>
          <div className="row" style={{ gap: 18, marginTop: 6 }}>
            <span className="mono">{rand(r.perHome.rand)} saved</span>
            <span className="mono">{num(r.perHome.co2)} kgCO₂</span>
            <span className="mono">{num(r.perHome.kl, 1)} kL</span>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gap: 14 }}>
        <BigStat color="var(--green)" n={`${compact(r.fleet.tco2)} t`} l="CO₂ avoided / year" />
        <BigStat color="var(--water)" n={`${compact(r.fleet.litres)} L`} l="Water saved / year" />
        <BigStat color="var(--energy)" n={rand(r.fleet.rand)} l="Back in households / year" sub={`${compact(r.fleet.kwh)} kWh avoided`} />
      </div>
    </div>
  );
}

function BigStat({ n, l, sub, color }) {
  return (
    <div className="panel" style={{ borderColor: color }}>
      <div className="mono" style={{ fontSize: 44, color, lineHeight: 1.05 }}>{n}</div>
      <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{l}</div>
      {sub && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
