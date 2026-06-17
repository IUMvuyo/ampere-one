import Link from 'next/link';

export const metadata = {
  title: 'GCIP-SA Grant Case',
  description:
    'Why Ampere One wins the Global Cleantech Innovation Programme South Africa 2026: a live shipping product, a working R750 device, and verified resource-efficiency impact across energy and water.',
  alternates: { canonical: '/grant' },
};

export default function GrantPage() {
  return (
    <main className="wrap" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div className="kicker">Global Cleantech Innovation Programme · South Africa</div>
      <h1 className="display" style={{ fontSize: 'clamp(28px,5vw,48px)' }}>Why Ampere One wins.</h1>
      <p className="lede">
        GCIP-SA backs ventures, not decks. We arrive with a shipping product, a working device, and the climate math —
        applying under <b>Resource Efficiency</b> (deadline 10 July 2026, via gcip.tech).
      </p>

      <section className="grid cols-2" style={{ marginTop: 30 }}>
        <Block t="The unfair edge" items={[
          'Ampere is already LIVE — native iOS + Android + backend. We extend a real product, not a maybe.',
          'A working R750 device on the table beats every render in the room.',
          'Quantyx portfolio (LedgerAI, The Daily Me, DebitWatch) proves we ship.',
        ]} />
        <Block t="The innovation / IP" items={[
          'One box, two resources — electricity AND water on a single cheap device.',
          'No-electrician clip-on metering — removes the #1 mass-market barrier.',
          'On-device appliance disaggregation + load-shedding-aware optimisation, tuned for SA.',
        ]} />
        <Block t="The impact (conservative)" items={[
          'Per home/yr: ~R1,900 saved · ~365 kgCO₂ · ~26 kL water.',
          'At 100k homes: ~36,500 tCO₂/yr · ~2.6bn litres · ~R190m back in pockets.',
          'Same data attacks ~41% municipal non-revenue water (~R10bn/yr).',
        ]} />
        <Block t="The business" items={[
          'Device ~R1,499 once-off · Ampere Pro ~R49/mo (StoreKit live).',
          'B2B/B2G analytics to municipalities, utilities, insurers — the scalable rail.',
          'Verified savings → carbon credits under SA carbon-tax.',
        ]} />
      </section>

      <section className="panel" style={{ marginTop: 24, borderColor: 'var(--green)' }}>
        <h3 style={{ color: 'var(--green)' }}>The ask</h3>
        <p style={{ fontSize: 16, lineHeight: 1.5 }}>
          Acceleration + pilot funding to deploy <b>500 devices across Gauteng homes + 5 municipal sites</b> — proving
          the energy + water savings and the non-revenue-water analytics at scale.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <Link href="/dashboard" className="btn primary">See it live</Link>
          <Link href="/impact" className="btn ghost">Run the numbers</Link>
        </div>
      </section>

      <p className="muted" style={{ fontSize: 12, marginTop: 20 }}>
        Note: the R20m National Cleantech Innovation Challenge (Gauteng "Smart Mobility" lane) closed 21 Apr 2026. The
        live door is the GCIP-SA open call — gcip.tech, 10 July 2026.
      </p>
    </main>
  );
}

function Block({ t, items }) {
  return (
    <div className="panel">
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{t}</div>
      {items.map((it, i) => (
        <div key={i} className="row" style={{ alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <span style={{ color: 'var(--green)' }}>▸</span>
          <span className="muted" style={{ fontSize: 14, lineHeight: 1.45 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}
