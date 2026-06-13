import Link from 'next/link';
import { computeImpact } from '@/lib/impact';
import { compact, rand } from '@/lib/format';

export default function Home() {
  const r = computeImpact();
  return (
    <main>
      {/* HERO */}
      <section className="wrap hero">
        <div className="hero-grid">
          <div>
            <div className="kicker">GCIP-SA 2026 · Resource Efficiency</div>
            <h1 className="display">One device measures your home's<br />electricity <span style={{ color: 'var(--energy)' }}>and</span> water.</h1>
            <p className="lede">
              South African homes are blind to their two most expensive, most rationed resources. Ampere One clips on in
              minutes — no electrician, no plumber — and turns electricity and water into live numbers you can act on:
              kWh, litres, Rand and CO₂. With leak detection and an AI coach that talks in money.
            </p>
            <div className="row" style={{ marginTop: 28 }}>
              <Link href="/dashboard" className="btn primary">▶ See the live dashboard</Link>
              <Link href="/grant" className="btn ghost">Why this wins the grant →</Link>
            </div>
          </div>
          <DeviceMock />
        </div>
        <div className="stat-row">
          <div className="s"><div className="n">{rand(r.perHome.rand)}</div><div className="l">Saved / home / year</div></div>
          <div className="s"><div className="n">{r.perHome.co2} kg</div><div className="l">CO₂ / home / year</div></div>
          <div className="s"><div className="n">{r.perHome.kl} kL</div><div className="l">Water / home / year</div></div>
          <div className="s"><div className="n">~R750</div><div className="l">Device bill of materials</div></div>
        </div>
      </section>

      {/* HOW */}
      <section className="wrap section-pad">
        <div className="kicker">How it works</div>
        <h2 className="section">A R750 box. The app you already shipped.</h2>
        <div className="grid cols-3">
          <Card t="1 · Clip on" b="A non-invasive CT sensor clips around a wire in your DB board — no contact with mains, no certified install. The water side reads tank level + flow." />
          <Card t="2 · Stream live" b="An ESP32 streams electricity + water over Bluetooth straight to the Ampere app — already live on iOS and Android — and to this web dashboard." />
          <Card t="3 · Act in Rand" b="Appliance disaggregation, leak alerts, load-shedding-aware scheduling and solar sizing — every tip priced in Rand and CO₂." />
        </div>
      </section>

      {/* WHY IT QUALIFIES */}
      <section className="wrap section-pad">
        <div className="kicker">Why it fits GCIP-SA</div>
        <h2 className="section">Two focus areas, one box.</h2>
        <div className="grid cols-2">
          <Card t="⚡ Energy efficiency + renewable" b="Real-time feedback cuts household electricity 5–15%. Solar/battery right-sizing from live irradiance turns guesswork into payback math." />
          <Card t="💧 Water management + resource efficiency" b="Minute-level leak detection on homes and tanks — and the same data, aggregated, attacks the ~41% non-revenue water bleeding SA municipalities (~R10bn/yr)." />
        </div>
        <div className="row" style={{ marginTop: 24 }}>
          <Link href="/impact" className="btn">Run the impact numbers →</Link>
          <Link href="/dashboard" className="btn ghost">Open the dashboard</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap section-pad">
        <div className="cta-band">
          <div className="kicker">Pilots open</div>
          <h2 className="section" style={{ marginTop: 10 }}>Put Ampere One in your home, fleet, or municipality.</h2>
          <p className="lede">
            Households and spaza shops cutting bills. Body corporates catching leaks. Municipal water teams attacking
            non-revenue water. Request a pilot unit or the analytics dashboard.
          </p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
            <a className="btn primary" href="mailto:hello@quantyx.co.za?subject=Ampere%20One%20pilot%20request">Request a pilot →</a>
            <Link href="/dashboard" className="btn ghost">See it live first</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ t, b }) {
  return (
    <div className="panel">
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{t}</div>
      <div className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{b}</div>
    </div>
  );
}

// Static product visual for the hero — a stylised Ampere One readout.
function DeviceMock() {
  return (
    <div className="device-mock">
      <div className="cap">
        <b>Ampere<span style={{ color: 'var(--green)' }}>One</span></b>
        <span className="row" style={{ gap: 6 }}><span className="dot live" /><span className="tag" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>LIVE</span></span>
      </div>
      <div className="scr">
        <div className="dm-row"><span className="k">Power now</span><span className="v" style={{ color: 'var(--energy)' }}>2,180 W</span></div>
        <div className="dm-row"><span className="k">Cost today</span><span className="v">R 41.60</span></div>
        <div className="dm-row"><span className="k">Tank level</span><span className="v" style={{ color: 'var(--water)' }}>78 %</span></div>
        <div className="dm-row"><span className="k">Water flow</span><span className="v" style={{ color: 'var(--water)' }}>0.3 L/m</span></div>
        <div className="dm-row"><span className="k">Leak</span><span className="v" style={{ color: 'var(--red)' }}>DETECTED</span></div>
      </div>
      <div className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 12 }}>kettle on · slow leak found · coach: “fix toilet valve, save R88/mo”</div>
    </div>
  );
}
