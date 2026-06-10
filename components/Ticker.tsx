"use client";

import { useState, useEffect } from "react";
import { FALLBACK_RATES, BANK_COLORS, type Rate } from "@/lib/rates";

export default function Ticker() {
  const [rates, setRates] = useState<Rate[]>(FALLBACK_RATES);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((data: Rate[]) => {
        if (Array.isArray(data) && data.length > 0) setRates(data);
      })
      .catch(() => {});
  }, []);

  const sorted = [...rates].sort((a, b) => a.fix_5 - b.fix_5);
  const dateStr = new Date().toLocaleDateString("cs-CZ");

  const items = sorted.map((r) => (
    <span
      key={r.bank}
      className="inline-flex items-center gap-2 px-[22px] py-[9px] text-[0.8rem] border-r border-[#E6E8EC]"
    >
      <span
        className="w-2 h-2 rounded-[3px] flex-shrink-0"
        style={{ backgroundColor: BANK_COLORS[r.bank] ?? "#9AA0A6" }}
      />
      <span className="text-[#697586]">{r.bank}</span>
      <strong className="font-display font-semibold text-[#0D1117] tabular-nums">
        {r.fix_5.toFixed(2).replace(".", ",")} %
      </strong>
      <span className="text-[#0E9D63] text-[0.72rem]">▾</span>
    </span>
  ));

  return (
    <div className="border-b border-[#E6E8EC] bg-[#F6F7F9] overflow-hidden">
      <div
        className="inline-flex whitespace-nowrap"
        style={{ animation: "ticker-scroll 40s linear infinite" }}
      >
        {/* Date marker */}
        <span className="inline-flex items-center gap-2 px-[22px] py-[9px] text-[0.8rem] border-r border-[#E6E8EC]">
          <span className="relative inline-block w-[7px] h-[7px] rounded-full bg-[#0E9D63] live-dot-ring" />
          <span className="text-[#697586]">Sazby k {dateStr}</span>
        </span>
        {items}
        {/* Duplicate for seamless loop */}
        <span className="inline-flex items-center gap-2 px-[22px] py-[9px] text-[0.8rem] border-r border-[#E6E8EC]">
          <span className="relative inline-block w-[7px] h-[7px] rounded-full bg-[#0E9D63] live-dot-ring" />
          <span className="text-[#697586]">Sazby k {dateStr}</span>
        </span>
        {items}
      </div>
    </div>
  );
}
