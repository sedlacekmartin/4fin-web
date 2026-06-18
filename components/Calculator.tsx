"use client";

import { useState, useEffect, useRef } from "react";

interface Rate {
  bank: string;
  fix_3: number;
  fix_5: number;
  fix_7: number;
  fix_10: number;
}

const FALLBACK_RATES: Rate[] = [
  { bank: "Air Bank", fix_3: 4.89, fix_5: 4.79, fix_7: 4.89, fix_10: 4.99 },
  { bank: "Česká spořitelna", fix_3: 4.99, fix_5: 4.79, fix_7: 4.89, fix_10: 5.09 },
  { bank: "Raiffeisenbank", fix_3: 4.99, fix_5: 4.89, fix_7: 4.99, fix_10: 5.19 },
  { bank: "ČSOB / Hyp. banka", fix_3: 5.19, fix_5: 4.99, fix_7: 5.09, fix_10: 5.29 },
  { bank: "Komerční banka", fix_3: 5.09, fix_5: 4.99, fix_7: 5.09, fix_10: 5.19 },
  { bank: "Moneta", fix_3: 5.29, fix_5: 5.09, fix_7: 5.19, fix_10: 5.39 },
  { bank: "mBank", fix_3: 5.19, fix_5: 5.09, fix_7: 5.19, fix_10: 5.29 },
  { bank: "UniCredit Bank", fix_3: 5.09, fix_5: 4.99, fix_7: 5.09, fix_10: 5.19 },
];

type FixKey = "fix_3" | "fix_5" | "fix_7" | "fix_10";

const FIX_OPTIONS: { label: string; key: FixKey }[] = [
  { label: "3 roky", key: "fix_3" },
  { label: "5 let", key: "fix_5" },
  { label: "7 let", key: "fix_7" },
  { label: "10 let", key: "fix_10" },
];

function anuita(P: number, rY: number, nY: number): number {
  const r = rY / 100 / 12;
  const n = nY * 12;
  if (r === 0) return P / n;
  return (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

function fmtCzk(n: number) {
  return Math.round(n).toLocaleString("cs-CZ");
}

export default function Calculator() {
  const [amount, setAmount] = useState(4_000_000);
  const [term, setTerm] = useState(25);
  const [fixKey, setFixKey] = useState<FixKey>("fix_5");
  const [rates, setRates] = useState<Rate[]>(FALLBACK_RATES);
  const [displayPayment, setDisplayPayment] = useState(0);
  const rafRef = useRef<number>(0);
  const prevPayment = useRef(0);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((data: Rate[]) => {
        if (Array.isArray(data) && data.length > 0) setRates(data);
      })
      .catch(() => {});
  }, []);

  const sorted = [...rates].sort((a, b) => a[fixKey] - b[fixKey]);
  const bestRate = sorted[0]?.[fixKey] ?? 4.79;
  const bestBank = sorted[0]?.bank ?? "";
  const targetPayment = anuita(amount, bestRate, term);

  useEffect(() => {
    const from = prevPayment.current;
    const to = targetPayment;
    prevPayment.current = to;
    let start: number | null = null;

    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 350, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPayment(from + (to - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetPayment]);

  const payments = sorted.map((r) => anuita(amount, r[fixKey], term));
  const minP = payments[0] ?? 1;
  const maxP = payments[payments.length - 1] ?? 1;

  return (
    <section id="kalkulacka" className="py-20 px-4 bg-[#f2f0ed]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#b1004d] text-sm font-medium uppercase tracking-widest mb-2">
            Hypoteční kalkulačka
          </p>
          <h2 className="font-display text-4xl font-bold text-[#0D1117]">
            Spočítejte svou hypotéku
          </h2>
          <p className="text-[#0D1117]/50 mt-2 text-sm">
            Orientační sazby z 50+ partnerských institucí. Aktualizováno{" "}
            {new Date().toLocaleDateString("cs-CZ")}.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sliders + result */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <SliderField
              label="Výše úvěru"
              value={amount}
              min={500_000}
              max={15_000_000}
              step={100_000}
              display={`${fmtCzk(amount)} Kč`}
              onChange={setAmount}
            />
            <SliderField
              label="Doba splácení"
              value={term}
              min={5}
              max={30}
              step={1}
              display={`${term} let`}
              onChange={setTerm}
            />

            <div>
              <label className="text-sm font-medium text-[#0D1117] block mb-2">
                Délka fixace
              </label>
              <div className="flex gap-2 flex-wrap">
                {FIX_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setFixKey(o.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      fixKey === o.key
                        ? "bg-[#b1004d] text-white"
                        : "bg-[#f2f0ed] text-[#0D1117] hover:bg-[#e0ddd8]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#f2f0ed] rounded-xl">
              <div className="text-xs text-[#0D1117]/50 mb-1">
                Nejlepší měsíční splátka (orientačně)
              </div>
              <div className="font-display text-4xl font-bold text-[#0D1117]">
                {fmtCzk(displayPayment)}{" "}
                <span className="text-lg font-normal text-[#0D1117]/50">Kč/měs</span>
              </div>
              <div className="text-xs text-[#0D1117]/40 mt-1">
                při sazbě {bestRate.toFixed(2)} % p.a. · {bestBank}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-[#0D1117]/50 mb-5">
              Srovnání bank — fixace{" "}
              {FIX_OPTIONS.find((o) => o.key === fixKey)?.label}
            </h3>
            <div className="space-y-3">
              {sorted.slice(0, 7).map((r, i) => {
                const p = anuita(amount, r[fixKey], term);
                const range = maxP - minP || 1;
                const pct = Math.round(40 + ((p - minP) / range) * 55);
                const isFirst = i === 0;
                return (
                  <div key={r.bank} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-[#0D1117]/60 truncate flex-shrink-0">
                      {r.bank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`h-7 rounded-md flex items-center px-2.5 text-xs font-medium transition-all duration-300 ${
                          isFirst
                            ? "bg-[#b1004d] text-white"
                            : "bg-[#e0ddd8] text-[#0D1117]"
                        }`}
                        style={{ width: `${pct}%` }}
                      >
                        {fmtCzk(p)} Kč
                      </div>
                    </div>
                    <div className="text-xs text-[#0D1117]/40 w-10 text-right flex-shrink-0">
                      {r[fixKey].toFixed(2)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function SliderField({ label, value, min, max, step, display, onChange }: SliderFieldProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-[#0D1117]">{label}</label>
        <span className="font-display font-bold text-[#b1004d] text-sm">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#b1004d]"
      />
    </div>
  );
}
