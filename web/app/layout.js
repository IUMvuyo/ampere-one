import './globals.css';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'Ampere One — measure your home\'s electricity + water',
  description: 'One device, one app. Live energy + water monitoring, leak detection, and an AI resource coach for South African homes and small businesses. GCIP-SA 2026.',
  metadataBase: new URL('https://ampereone.quantyx.co.za'),
  openGraph: {
    title: 'Ampere One',
    description: 'One device measures your home\'s electricity AND water. Cut kWh, litres, Rand and CO₂.',
    type: 'website',
  },
};

export const viewport = { themeColor: '#0c0e0d' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <footer className="footer">
          <div className="wrap spread">
            <div>Ampere One · a <b>Quantyx</b> product · built for GCIP-SA 2026</div>
            <div className="muted">Resource efficiency · Renewable energy · Water management</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
