import ImpactCalculator from '@/components/ImpactCalculator';
import SAContext from '@/components/SAContext';

export const metadata = { title: 'Impact · Ampere One' };

export default function ImpactPage() {
  return (
    <main className="wrap" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div className="kicker">The climate + economic case</div>
      <h1 className="display" style={{ fontSize: 'clamp(28px,5vw,46px)' }}>Small box. Fleet-scale impact.</h1>
      <p className="lede" style={{ marginBottom: 28 }}>
        Conservative per-home savings, multiplied across a deployment. Drag the dials — every number is computed live
        from verified SA tariffs and the official grid emission factor.
      </p>
      <ImpactCalculator />
      <SAContext />
      <p className="muted" style={{ fontSize: 12, marginTop: 20 }}>
        Energy 5–15% and water 10–15% reductions from real-time feedback + leak detection are well-evidenced; defaults
        model the low end. Grid factor 0.942 kgCO₂e/kWh (DFFE 2023). Tariffs: City Power + Joburg Water FY2025/26.
      </p>
    </main>
  );
}
