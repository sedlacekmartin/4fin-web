const STEPS = [
  {
    num: "01",
    title: "Zavolejte nebo napište",
    desc: "Popíšete nám svou situaci — co plánujete, výši úvěru, termín. Stačí pět minut.",
    note: "Funguje i přes formulář níže nebo e-mailem.",
    icon: "💬",
  },
  {
    num: "02",
    title: "Dostanete srovnání na míru",
    desc: "Do 24 hodin máte přehled reálných nabídek od bank přizpůsobený vaší situaci. S konkrétní splátkou, přeplatkem a doporučením.",
    note: "Ne obecné sazby z internetu — nabídky pro vás.",
    icon: "📊",
  },
  {
    num: "03",
    title: "Vyberete a podepíšete",
    desc: "Vyberete nabídku, která vám sedí. Papíry, komunikaci s bankou a všechnu administrativu vyřídíme my.",
    note: "Vy přijdete jen podepsat — k nám do Třebíče, Brna nebo Náměšti.",
    icon: "✅",
  },
  {
    num: "04",
    title: "Jsme tu i potom",
    desc: "Nespoléháme se na to, že se ozvete sami. Sledujeme trh a před každou refixací, změnou situace nebo lepší příležitostí vás kontaktujeme jako první.",
    note: "Pravidelný servis a aktualizace plánu zdarma.",
    icon: "🔄",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-[88px] px-7 bg-[#f2f0ed]">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-14 max-w-[540px]">
          <div className="text-[0.78rem] font-semibold text-[#b1004d] uppercase tracking-widest mb-3">
            Jak to funguje
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Jednoduché. Rychlé. Zdarma.
          </h2>
          <p className="text-[#3A424E] text-[1.05rem] leading-relaxed">
            Od prvního kontaktu po podpis smlouvy — průměrně 2 týdny
            a minimum vašeho času.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-6 md:gap-8 relative">

          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-[28px] left-[calc(25%+16px)] right-[calc(25%+16px)] h-px bg-[#e0ddd8]" />

          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">

              {/* Step number bubble */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-[#e0ddd8] flex items-center justify-center flex-shrink-0 shadow-sm relative z-10">
                  <span className="font-display font-black text-[#b1004d] text-[0.95rem]">
                    {step.num}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="md:hidden h-px flex-1 bg-[#e0ddd8]" />
                )}
              </div>

              {/* Content */}
              <div className="pl-1">
                <div className="text-[1.2rem] mb-2">{step.icon}</div>
                <h3 className="font-display font-bold text-[1.18rem] text-[#0D1117] mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-[#3A424E] text-[0.95rem] leading-relaxed mb-3">
                  {step.desc}
                </p>
                <p className="text-[0.8rem] text-[#697586] italic">
                  {step.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="#kontakt"
            className="inline-flex items-center gap-2 bg-[#0D1117] text-white font-semibold text-[0.97rem] px-7 py-[14px] rounded-[11px] hover:bg-[#1a2230] transition-all hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(13,17,23,0.18)]"
          >
            Začít prvním krokem →
          </a>
          <p className="text-[0.8rem] text-[#697586] mt-3">
            Žádný závazek. Bez poplatku.
          </p>
        </div>
      </div>
    </section>
  );
}
