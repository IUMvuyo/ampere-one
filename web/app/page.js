import Link from 'next/link';
import { computeImpact } from '@/lib/impact';
import { compact, rand } from '@/lib/format';

export default function Home() {
  const r = computeImpact();
  return (
    <main>
      {/* HERO */}
      <section className="wrap hero">
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
