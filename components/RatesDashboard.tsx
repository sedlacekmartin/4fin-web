"use client";

import { useState, useEffect } from "react";
import { FALLBACK_RATES, BANK_COLORS, type Rate } from "@/lib/rates";

const COLS = [
  { key: "fix_3" as const, label: "Fix 3 roky", hide: "hidden md:block" },
  { key: "fix_5" as const, label: "Fix 5 let", hide: "" },
  { key: "fix_7" as const, label: "Fix 7 let", hide: "hidden lg:block" },
  { key: "fix_10" as const, label: "Fix 10 let", hide: "hidden lg:block" },
];

export default function RatesDashboard() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((data: Rate[]) => {
        setRates(Array.isArray(data) && data.length > 0 ? data : FALLBACK_RATES);
      })
      .catch(() => setRates(FALLBACK_RATES))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...rates].sort((a, b) => a.fix_5 - b.fix_5);

  const mins = COLS.reduce(
    (acc, c) => ({
      ...acc,
      [c.key]: Math.min(...rates.map((r) => r[c.key])),
    }),
    {} as Record<string, number>
  );

  return (
    <section id="sazby" className="py-[88px] px-7 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-11">
          <div className="flex items-center gap-2 text-[0.78rem] font-semibold text-[#D6006C] mb-3">
            <span className="relative inline-block w-[7px] h-[7px] rounded-full bg-[#0E9D63] live-dot-ring" />
            Aktualizováno automaticky
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Sazby bank, přehledně a denně.
          </h2>
          <p className="text-[#3A424E] text-[1.06rem] max-w-[54ch]">
            Stahujeme je z veřejných webů bank každé ráno. Jsou orientační —
            vaši reálnou nabídku vyjednáme individuálně.
          </p>
        </div>

        <div className="bg-white border border-[#E6E8EC] rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(13,17,23,0.04)]">
          {loading ? (
            <div className="p-12 text-center text-[#697586] text-sm">Načítám sazby…</div>
          ) : (
            <div className="overflow-x-auto">
              {/* Header */}
              <div
                className="grid px-[22px] py-[14px] bg-[#F6F7F9] border-b border-[#E6E8EC] text-[0.74rem] font-semibold uppercase tracking-[0.04em] text-[#697586]"
                style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}
              >
                <span>Banka</span>
                {COLS.map((c) => (
                  <span key={c.key} className={`text-right ${c.hide}`}>
                    {c.label}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {sorted.map((r, i) => {
                const isBest = i === 0;
                return (
                  <div
                    key={r.bank}
                    className={`grid px-[22px] py-[15px] border-b border-[#E6E8EC] last:border-0 items-center text-[0.92rem] transition-colors hover:bg-[#F6F7F9] ${
                      isBest ? "bg-[#FCE7F1]" : ""
                    }`}
                    style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}
                  >
                    {/* Bank name with color dot */}
                    <div className="flex items-center gap-2.5 font-medium">
                      <span
                        className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0"
                        style={{ backgroundColor: BANK_COLORS[r.bank] ?? "#9AA0A6" }}
                      />
                      <span className={isBest ? "text-[#0D1117] font-semibold" : "text-[#0D1117]"}>
                        {r.bank}
                      </span>
                      {isBest && (
                        <span className="text-[0.62rem] font-bold bg-[#D6006C] text-white px-1.5 py-0.5 rounded-[5px]">
                          NEJNIŽŠÍ
                        </span>
                      )}
                    </div>

                    {/* Rate columns */}
                    {COLS.map((c) => {
                      const isMin = r[c.key] === mins[c.key];
                      return (
                        <div key={c.key} className={`text-right ${c.hide}`}>
                          <span
                            className={`font-display font-semibold tabular-nums ${
                              isMin ? "text-[#D6006C]" : "text-[#0D1117]"
                            }`}
                          >
                            {r[c.key].toFixed(2).replace(".", ",")} %
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[#697586] text-[0.82rem] mt-4">
          Sazby jsou orientační a mění se denně. Konkrétní nabídku získáte na bezplatné konzultaci.
        </p>
      </div>
    </section>
  );
}
