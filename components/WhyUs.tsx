const REASONS = [
  {
    value: "50+",
    label: "partnerských institucí",
    description:
      "Spolupracujeme s více než 50 bankami, pojišťovnami a investičními společnostmi — od Allianz, ČSOB a KB po NN a Generali.",
  },
  {
    value: "1 hovor",
    label: "stačí na začátek",
    description:
      "Žádné papíry navíc, žádné zdlouhavé schůzky. Po prvním hovoru víme, co potřebujete, a zpracujeme vše za vás.",
  },
  {
    value: "0 Kč",
    label: "naše odměna od vás",
    description:
      "Náš poradenský servis je pro klienty bezplatný. Jsme odměňováni bankami a pojišťovnami — ne vámi.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-20 px-4 bg-[#0D1117] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D6006C] text-sm font-medium uppercase tracking-widest mb-2">
            Proč 4fin
          </p>
          <h2 className="font-display text-4xl font-bold">
            Tři důvody, proč nás klienti doporučují
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {REASONS.map((r) => (
            <div key={r.value} className="text-center md:text-left">
              <div className="font-display text-6xl font-bold text-[#D6006C] mb-2">
                {r.value}
              </div>
              <div className="font-display text-xl font-semibold text-white mb-4">
                {r.label}
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
