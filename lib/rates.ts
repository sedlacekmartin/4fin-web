export interface Rate {
  bank: string;
  fix_3: number;
  fix_5: number;
  fix_7: number;
  fix_10: number;
}

export const FALLBACK_RATES: Rate[] = [
  { bank: "Air Bank", fix_3: 4.89, fix_5: 4.79, fix_7: 4.89, fix_10: 4.99 },
  { bank: "Česká spořitelna", fix_3: 4.99, fix_5: 4.79, fix_7: 4.89, fix_10: 5.09 },
  { bank: "Raiffeisenbank", fix_3: 4.99, fix_5: 4.89, fix_7: 4.99, fix_10: 5.19 },
  { bank: "ČSOB / Hyp. banka", fix_3: 5.19, fix_5: 4.99, fix_7: 5.09, fix_10: 5.29 },
  { bank: "Komerční banka", fix_3: 5.09, fix_5: 4.99, fix_7: 5.09, fix_10: 5.19 },
  { bank: "Moneta", fix_3: 5.29, fix_5: 5.09, fix_7: 5.19, fix_10: 5.39 },
  { bank: "mBank", fix_3: 5.19, fix_5: 5.09, fix_7: 5.19, fix_10: 5.29 },
  { bank: "UniCredit Bank", fix_3: 5.09, fix_5: 4.99, fix_7: 5.09, fix_10: 5.19 },
];

export const BANK_COLORS: Record<string, string> = {
  "Air Bank": "#9AA0A6",
  "Česká spořitelna": "#0066B3",
  "Raiffeisenbank": "#D4A017",
  "ČSOB / Hyp. banka": "#003D7D",
  "Komerční banka": "#E2001A",
  "Moneta": "#7AB800",
  "mBank": "#E40043",
  "UniCredit Bank": "#C8102E",
};

export function anuita(P: number, rY: number, nY: number): number {
  const r = rY / 100 / 12;
  const n = nY * 12;
  if (r === 0) return P / n;
  return (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

export function fmtCzk(n: number): string {
  return Math.round(n).toLocaleString("cs-CZ");
}

export function fmtMil(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + " mil. Kč";
  return fmtCzk(n) + " Kč";
}
