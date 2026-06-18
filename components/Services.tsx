const SERVICES = [
  {
    id: "hypoteky",
    emoji: "🏠",
    bg: "#f5e0e9",
    title: "Hypotéky a bydlení",
    desc: "Srovnáme banky a vyjednáme nejlepší sazbu — ať kupujete, stavíte nebo refinancujete. Vlastní realitní kancelář zajistí i samotný převod nemovitosti.",
    cta: "Chci srovnání hypoték →",
  },
  {
    id: "investice",
    emoji: "📈",
    bg: "#E3F4EC",
    title: "Investice a spoření",
    desc: "Nastavíme pravidelné investování a rezervy přesně podle vašich cílů a časového horizontu. Bez produktů 'na sílu' — jen to, co vám skutečně přinese výnos.",
    cta: "Probrat možnosti →",
  },
  {
    id: "pojisteni",
    emoji: "🛡️",
    bg: "#f2f0ed",
    title: "Pojištění a ochrana",
    desc: "Projdeme vaše smlouvy a řekneme rovnou, za co platíte zbytečně a kde chybí krytí. Pojistíme příjem, majetek i odpovědnost — nezávisle.",
    cta: "Prověřit smlouvy →",
  },
  {
    id: "penze",
    emoji: "🎯",
    bg: "#EEF2FF",
    title: "Penze a budoucnost",
    desc: "Čím dříve začnete, tím lépe. Nastavíme penzijní spoření, zabezpečení pro děti i dlouhodobý finanční plán — aby vás budoucnost nezaskočila.",
    cta: "Naplánovat budoucnost →",
  },
  {
    id: "uvery",
    emoji: "💳",
    bg: "#f2f0ed",
    title: "Správa a refinancování úvěrů",
    desc: "Máte více půjček nebo drahý úvěr? Pomůžeme s refinancováním, konsolidací a optimalizací splácení — někdy i malá změna sazby znamená velkou úsporu.",
    cta: "Zanalyzovat úvěry →",
  },
  {
    id: "plan",
    emoji: "📋",
    bg: "#f5e0e9",
    title: "Finanční plán na míru",
    desc: "Propojíme vaše příjmy, výdaje, cíle a životní situaci do jednoho přehledného plánu. Víte, kde stojíte a co dělat dál.",
    cta: "Sestavit plán →",
  },
];

export default function Services() {
  return (
    <section id="sluzby" className="py-[88px] px-7 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-11">
          <div className="text-[0.78rem] font-semibold text-[#b1004d] uppercase tracking-widest mb-3">
            S čím pomáháme
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em]"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Jeden tým. Celý váš finanční život.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-[#e0ddd8] rounded-[14px] p-7 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(13,17,23,0.07)] hover:border-[#e0ddd8] transition-all cursor-pointer"
            >
              <div
                className="w-11 h-11 rounded-[11px] grid place-items-center text-[1.3rem] mb-4"
                style={{ background: s.bg }}
              >
                {s.emoji}
              </div>
              <h3 className="font-display text-[1.22rem] font-semibold mb-2">{s.title}</h3>
              <p className="text-[#3A424E] text-[0.95rem] leading-relaxed mb-4">{s.desc}</p>
              <span className="text-[0.9rem] font-semibold text-[#b1004d] inline-flex gap-1.5 transition-[gap] hover:gap-2.5">
                {s.cta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
