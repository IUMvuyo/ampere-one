import './globals.css';
import Nav from '@/components/Nav';

const DOMAIN = 'https://ampereone.quantyx.co.za';
const TITLE = 'Ampere One — measure your home\'s electricity + water';
const DESCRIPTION =
  'One device, one app. Live energy + water monitoring, leak detection, and an AI resource coach for South African homes and small businesses. GCIP-SA 2026.';

export const metadata = {
  metadataBase: new URL(DOMAIN),
  title: {
    default: TITLE,
    template: '%s · Ampere One',
  },
  description: DESCRIPTION,
  applicationName: 'Ampere One',
  authors: [{ name: 'Quantyx', url: 'https://quantyx.co.za' }],
  creator: 'Quantyx',
  publisher: 'Quantyx',
  keywords: [
    'energy monitoring',
    'water monitoring',
    'electricity meter',
    'smart home South Africa',
    'load shedding',
    'resource efficiency',
    'GCIP-SA',
    'non-revenue water',
    'leak detection',
    'Ampere One',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: DOMAIN,
    siteName: 'Ampere One',
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_ZA',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Ampere One — energy + water resource monitoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@quantyx',
    creator: '@quantyx',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export const viewport = { themeColor: '#34d399' };

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Quantyx',
  url: 'https://quantyx.co.za',
  logo: `${DOMAIN}/icon-512.png`,
  sameAs: ['https://www.linkedin.com/company/quantyx'],
};

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Ampere One',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'iOS, Android',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'ZAR' },
  description:
    'One device measures your home\'s electricity AND water. Cut kWh, litres, Rand and CO₂ with live monitoring, leak detection, and an AI resource coach.',
  url: DOMAIN,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
      </head>
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
