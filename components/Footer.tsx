const LINKS = [
  { label: "Hypotéky", href: "#hypoteky" },
  { label: "Investice", href: "#investice" },
  { label: "Pojištění", href: "#hypoteky" },
  { label: "Tým", href: "#tym" },
  { label: "Pobočky", href: "#pobocky" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0D1117] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          <div>
            <div className="font-display text-xl font-bold mb-3">
              4fin <span className="text-[#D6006C]">·</span> Centrum Třebíč
            </div>
            <address className="not-italic text-white/50 text-sm leading-relaxed">
              Kubišova 1230/51
              <br />
              674 01 Třebíč
              <br />
              <a href="mailto:hana.roubcova@4fin.cz" className="hover:text-white transition-colors">
                hana.roubcova@4fin.cz
              </a>
            </address>
          </div>

          <div>
            <div className="text-sm font-semibold text-white/30 uppercase tracking-widest mb-4">
              Navigace
            </div>
            <ul className="space-y-2">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-white/30 uppercase tracking-widest mb-4">
              Kontakt
            </div>
            <div className="space-y-3">
              <a
                href="tel:+420736000000"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +420 736 XXX XXX
              </a>
              <a
                href="mailto:hana.roubcova@4fin.cz"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                hana.roubcova@4fin.cz
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Centrum 4fin Třebíč. Všechna práva vyhrazena.
          </p>
          <p className="text-white/30 text-xs">
            Výsledky kalkulaček jsou orientační a nezakládají právní nárok.
          </p>
        </div>
      </div>
    </footer>
  );
}
