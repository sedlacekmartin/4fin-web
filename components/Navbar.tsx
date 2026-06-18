"use client";

import { useState } from "react";

const NAV_LINKS = [
  { href: "#kalkulacka", label: "Propočet" },
  { href: "#sazby", label: "Sazby" },
  { href: "#sluzby", label: "Služby" },
  { href: "#proc", label: "Proč 4fin" },
  { href: "#pobocky", label: "Pobočky" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-[16px] border-b border-[#e0ddd8]">
      <div className="max-w-[1200px] mx-auto px-7 h-[66px] flex items-center justify-between">
        {/* Logo — 2 řádky */}
        <a href="/" className="flex flex-col leading-none">
          <span className="font-display font-bold text-[1.45rem] tracking-[-0.03em] text-[#0D1117]">
            4<b className="text-[#b1004d]">fin</b>
          </span>
          <span className="font-sans text-[0.62rem] font-semibold tracking-[0.07em] text-[#697586] uppercase mt-[1px]">
            Finanční &amp; realitní centrum · Třebíč
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-[30px]">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[0.93rem] font-medium text-[#697586] hover:text-[#0D1117] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#kontakt"
            className="inline-flex items-center gap-2 bg-[#b1004d] text-white font-semibold text-[0.95rem] px-5 py-2.5 rounded-[10px] hover:bg-[#8c1642] transition-all hover:-translate-y-px shadow-[0_4px_14px_rgba(177,0,77,0.25)]"
          >
            Poradit se zdarma
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-[#f2f0ed]"
          aria-label="Otevřít menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#e0ddd8] bg-white/95 backdrop-blur-[16px]">
          <div className="px-7 py-5 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[0.93rem] font-medium text-[#697586]"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#kontakt"
              onClick={() => setOpen(false)}
              className="bg-[#b1004d] text-white font-semibold text-[0.95rem] px-5 py-3 rounded-[10px] text-center"
            >
              Poradit se zdarma
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
