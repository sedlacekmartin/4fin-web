"use client";

import { useState } from "react";
import DualCalculator from "@/components/DualCalculator";
import { anuita } from "@/lib/rates";

type GateState = "locked" | "loading" | "unlocked" | "error";

/* Static SVG preview — same chart logic, hardcoded values */
function PreviewChart() {
  const P = 3_500_000, rateY = 4.8, termY = 30, monthInv = 4_000, retY = 7;
  const rm = rateY / 100 / 12;
  const ri = retY / 100 / 12;
  const n = termY * 12;
  const pay = anuita(P, rateY, termY);

  const bal: number[] = [], inv: number[] = [];
  let beMonth = -1;
  for (let k = 0; k <= n; k++) {
    const b = Math.max(
      rm === 0 ? P - pay * k : P * Math.pow(1 + rm, k) - pay * ((Math.pow(1 + rm, k) - 1) / rm),
      0
    );
    const v = ri === 0 ? monthInv * k : monthInv * ((Math.pow(1 + ri, k) - 1) / ri);
    bal.push(b);
    inv.push(v);
    if (beMonth < 0 && v >= b && b > 0) beMonth = k;
  }

  const W = 720, H = 320;
  const pad = { l: 54, r: 18, t: 18, b: 30 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const ymax = Math.max(P, Math.max(...inv)) * 1.05;

  const X = (month: number) => pad.l + (month / n) * iw;
  const Y = (v: number) => pad.t + ih - (v / ymax) * ih;
  const pts = (arr: number[]) => arr.map((v, k) => `${X(k).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");

  const bx = beMonth > 0 ? X(beMonth) : 0;
  const by = beMonth > 0 ? Y(inv[beMonth]) : 0;

  return (
    <div className="bg-white border border-[#e0ddd8] rounded-xl p-5">
      <div className="flex gap-5 mb-3 text-[0.8rem] text-[#3A424E]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block w-4 h-0.5 bg-[#b1004d] rounded" /> Zbývající dluh
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block w-4 h-0.5 bg-[#0E9D63] rounded" /> Hodnota investice
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
        <defs>
          <linearGradient id="pvIg" x1="0" y1="0" x2="0" y2="1">
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
        <path
          d={`${inv.map((v, k) => `${k === 0 ? "M" : "L"} ${X(k).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ")} L ${X(n).toFixed(1)} ${(pad.t + ih).toFixed(1)} L ${pad.l} ${(pad.t + ih).toFixed(1)} Z`}
          fill="url(#pvIg)"
        />
        <polyline points={pts(bal)} fill="none" stroke="#b1004d" strokeWidth="2.6" />
        <polyline points={pts(inv)} fill="none" stroke="#0E9D63" strokeWidth="2.6" />
        {beMonth > 0 && (
          <>
            <line x1={bx.toFixed(1)} y1={pad.t} x2={bx.toFixed(1)} y2={pad.t + ih} stroke="#0D1117" strokeWidth="1.4" strokeDasharray="4 4" />
            <circle cx={bx.toFixed(1)} cy={by.toFixed(1)} r="6" fill="#0D1117" stroke="#fff" strokeWidth="2.5" />
          </>
        )}
      </svg>
    </div>
  );
}

export default function InvestmentTeaser() {
  const [gate, setGate] = useState<GateState>("locked");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [validErr, setValidErr] = useState("");

  async function handleUnlock() {
    setValidErr("");
    if (!name.trim() || !phone.trim()) {
      setValidErr("Vyplňte prosím jméno a telefon.");
      return;
    }
    setGate("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone,
          topic: "Investiční analýza",
          note: "Lead gate — dvojkalkulačka",
        }),
      });
      if (!res.ok) throw new Error();
      setGate("unlocked");
    } catch {
      setGate("error");
    }
  }

  return (
    <section className="py-[88px] px-7 bg-white" style={{ paddingTop: 0 }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-11">
          <div className="text-[0.78rem] font-semibold text-[#b1004d] uppercase tracking-widest mb-3">
            Strategie pro vás
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Předčasné splacení hypotéky
          </h2>
        </div>

        <div className="bg-white border border-[#e0ddd8] rounded-[18px] overflow-hidden shadow-[0_4px_24px_rgba(13,17,23,0.07)]">
          {gate === "unlocked" ? (
            <div className="p-[34px]">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="font-display text-[1.4rem] font-bold">
                  Splaťte dříve díky investování rozdílu
                </h3>
                <span className="text-[0.72rem] font-bold bg-[#f5e0e9] text-[#8c1642] px-2 py-0.5 rounded-lg">
                  Orientační
                </span>
              </div>
              <p className="text-[#3A424E] text-[0.96rem] mb-7 max-w-[66ch]">
                Nastavte si delší splatnost a kolik měsíčně investujete. Graf ukáže, kdy
                hodnota investice dohoní zbývající dluh — to je bod, od kterého byste mohli
                hypotéku celou doplatit.
              </p>
              <DualCalculator />
            </div>
          ) : (
            <div className="p-[34px] grid md:grid-cols-[1.1fr_1fr] gap-[34px] items-center bg-gradient-to-b from-white to-[#f2f0ed]">
              {/* Left */}
              <div>
                <div className="w-[42px] h-[42px] rounded-[11px] bg-[#f5e0e9] text-[#8c1642] grid place-items-center text-[1.1rem] mb-4">
                  🔒
                </div>
                <h3
                  className="font-display font-bold mb-3 max-w-[20ch] tracking-[-0.02em]"
                  style={{ fontSize: "1.6rem" }}
                >
                  Splaťte hypotéku{" "}
                  <span className="text-[#b1004d]">o roky dřív</span> — bez vyšší
                  splátky.
                </h3>
                <p className="text-[#3A424E] text-[1rem] mb-2 max-w-[48ch]">
                  Zvolíte delší splatnost (nižší splátku) a ten{" "}
                  <strong>rozdíl</strong> každý měsíc investujete. Výnos pracuje za
                  vás a nasčítaná částka dokáže zbytek hypotéky doplatit dřív.
                </p>
                <p className="text-[#b1004d] font-semibold text-[1rem] mb-5">
                  Odemkněte interaktivní propočet s grafem a bodem zlomu — zdarma,
                  na vaše čísla.
                </p>

                <div className="flex flex-col gap-2.5 max-w-[440px]">
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Jméno"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 border border-[#e0ddd8] rounded-[10px] px-[14px] py-3 text-[0.96rem] bg-white focus:outline-none focus:border-[#b1004d] focus:shadow-[0_0_0_3px_#f5e0e9] transition-all"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                      className="flex-1 border border-[#e0ddd8] rounded-[10px] px-[14px] py-3 text-[0.96rem] bg-white focus:outline-none focus:border-[#b1004d] focus:shadow-[0_0_0_3px_#f5e0e9] transition-all"
                    />
                  </div>
                  {validErr && <p className="text-red-500 text-xs">{validErr}</p>}
                  {gate === "error" && (
                    <p className="text-red-500 text-xs">Chyba při odesílání. Zkuste znovu.</p>
                  )}
                  <button
                    onClick={handleUnlock}
                    disabled={gate === "loading"}
                    className="inline-flex justify-center items-center gap-2 bg-[#b1004d] text-white font-semibold text-[0.95rem] px-5 py-[13px] rounded-[10px] hover:bg-[#8c1642] transition-all shadow-[0_4px_14px_rgba(177,0,77,0.25)] disabled:opacity-60"
                  >
                    {gate === "loading" ? "Odesílám…" : "Odemknout propočet zdarma →"}
                  </button>
                  <span className="text-[0.74rem] text-[#697586]">
                    Po odeslání se hned otevře kalkulačka a poradce vám pošle propočet
                    na míru. Vše orientační, bez závazku.
                  </span>
                </div>
              </div>

              {/* Right: blurred preview */}
              <div className="relative rounded-xl overflow-hidden">
                <div
                  className="opacity-50 pointer-events-none select-none"
                  style={{ filter: "blur(7px)" }}
                  aria-hidden="true"
                >
                  <PreviewChart />
                </div>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-[1.8rem]">🔒</div>
                    <strong className="font-display font-semibold text-sm">Náhled propočtu</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
