import { anuita } from "@/lib/rates";

const P = 3_500_000, termY = 25;
const bestRate = 4.59, avgRate = 5.09;
const diff = Math.round((anuita(P, avgRate, termY) - anuita(P, bestRate, termY)) * termY * 12);
const diffFmt = new Intl.NumberFormat("cs-CZ").format(diff);

const ITEMS = [
  {
    bg: "#f5e0e9",
    color: "#8c1642",
    icon: "💸",
    stat: `${diffFmt} Kč`,
    label: "o tolik více zaplatíte v průměrné bance",
    desc: `Rozdíl mezi nejlepší a průměrnou sazbou je dnes 0,5 %. Na ${new Intl.NumberFormat("cs-CZ").format(P / 1e6)} mil. Kč za ${termY} let je to právě ${diffFmt} Kč. My pracujeme na tom, abyste platili tu nižší.`,
  },
  {
    bg: "#E3F4EC",
    color: "#0A7A4D",
    icon: "⏱",
    stat: "1 hovor",
    label: "a my zařídíme zbytek",
    desc: "Srovnání bank, papíry, komunikace s úředníky — to vše obstaráme za vás. Vy přijdete jen podepsat smlouvu.",
  },
  {
    bg: "#EEF2FF",
    color: "#4338CA",
    icon: "🏦",
    stat: "40+",
    label: "bank a institucí v naší síti",
    desc: "Přímo v bance dostanete jednu nabídku — od té banky. U nás vidíte celý trh a vyberete skutečně nejlepší.",
  },
  {
    bg: "#f2f0ed",
    color: "#3A424E",
    icon: "🛡",
    stat: "Hlídáme",
    label: "i roky po podpisu smlouvy",
    desc: "Trh se mění. Před refixací se ohlásíme jako první — abyste nepropásli lepší sazbu nebo lepší banku.",
  },
];

export default function Benefits() {
  return (
    <section className="py-[88px] px-7 bg-white">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-12 max-w-[640px]">
          <div className="text-[0.78rem] font-semibold text-[#b1004d] uppercase tracking-widest mb-3">
            Proč s poradcem
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em] mb-4"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Banka vám nabídne svou sazbu.<br />
            My vyjednáme{" "}
            <span className="text-[#b1004d]">jinou.</span>
          </h2>
          <p className="text-[#3A424E] text-[1.05rem] leading-relaxed">
            Banka neví o nabídkách konkurence — a sdělovat vám je není v jejím zájmu.
            Náš zájem je přesně opačný. Platí to pro hypotéku stejně jako pro investice nebo pojistky.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          {ITEMS.map((item) => (
            <div
              key={item.stat}
              className="rounded-[16px] border border-[#e0ddd8] p-6 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(13,17,23,0.07)] transition-all"
            >
              <div
                className="w-10 h-10 rounded-[10px] grid place-items-center text-[1.2rem] flex-shrink-0"
                style={{ background: item.bg }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  className="font-display font-black leading-none tabular-nums"
                  style={{ fontSize: "1.75rem", color: item.color }}
                >
                  {item.stat}
                </div>
                <div className="text-[0.8rem] font-semibold text-[#0D1117] mt-1 leading-snug">
                  {item.label}
                </div>
              </div>
              <p className="text-[0.86rem] text-[#697586] leading-relaxed flex-1">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[14px] bg-[#f2f0ed] border border-[#e0ddd8] px-6 py-5">
          <p className="text-[0.95rem] text-[#3A424E] max-w-[52ch]">
            <strong className="text-[#0D1117]">Poradenství je pro vás zdarma.</strong>{" "}
            Odměnu dostáváme od bank za zprostředkování — ne od vás. Proto je náš zájem přirozeně totožný s vaším.
          </p>
          <a
            href="#kontakt"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#b1004d] text-white font-semibold text-[0.92rem] px-5 py-[11px] rounded-[10px] hover:bg-[#8c1642] transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(177,0,77,0.22)] whitespace-nowrap"
          >
            Chci bezplatnou konzultaci →
          </a>
        </div>
      </div>
    </section>
  );
}
