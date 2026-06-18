const PROOFS = [
  {
    value: "50+",
    label: "partnerských institucí",
    description:
      "11 bank, 22 pojišťoven, 24 investičních společností a 8 penzijních fondů. Díky tomu vám nenabídneme jednu možnost — nabídneme tu nejlepší.",
    color: "#b1004d",
  },
  {
    value: "5 000+",
    label: "spokojených klientů",
    description:
      "Za roky praxe jsme pomohli tisícům rodin s hypotékou, pojistkou nebo investicí. Nejvíc klientů přichází na doporučení.",
    color: "#0E9D63",
  },
  {
    value: "0 Kč",
    label: "naše odměna od vás",
    description:
      "Poradenský servis je pro klienty bezplatný. Jsme odměňováni institucemi za zprostředkování — ne vámi. Náš zájem je váš zájem.",
    color: "#4338CA",
  },
];

const TESTIMONIALS = [
  {
    quote: "Banka mi nabídla 5,3 %. Poradce z 4fin domluvil 4,7 %. Na třicet let je to obrovský rozdíl.",
    author: "Martin K., Třebíč",
    topic: "Hypotéka 4,2 mil. Kč",
  },
  {
    quote: "Neměl jsem čas obíhat banky. 4fin mi poslali srovnání přes WhatsApp a já si vybral. Jednodušší než jsem čekal.",
    author: "Jana P., Jihlava",
    topic: "Refinancování hypotéky",
  },
  {
    quote: "Pojistky jsem měl nastavené špatně roky. Jedna konzultace a ušetřil jsem 4 000 Kč ročně za lepší krytí.",
    author: "Tomáš V., Brno",
    topic: "Životní pojištění",
  },
];

export default function WhyUs() {
  return (
    <section id="proc" className="py-[88px] px-7 bg-[#0D1117] text-white">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-14 max-w-[560px]">
          <div className="text-[0.78rem] font-semibold text-[#b1004d] uppercase tracking-widest mb-3">
            Proč 4fin
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em]"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Čísla, která nás zavazují.
          </h2>
        </div>

        {/* Stats row */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 pb-16 border-b border-white/10">
          {PROOFS.map((p) => (
            <div key={p.value}>
              <div
                className="font-display font-black leading-none mb-2 tabular-nums"
                style={{ fontSize: "clamp(2.4rem, 4vw, 3.2rem)", color: p.color }}
              >
                {p.value}
              </div>
              <div className="font-display font-semibold text-white text-[1.05rem] mb-3">
                {p.label}
              </div>
              <p className="text-white/50 text-[0.9rem] leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-8">
          <div className="text-[0.78rem] font-semibold text-white/40 uppercase tracking-widest mb-8">
            Co říkají klienti
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="rounded-[14px] border border-white/10 bg-white/5 p-6 flex flex-col gap-4"
              >
                <p className="text-white/80 text-[0.97rem] leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold text-white text-[0.88rem]">{t.author}</div>
                  <div className="text-[#b1004d] text-[0.8rem] font-medium mt-0.5">{t.topic}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-[0.78rem]">
          Zkušenosti jsou reálné — jména změněna pro zachování soukromí klientů.
        </p>
      </div>
    </section>
  );
}
