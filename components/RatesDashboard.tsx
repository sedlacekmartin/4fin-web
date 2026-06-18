"use client";

import { useState, useEffect } from "react";
import { FALLBACK_RATES, BANK_COLORS, type Rate } from "@/lib/rates";

function Tip({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="relative group/tip inline-block">
      <span className="border-b border-dashed border-[#697586] cursor-help text-[#0D1117] font-medium">
        {label}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-[9px] bg-[#0D1117] text-white text-[0.73rem] leading-snug px-3 py-2.5 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
        {tip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0D1117]" />
      </span>
    </span>
  );
}

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
          <div className="flex items-center gap-2 text-[0.78rem] font-semibold text-[#b1004d] mb-3">
            <span className="relative inline-block w-[7px] h-[7px] rounded-full bg-[#0E9D63] live-dot-ring" />
            Aktualizováno automaticky každý den.
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Sazby bank přehledně. Aktualizované každý den.
          </h2>
          <p className="text-[#3A424E] text-[1.06rem] max-w-[54ch]">
            Orientační úrokové sazby. Díky silné vyjednávací pozici jsme pro vás schopni zajistit lepší podmínky.
          </p>
        </div>

        <div className="bg-white border border-[#e0ddd8] rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(13,17,23,0.04)]">
          {loading ? (
            <div className="p-12 text-center text-[#697586] text-sm">Načítám sazby…</div>
          ) : (
            <div className="overflow-x-auto">
              {/* Header */}
              <div
                className="grid px-[22px] py-[14px] bg-[#f2f0ed] border-b border-[#e0ddd8] text-[0.74rem] font-semibold uppercase tracking-[0.04em] text-[#697586]"
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
                    className={`grid px-[22px] py-[15px] border-b border-[#e0ddd8] last:border-0 items-center text-[0.92rem] transition-colors hover:bg-[#f2f0ed] ${
                      isBest ? "bg-[#f5e0e9]" : ""
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
                        <span className="text-[0.62rem] font-bold bg-[#b1004d] text-white px-1.5 py-0.5 rounded-[5px]">
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
                              isMin ? "text-[#b1004d]" : "text-[#0D1117]"
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

        <div className="mt-5 rounded-[12px] border border-[#e0ddd8] bg-[#f2f0ed] px-5 py-4 text-[0.82rem] text-[#3A424E] leading-relaxed">
          <span className="font-semibold text-[#0D1117]">Výsledná sazba a výše splátky závisí na mnoha věcech</span>
          {" — konkrétně na "}
          <Tip label="LTV" tip="Kolik procent z hodnoty nemovitosti si půjčujete. Čím méně, tím lepší sazba — banka podstupuje nižší riziko." />
          {", "}
          <Tip label="výši a stabilitě příjmů" tip="Zaměstnanec na HPP dostane lepší podmínky než OSVČ. Záleží i na délce pracovního poměru a oboru." />
          {", "}
          <Tip label="DTI" tip="Celkový dluh (hypotéka + všechny ostatní úvěry) nesmí přesáhnout 8,5× váš roční čistý příjem." />
          {", "}
          <Tip label="DSTI" tip="Součet všech měsíčních splátek nesmí překročit 45 % vašeho čistého měsíčního příjmu." />
          {", "}
          <Tip label="délce a účelu úvěru" tip="Koupě bytu, výstavba, refinancování nebo rekonstrukce — každý účel má jiná pravidla. Delší splatnost = nižší splátka, ale více zaplatíte celkem." />
          {", "}
          <Tip label="typu a stavu nemovitosti" tip="Byt vs. dům, novostavba vs. starší, rekreační vs. trvalé bydlení — banka hodnotí každý typ jinak." />
          {", "}
          <Tip label="odhadní ceně" tip="Banka si nechá nemovitost nezávisle ocenit. Výsledná cena může být nižší než kupní — to ovlivní výši úvěru." />
          {", "}
          <Tip label="věku žadatele" tip="Součet vašeho věku a délky splatnosti zpravidla nesmí přesáhnout 70 let." />
          {", "}
          <Tip label="počtu žadatelů" tip="Dva žadatelé = vyšší společný příjem = lepší podmínky. Partneři nebo rodiče jako spolužadatelé jsou běžné." />
          {", "}
          <Tip label="pojištění" tip="Sjednání pojištění nemovitosti a schopnosti splácet (PPI) může zlepšit nabízenou sazbu." />
          {" nebo "}
          <Tip label="úvěrové historii" tip="Záznamy v bankovním registru o splácení předchozích úvěrů. Jeden výpadek splátky může zdražit hypotéku nebo ji zablokovat." />
          {". Přesnou nabídku sestavíme individuálně — "}
          <a
            href="#kontakt"
            className="font-semibold text-[#b1004d] border-b border-dashed border-[#b1004d] hover:opacity-75"
          >
            na bezplatné konzultaci →
          </a>
        </div>
      </div>
    </section>
  );
}
