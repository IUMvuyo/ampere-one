// Base URL of the ampere-proxy backend (load-shedding + AI coach).
// Set NEXT_PUBLIC_PROXY_BASE at build time (GitHub Actions repo variable PROXY_BASE)
// to go live. When unset, the app gracefully falls back (manual stage + rule-based coach).
export function proxyBase() {
  const b = process.env.NEXT_PUBLIC_PROXY_BASE || '';
  return b.replace(/\/+$/, '');
}

export function hasProxy() {
  return !!proxyBase();
}
