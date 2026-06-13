// Formatting helpers — South African rand + tidy numbers.

export function rand(n, dp = 0) {
  if (n == null || isNaN(n)) return 'R0';
  return 'R' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function num(n, dp = 0) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-ZA', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function compact(n) {
  if (n == null || isNaN(n)) return '0';
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1) + 'bn';
  if (a >= 1e6) return (n / 1e6).toFixed(1) + 'm';
  if (a >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(Math.round(n));
}
