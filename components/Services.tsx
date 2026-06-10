const SERVICES = [
  {
    id: "hypoteky",
    emoji: "🏠",
    bg: "#FCE7F1",
    title: "Hypotéky a bydlení",
    desc: "Najdeme nejlevnější banku pro váš případ, vyřídíme papíry a u koupě či prodeje zapojíme vlastní realitní kancelář.",
    cta: "Spočítat a získat nabídku →",
  },
  {
    id: "investice",
    emoji: "📈",
    bg: "#E3F4EC",
    title: "Investice a rezervy",
    desc: "Nastavíme spoření a investice podle vašich cílů a času. Žádné produkty 'na sílu' — jen to, co dává smysl pro vás.",
    cta: "Probrat možnosti →",
  },
  {
    id: "pojisteni",
    emoji: "🛡️",
    bg: "#F6F7F9",
    title: "Pojištění",
    desc: "Projdeme vaše smlouvy a řekneme rovnou, za co platíte zbytečně a kde naopak chybí krytí. Nezávisle.",
    cta: "Prověřit smlouvy →",
  },
];

export default function Services() {
  return (
    <section id="sluzby" className="py-[88px] px-7 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-11">
          <div className="text-[0.78rem] font-semibold text-[#D6006C] uppercase tracking-widest mb-3">
            Co řešíme
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em]"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Jeden tým pro bydlení i peníze.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-[18px]">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-[#E6E8EC] rounded-[14px] p-7 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(13,17,23,0.07)] hover:border-[#D9DCE1] transition-all cursor-pointer"
            >
              <div
                className="w-11 h-11 rounded-[11px] grid place-items-center text-[1.3rem] mb-4"
                style={{ background: s.bg }}
              >
                {s.emoji}
              </div>
              <h3 className="font-display text-[1.22rem] font-semibold mb-2">{s.title}</h3>
              <p className="text-[#3A424E] text-[0.95rem] leading-relaxed mb-4">{s.desc}</p>
              <span className="text-[0.9rem] font-semibold text-[#D6006C] inline-flex gap-1.5 transition-[gap] hover:gap-2.5">
                {s.cta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
