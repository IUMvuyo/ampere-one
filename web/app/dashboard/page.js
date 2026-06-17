import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'Live Dashboard',
  description:
    'Real-time electricity + water dashboard for a South African home. Connect your Ampere One box or run the demo to see kWh, litres, appliance disaggregation, leak detection and the AI coach live.',
  alternates: { canonical: '/dashboard' },
};

export default function DashboardPage() {
  return (
    <main>
      <div className="wrap" style={{ paddingTop: 28 }}>
        <div className="kicker">Live instrument</div>
        <h1 className="display" style={{ fontSize: 'clamp(28px,5vw,44px)' }}>Your home, in real time.</h1>
        <p className="lede" style={{ fontSize: 16 }}>
          Connect the Ampere One box over Bluetooth, or run the demo to see a South African home's electricity and
          water move together — with appliance disaggregation, leak detection and the AI coach live.
        </p>
      </div>
      <Dashboard />
    </main>
  );
}
