"use client";

import { useState, useMemo } from "react";
import { anuita, fmtCzk, fmtMil, FALLBACK_RATES } from "@/lib/rates";

function remainingDebt(P: number, rY: number, nY: number, yearsElapsed: number): number {
  const r = rY / 100 / 12;
  const n = nY * 12;
  const paid = yearsElapsed * 12;
  if (paid >= n) return 0;
  if (r === 0) return P - (P / n) * paid;
  return (P * (Math.pow(1 + r, n) - Math.pow(1 + r, paid))) / (Math.pow(1 + r, n) - 1);
}

function investValue(monthly: number, rY: number, years: number): number {
  const r = rY / 100 / 12;
  const months = years * 12;
  if (r === 0) return monthly * months;
  return monthly * ((Math.pow(1 + r, months) - 1) / r);
}

const DEFAULT_RATE = FALLBACK_RATES.sort((a, b) => a.fix_5 - b.fix_5)[0]?.fix_5 ?? 4.79;

export default function DualCalculator() {
  const [loanAmount, setLoanAmount] = useState(3_500_000);
  const [loanRate, setLoanRate] = useState(DEFAULT_RATE);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyInvest, setMonthlyInvest] = useState(4_000);
  const [returnRate, setReturnRate] = useState(7);

  const monthlyPayment = anuita(loanAmount, loanRate, loanTerm);
  const payment20y = anuita(loanAmount, loanRate, 20);
  const diffVs20y = payment20y - monthlyPayment;

  const { data, breakEven } = useMemo(() => {
    const pts = [];
    for (let y = 0; y <= loanTerm; y++) {
      pts.push({
        year: y,
        debt: remainingDebt(loanAmount, loanRate, loanTerm, y),
        investment: investValue(monthlyInvest, returnRate, y),
      });
    }
    let be: number | null = null;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1], curr = pts[i];
      if (prev.investment < prev.debt && curr.investment >= curr.debt) {
        const d0 = prev.debt - prev.investment;
        const d1 = curr.investment - curr.debt;
        be = (i - 1) + d0 / (d0 + d1);
        break;
      }
    }
    return { data: pts, breakEven: be };
  }, [loanAmount, loanRate, loanTerm, monthlyInvest, returnRate]);

  /* SVG chart */
  const W = 720, H = 320;
  const pad = { l: 54, r: 18, t: 18, b: 30 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const maxVal = Math.max(loanAmount, ...data.map((d) => d.investment), 1) * 1.05;

  const X = (y: number) => pad.l + (y / loanTerm) * iw;
  const Y = (v: number) => pad.t + ih - (v / maxVal) * ih;
  const ptsStr = (arr: number[]) =>
    arr.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");

  const debtArr = data.map((d) => d.debt);
  const invArr = data.map((d) => d.investment);

  const bx = breakEven !== null ? X(breakEven) : 0;
  const beDebt = breakEven !== null ? remainingDebt(loanAmount, loanRate, loanTerm, breakEven) : 0;
  const by = breakEven !== null ? Y(beDebt) : 0;

  const xAxisYears = [0, Math.round(loanTerm / 4), Math.round(loanTerm / 2), Math.round((loanTerm * 3) / 4), loanTerm];

  const totalPaid = monthlyPayment * loanTerm * 12;
  const finalInvestment = data[loanTerm]?.investment ?? 0;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Měsíční splátka", val: fmtCzk(monthlyPayment) + " Kč", c: "#0D1117" },
          { label: "Přeplatek na úrocích", val: fmtMil(totalPaid - loanAmount), c: "#D6006C" },
          { label: breakEven !== null ? "Doplatit v roce" : "Bod zlomu", val: breakEven !== null ? breakEven.toFixed(1) + " let" : "Nedosaženo", c: "#0D1117" },
        ].map((k) => (
          <div key={k.label} className="border border-[#E6E8EC] rounded-xl p-4">
            <span className="text-[0.72rem] text-[#697586] block mb-1.5">{k.label}</span>
            <b className="font-display font-bold text-[1.6rem] leading-none" style={{ color: k.c }}>{k.val}</b>
          </div>
        ))}
      </div>

      {/* Hint */}
      {diffVs20y > 50 && (
        <div className="bg-[#E3F4EC] text-[#0E9D63] text-[0.79rem] px-3.5 py-2.5 rounded-[9px]">
          Tip: oproti 20leté splatnosti máte nižší splátku o ~{fmtCzk(diffVs20y)} Kč.
          Zkuste investovat právě tolik.
        </div>
      )}
      {diffVs20y <= 50 && loanTerm < 20 && (
        <div className="bg-[#F6F7F9] text-[#697586] text-[0.79rem] px-3.5 py-2.5 rounded-[9px]">
          Při kratší splatnosti je splátka vyšší — rozdíl k investování vzniká u delších dob.
        </div>
      )}

      {/* SVG Chart */}
      <div className="border border-[#E6E8EC] rounded-xl p-5 bg-white">
        <div className="flex gap-5 flex-wrap mb-2 text-[0.8rem] text-[#3A424E]">
          {[
            { c: "#D6006C", l: "Zbývající dluh" },
            { c: "#0E9D63", l: "Hodnota investice" },
            { c: "#0D1117", l: "Bod doplacení" },
          ].map((lg) => (
            <div key={lg.l} className="flex items-center gap-1.5 font-medium">
              <i className="inline-block w-4 h-0.5 rounded" style={{ background: lg.c }} />
              {lg.l}
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 260 }}>
          <defs>
            <linearGradient id="dcIg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E9D63" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#0E9D63" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={pad.l} y1={(pad.t + ih * (1 - f)).toFixed(1)}
              x2={W - pad.r} y2={(pad.t + ih * (1 - f)).toFixed(1)}
              stroke="rgba(13,17,23,.07)" strokeWidth="1"
            />
          ))}
          {/* Y labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <text
              key={`yl-${f}`}
              x={pad.l - 8}
              y={(pad.t + ih * (1 - f) + 4).toFixed(1)}
              textAnchor="end" fontSize="10" fill="#697586"
            >
              {((maxVal * f) / 1e6).toFixed(1).replace(".", ",")} mil
            </text>
          ))}
          <path
            d={`${invArr.map((v, i) => `${i === 0 ? "M" : "L"} ${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ")} L ${X(loanTerm).toFixed(1)} ${(pad.t + ih).toFixed(1)} L ${pad.l} ${(pad.t + ih).toFixed(1)} Z`}
            fill="url(#dcIg)"
          />
          <polyline points={ptsStr(debtArr)} fill="none" stroke="#D6006C" strokeWidth="2.6" />
          <polyline points={ptsStr(invArr)} fill="none" stroke="#0E9D63" strokeWidth="2.6" />
          {breakEven !== null && breakEven <= loanTerm && (
            <>
              <line x1={bx.toFixed(1)} y1={pad.t} x2={bx.toFixed(1)} y2={pad.t + ih} stroke="#0D1117" strokeWidth="1.4" strokeDasharray="4 4" />
              <circle cx={bx.toFixed(1)} cy={by.toFixed(1)} r="6" fill="#0D1117" stroke="#fff" strokeWidth="2.5" />
            </>
          )}
          {xAxisYears.map((yr) => (
            <text key={yr} x={X(yr).toFixed(1)} y={H - 10} textAnchor="middle" fontSize="10" fill="#697586">
              {yr} l.
            </text>
          ))}
        </svg>
      </div>

      {/* Sliders grid */}
      <div className="grid md:grid-cols-2 gap-5">
        <Slider label="Doba splácení" value={loanTerm} min={15} max={35} step={1}
          display={`${loanTerm} let`} color="#D6006C" onChange={setLoanTerm} />
        <Slider label="Měsíčně investuji" value={monthlyInvest} min={0} max={20_000} step={500}
          display={`${fmtCzk(monthlyInvest)} Kč`} color="#0E9D63" onChange={setMonthlyInvest} />
        <Slider label="Očekávaný výnos" value={returnRate} min={2} max={10} step={0.5}
          display={`${returnRate.toFixed(1).replace(".", ",")} % p.a.`} color="#0E9D63" onChange={setReturnRate} />
        <Slider label="Výše hypotéky" value={loanAmount} min={500_000} max={12_000_000} step={100_000}
          display={loanAmount >= 1_000_000 ? `${(loanAmount / 1_000_000).toFixed(1)} mil. Kč` : `${fmtCzk(loanAmount)} Kč`}
          color="#D6006C" onChange={setLoanAmount} />
        <Slider label="Úroková sazba" value={loanRate} min={1} max={10} step={0.1}
          display={`${loanRate.toFixed(2).replace(".", ",")} % p.a.`} color="#D6006C" onChange={setLoanRate} />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center gap-4 flex-wrap pt-4 border-t border-[#E6E8EC]">
        <p className="text-[0.75rem] text-[#697586] max-w-[50ch]">
          Modelový výpočet. Výnos investice není zaručen a kolísá, sazba se po fixaci mění.
          Ilustrace principu, ne investiční doporučení.
        </p>
        <a
          href="#kontakt"
          className="inline-flex items-center gap-2 bg-[#D6006C] text-white font-semibold text-[0.95rem] px-5 py-[11px] rounded-[10px] hover:bg-[#A80055] transition-all shadow-[0_4px_14px_rgba(214,0,108,0.25)] whitespace-nowrap"
        >
          Nastavit s poradcem →
        </a>
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  color: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, display, color, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-[9px]">
        <label className="text-[0.85rem] font-medium text-[#697586]">{label}</label>
        <span className="font-display font-semibold" style={{ color }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--tw-accent-color": color } as React.CSSProperties}
        className="w-full [accent-color:var(--tw-accent-color)]"
      />
    </div>
  );
}
