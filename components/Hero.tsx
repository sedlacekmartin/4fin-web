"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FALLBACK_RATES, BANK_COLORS, anuita, fmtCzk, type Rate } from "@/lib/rates";

type FixKey = "fix_3" | "fix_5" | "fix_7" | "fix_10";

const FIX_OPTIONS: { label: string; key: FixKey }[] = [
  { label: "3 r.", key: "fix_3" },
  { label: "5 let", key: "fix_5" },
  { label: "7 let", key: "fix_7" },
  { label: "10 let", key: "fix_10" },
];


export default function Hero() {
  const [loan, setLoan] = useState(3_500_000);
  const [years, setYears] = useState(30);
  const [fixKey, setFixKey] = useState<FixKey>("fix_5");
  const [rates, setRates] = useState<Rate[]>(FALLBACK_RATES);
  const [displayPayment, setDisplayPayment] = useState(0);
  const rafRef = useRef<number>(0);
  const prevPayRef = useRef(0);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((data: Rate[]) => {
        if (Array.isArray(data) && data.length > 0) setRates(data);
      })
      .catch(() => {});
  }, []);

  const sorted = useMemo(
    () => [...rates].sort((a, b) => a[fixKey] - b[fixKey]),
    [rates, fixKey]
  );

  const bestRate = sorted[0]?.[fixKey] ?? 4.79;
  const targetPayment = anuita(loan, bestRate, years);
  const overpay = targetPayment * years * 12 - loan;
  const rmin = sorted[0]?.[fixKey] ?? 0;
  const rmax = sorted[sorted.length - 1]?.[fixKey] ?? 1;

  useEffect(() => {
    const from = prevPayRef.current;
    const to = targetPayment;
    prevPayRef.current = to;
    let start: number | null = null;
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 450, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayPayment(from + (to - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetPayment]);

  return (
    <header className="min-h-[92vh] grid md:grid-cols-[56fr_44fr]">

      {/* ──────────── DARK LEFT PANEL ──────────── */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-[#0D1117] px-8 py-16 md:pl-[max(2.5rem,calc((100vw-1200px)/2+2.5rem))] md:pr-14">

        {/* Radial glow — pink */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_20%_60%,rgba(214,0,108,0.10)_0%,transparent_70%)]" />
        {/* Radial glow — teal */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_20%,rgba(14,157,99,0.06)_0%,transparent_60%)]" />
        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-[530px]">

          {/* Status chips */}
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[0.77rem] font-semibold text-white/70">
              📍 Třebíč · Vysočina · Brno
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0E9D63]/25 bg-[#0E9D63]/10 px-3 py-1.5 text-[0.77rem] font-semibold text-[#0E9D63]">
              <span className="live-dot-ring relative inline-block h-[6px] w-[6px] rounded-full bg-[#0E9D63]" />
              Sazby ze dneška · {new Date().toLocaleDateString("cs-CZ")}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-black leading-[1.04] tracking-[-0.04em] text-white"
            style={{ fontSize: "clamp(2.6rem, 4.5vw, 4.2rem)" }}
          >
            Vaše hypotéka<br />
            může stát{" "}
            <span className="text-[#D6006C]">míň.</span>
          </h1>

          {/* Best rate callout */}
          <div className="mt-5 mb-5">
            <div className="mb-1 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-white/40">
              Nejnižší sazba dnes
            </div>
            <div
              className="font-display font-black tabular-nums leading-none text-[#D6006C]"
              style={{ fontSize: "clamp(3rem, 4.5vw, 4rem)" }}
            >
              {bestRate.toFixed(2).replace(".", ",")} %
            </div>
          </div>

          {/* Subheadline */}
          <p className="mb-8 max-w-[44ch] text-[1.05rem] leading-relaxed text-white/55">
            Srovnáme všechny banky a vyjednáme sazbu,
            na kterou sami nedosáhnete. Konzultace je zdarma.
          </p>

          {/* Social proof strip */}
          <div className="mb-8 flex gap-7 border-b border-white/10 pb-8">
            {[
              { n: "8+", label: "srovnaných bank" },
              { n: "0 Kč", label: "poplatek za sjednání" },
              { n: "100%", label: "nezávislý poradce" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="font-display font-black tabular-nums leading-none text-white" style={{ fontSize: "1.55rem" }}>
                  {n}
                </div>
                <div className="mt-0.5 text-[0.71rem] leading-snug text-white/35">{label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#D6006C] px-[22px] py-[13px] text-[0.95rem] font-semibold text-white shadow-[0_4px_20px_rgba(214,0,108,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#A80055]"
            >
              Chci nabídku na míru
            </a>
            <a
              href="#sazby"
              className="inline-flex items-center gap-2 rounded-[10px] border border-white/15 bg-white/8 px-[22px] py-[13px] text-[0.95rem] font-semibold text-white transition-colors hover:bg-white/14"
            >
              Přehled sazeb
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-6 flex flex-wrap gap-4 text-[0.81rem] text-white/40">
            {["Srovnání všech bank", "Bez poplatku za sjednání", "Reálná sazba na míru"].map((t) => (
              <span key={t}>
                <span className="text-[#0E9D63]">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────── RIGHT PANEL ──────────── */}
      <div className="relative flex items-center justify-center overflow-hidden bg-[#0D1117] px-6 py-12 md:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_50%,rgba(214,0,108,0.07)_0%,transparent_70%)]" />
        <div
          id="kalkulacka"
          className="w-full max-w-[440px] overflow-hidden rounded-[20px] bg-white shadow-[0_8px_48px_rgba(13,17,23,0.11)]"
        >
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-[#E6E8EC] px-6 py-[18px]">
            <span className="font-display font-semibold text-[1rem]">Hypoteční kalkulačka</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E3F4EC] px-2.5 py-1 text-[0.72rem] font-semibold text-[#0E9D63]">
              <span className="live-dot-ring relative inline-block h-[7px] w-[7px] rounded-full bg-[#0E9D63]" />
              Live sazby
            </span>
          </div>

          {/* Card body */}
          <div className="space-y-[18px] p-6">

            {/* Loan slider */}
            <div>
              <div className="mb-[9px] flex items-baseline justify-between">
                <label className="text-[0.85rem] font-medium text-[#697586]">Výše úvěru</label>
                <span className="font-display font-semibold">{fmtCzk(loan)} Kč</span>
              </div>
              <input type="range" min={500_000} max={12_000_000} step={100_000}
                value={loan} onChange={(e) => setLoan(Number(e.target.value))} />
            </div>

            {/* Years slider */}
            <div>
              <div className="mb-[9px] flex items-baseline justify-between">
                <label className="text-[0.85rem] font-medium text-[#697586]">Doba splácení</label>
                <span className="font-display font-semibold">{years} let</span>
              </div>
              <input type="range" min={5} max={35} step={1}
                value={years} onChange={(e) => setYears(Number(e.target.value))} />
            </div>

            {/* Fix toggle */}
            <div>
              <div className="mb-[9px] flex items-baseline justify-between">
                <label className="text-[0.85rem] font-medium text-[#697586]">Fixace</label>
                <span className="font-display font-semibold">
                  {FIX_OPTIONS.find((o) => o.key === fixKey)?.label}
                </span>
              </div>
              <div className="flex gap-1.5">
                {FIX_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setFixKey(o.key)}
                    className={`flex-1 rounded-lg border py-[9px] text-[0.84rem] font-semibold transition-all ${
                      fixKey === o.key
                        ? "border-[#0D1117] bg-[#0D1117] text-white"
                        : "border-[#D9DCE1] bg-white text-[#697586] hover:bg-[#F6F7F9]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result box */}
            <div className="rounded-xl bg-[#F6F7F9] p-[18px]">
              <div>
                <div className="text-[0.8rem] text-[#697586]">Orientační měsíční splátka</div>
                <div
                  className="font-display font-bold leading-none tracking-[-0.03em] mt-1.5"
                  style={{ fontSize: "2.7rem" }}
                >
                  {fmtCzk(displayPayment)}{" "}
                  <small className="text-[0.95rem] font-medium text-[#697586]">Kč</small>
                </div>
              </div>

              <div className="mt-[14px] flex gap-6 border-t border-[#E6E8EC] pt-[14px]">
                <div>
                  <span className="block text-[0.72rem] text-[#697586]">Nejnižší sazba</span>
                  <strong className="font-display font-semibold tabular-nums text-[1.02rem]">
                    {bestRate.toFixed(2).replace(".", ",")} %
                  </strong>
                </div>
                <div>
                  <span className="block text-[0.72rem] text-[#697586]">Přeplatek</span>
                  <strong className="font-display font-semibold tabular-nums text-[1.02rem]">
                    {fmtCzk(overpay)} Kč
                  </strong>
                </div>
              </div>

              {/* Bank bars */}
              <div className="mt-4 space-y-[7px]">
                {sorted.slice(0, 4).map((r, i) => {
                  const w = 18 + (1 - (r[fixKey] - rmin) / ((rmax - rmin) || 1)) * 82;
                  const isTop = i === 0;
                  return (
                    <div
                      key={r.bank}
                      className="grid items-center gap-2.5 text-[0.82rem]"
                      style={{ gridTemplateColumns: "108px 1fr auto" }}
                    >
                      <span className={`truncate ${isTop ? "font-semibold text-[#0D1117]" : "text-[#3A424E]"}`}>
                        {r.bank}
                      </span>
                      <div className="h-2 overflow-hidden rounded-full bg-[#EEF0F3]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${w.toFixed(0)}%`, backgroundColor: isTop ? "#D6006C" : "#D9DCE1" }}
                        />
                      </div>
                      <span className={`font-display font-semibold tabular-nums ${isTop ? "text-[#D6006C]" : "text-[#3A424E]"}`}>
                        {r[fixKey].toFixed(2).replace(".", ",")}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 text-[0.74rem] text-[#697586]">
            Orientační výpočet z dnešních sazeb. Reálná nabídka závisí na LTV, fixaci a příjmech.
          </div>
        </div>
      </div>
    </header>
  );
}
