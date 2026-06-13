// Base URL of the ampere-proxy backend (load-shedding + AI coach).
// Set NEXT_PUBLIC_PROXY_BASE at build time (GitHub Actions repo variable PROXY_BASE)
// to go live. When unset, the app gracefully falls back (manual stage + rule-based coach).
// Stable public default so the wiring works on any deploy; override with the env var.
const DEFAULT_PROXY = 'https://ampere-proxy.vercel.app';

export function proxyBase() {
  const b = process.env.NEXT_PUBLIC_PROXY_BASE || DEFAULT_PROXY;
  return b.replace(/\/+$/, '');
}

export function hasProxy() {
  return !!proxyBase();
}
