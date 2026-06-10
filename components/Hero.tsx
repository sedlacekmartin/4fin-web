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

/* Decorative sparkline — rate trend over 12 months */
const SPARK = [5.4, 5.35, 5.3, 5.2, 5.1, 5.05, 4.95, 4.9, 4.85, 4.83, 4.8, 4.79];
const SP_W = 120, SP_H = 34;
const spMin = Math.min(...SPARK), spMax = Math.max(...SPARK);
const sparkPts = SPARK.map((v, i) => {
  const x = ((i / (SPARK.length - 1)) * SP_W).toFixed(1);
  const y = (SP_H - ((v - spMin) / (spMax - spMin)) * SP_H).toFixed(1);
  return `${x},${y}`;
}).join(" ");
const sparkLastY = (SP_H - ((SPARK[SPARK.length - 1] - spMin) / (spMax - spMin)) * SP_H).toFixed(1);

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

  /* Animated payment counter */
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
    <header className="py-[60px] md:py-[72px] px-7 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-[1fr_1.04fr] gap-[56px] items-center">

          {/* ── Left col ── */}
          <div>
            <div className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-[#A80055] bg-[#FCE7F1] px-3.5 py-1.5 rounded-full mb-[18px]">
              📍 Centrum 4fin Třebíč · působíme po celé Vysočině a v Brně
            </div>

            <div className="flex items-center gap-2 text-[0.78rem] font-semibold text-[#D6006C] mb-4">
              <span className="relative inline-block w-[7px] h-[7px] rounded-full bg-[#0E9D63] live-dot-ring" />
              Sazby aktualizovány dnes ·{" "}
              {new Date().toLocaleDateString("cs-CZ")}
            </div>

            <h1
              className="font-display font-bold tracking-[-0.03em] leading-[1.08] mt-[18px] mb-5"
              style={{ fontSize: "clamp(2.4rem, 4.6vw, 3.7rem)" }}
            >
              Vaše hypotéka může stát{" "}
              <span className="text-[#D6006C]">míň.</span>
            </h1>

            <p className="text-[#3A424E] text-[1.16rem] leading-relaxed max-w-[42ch] mb-7">
              Spočítejte si splátku z aktuálních sazeb bank. A pak ji díky chytrému
              rozložení splaťte roky dřív — bez vyšší splátky.
            </p>

            <div className="flex gap-3 flex-wrap mb-[30px]">
              <a
                href="#kontakt"
                className="inline-flex items-center gap-2 bg-[#D6006C] text-white font-semibold text-[0.95rem] px-[22px] py-[13px] rounded-[10px] hover:bg-[#A80055] transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(214,0,108,0.25)]"
              >
                Chci nabídku na míru
              </a>
              <a
                href="#sazby"
                className="inline-flex items-center gap-2 bg-white text-[#0D1117] font-semibold text-[0.95rem] px-[22px] py-[13px] rounded-[10px] border border-[#D9DCE1] hover:bg-[#F6F7F9] transition-colors"
              >
                Přehled sazeb
              </a>
            </div>

            <div className="flex gap-5 flex-wrap text-[0.86rem] text-[#697586]">
              {[
                ["Srovnání", "všech bank"],
                ["Bez poplatku", "za sjednání"],
                ["Reálná sazba", "na míru"],
              ].map(([bold, rest]) => (
                <span key={bold}>
                  <span className="text-[#0E9D63] font-bold">✓</span>{" "}
                  <strong className="text-[#0D1117]">{bold}</strong>{" "}
                  {rest}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right col: Calculator card ── */}
          <div
            id="kalkulacka"
            className="bg-white border border-[#E6E8EC] rounded-[18px] shadow-[0_4px_24px_rgba(13,17,23,0.07)] overflow-hidden"
          >
            {/* Card header */}
            <div className="px-[22px] py-[18px] border-b border-[#E6E8EC] flex justify-between items-center">
              <span className="font-display font-semibold text-[1rem]">Hypoteční kalkulačka</span>
              <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold bg-[#E3F4EC] text-[#0E9D63] px-2.5 py-1 rounded-lg">
                <span className="relative inline-block w-[7px] h-[7px] rounded-full bg-[#0E9D63] live-dot-ring" />
                Live sazby
              </span>
            </div>

            {/* Card body */}
            <div className="p-[22px] space-y-[18px]">
              {/* Loan slider */}
              <div>
                <div className="flex justify-between items-baseline mb-[9px]">
                  <label className="text-[0.85rem] font-medium text-[#697586]">Výše úvěru</label>
                  <span className="font-display font-semibold">{fmtCzk(loan)} Kč</span>
                </div>
                <input
                  type="range" min={500_000} max={12_000_000} step={100_000}
                  value={loan} onChange={(e) => setLoan(Number(e.target.value))}
                />
              </div>

              {/* Years slider */}
              <div>
                <div className="flex justify-between items-baseline mb-[9px]">
                  <label className="text-[0.85rem] font-medium text-[#697586]">Doba splácení</label>
                  <span className="font-display font-semibold">{years} let</span>
                </div>
                <input
                  type="range" min={5} max={35} step={1}
                  value={years} onChange={(e) => setYears(Number(e.target.value))}
                />
              </div>

              {/* Fix toggle */}
              <div>
                <div className="flex justify-between items-baseline mb-[9px]">
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
                      className={`flex-1 border rounded-lg py-[9px] text-[0.84rem] font-semibold transition-all ${
                        fixKey === o.key
                          ? "bg-[#0D1117] text-white border-[#0D1117]"
                          : "bg-white text-[#697586] border-[#D9DCE1] hover:bg-[#F6F7F9]"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result box */}
              <div className="bg-[#F6F7F9] rounded-xl p-[18px]">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[0.8rem] text-[#697586]">Orientační měsíční splátka</div>
                    <div className="font-display font-bold leading-none tracking-[-0.03em] mt-1.5" style={{ fontSize: "2.7rem" }}>
                      {fmtCzk(displayPayment)}{" "}
                      <small className="text-[0.95rem] font-medium text-[#697586]">Kč</small>
                    </div>
                  </div>
                  {/* Sparkline */}
                  <div className="text-right">
                    <svg width={SP_W} height={SP_H} className="overflow-visible">
                      <polyline points={sparkPts} fill="none" stroke="#0E9D63" strokeWidth="2" />
                      <circle cx={SP_W} cy={sparkLastY} r="3" fill="#0E9D63" />
                    </svg>
                    <div className="text-[10px] text-[#697586] mt-0.5">trend 12 m.</div>
                  </div>
                </div>

                {/* Sub-stats */}
                <div className="flex gap-6 mt-[14px] pt-[14px] border-t border-[#E6E8EC]">
                  <div>
                    <span className="text-[0.72rem] text-[#697586] block">Nejnižší sazba</span>
                    <strong className="font-display font-semibold text-[1.02rem] tabular-nums">
                      {bestRate.toFixed(2).replace(".", ",")} %
                    </strong>
                  </div>
                  <div>
                    <span className="text-[0.72rem] text-[#697586] block">Přeplatek</span>
                    <strong className="font-display font-semibold text-[1.02rem] tabular-nums">
                      {fmtCzk(overpay)} Kč
                    </strong>
                  </div>
                </div>

                {/* Bank bars — top 4, lower rate = longer bar */}
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
                        <span
                          className={`truncate ${isTop ? "text-[#0D1117] font-semibold" : "text-[#3A424E]"}`}
                        >
                          {r.bank}
                        </span>
                        <div className="h-2 bg-[#EEF0F3] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${w.toFixed(0)}%`,
                              backgroundColor: isTop ? "#D6006C" : "#D9DCE1",
                            }}
                          />
                        </div>
                        <span
                          className={`font-display font-semibold tabular-nums ${
                            isTop ? "text-[#D6006C]" : "text-[#3A424E]"
                          }`}
                        >
                          {r[fixKey].toFixed(2).replace(".", ",")}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-[22px] pb-[20px] text-[0.74rem] text-[#697586]">
              Orientační výpočet z dnešních sazeb. Reálná nabídka závisí na LTV, fixaci a příjmech.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
