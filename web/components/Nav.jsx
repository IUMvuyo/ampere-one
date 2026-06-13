'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Live Dashboard' },
  { href: '/impact', label: 'Impact' },
  { href: '/grant', label: 'The Grant' },
];

export default function Nav() {
  const path = usePathname();
  const norm = (p) => (p === '/' ? '/' : p.replace(/\/$/, ''));
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="brand">Ampere<b>One</b></Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={norm(path) === l.href ? 'active' : ''}>{l.label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
