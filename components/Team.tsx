const MEMBERS = [
  {
    name: "Zdeněk Melán",
    role: "Finanční poradce",
    bio: "Specializuji se na hypotéky, investice a pojištění. Rád vám pomůžu najít řešení přesně na míru vaší situace.",
    initials: "ZM",
    color: "#b1004d",
    email: "zdenek.melan@4fin.cz",
    web: "https://www.zdenekmelan.cz",
  },
  {
    name: "Petr Ošmera",
    role: "Finanční poradce",
    bio: "Poskytuji nezávislé finanční poradenství — bez tlaku, bez zbytečných produktů. Jen to, co má pro vás smysl.",
    initials: "PO",
    color: "#0E9D63",
    email: "petr.osmera@4fin.cz",
    web: "https://www.petrosmera.cz",
  },
  {
    name: "Petr Studýnka",
    role: "Finanční poradce",
    bio: "Pomáhám klientům po celé Vysočině s hypotékami, investicemi i pojištěním — vždy s ohledem na jejich konkrétní situaci.",
    initials: "PS",
    color: "#0D1117",
    email: "petr.studynka@4fin.cz",
    web: null,
  },
  {
    name: "Hana Roubcová, DiS.",
    role: "Office manažer",
    bio: "Stará se o to, aby každá schůzka proběhla hladce. Od prvního kontaktu přes domluvu termínu až po uzavření smlouvy.",
    initials: "HR",
    color: "#b1004d",
    email: "hana.roubcova@4fin.cz",
    web: null,
  },
];

export default function Team() {
  return (
    <section id="tym" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#b1004d] text-sm font-medium uppercase tracking-widest mb-2">
            Náš tým
          </p>
          <h2 className="font-display text-4xl font-bold text-[#0D1117]">
            Lidé, kteří vám pomohou
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MEMBERS.map((m) => (
            <div
              key={m.name}
              className="text-center bg-[#f2f0ed] rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 font-display text-xl font-bold text-white"
                style={{ backgroundColor: m.color }}
              >
                {m.initials}
              </div>
              <h3 className="font-display font-bold text-lg text-[#0D1117]">{m.name}</h3>
              <p className="text-sm font-medium mb-3" style={{ color: m.color }}>
                {m.role}
              </p>
              <p className="text-sm text-[#0D1117]/60 leading-relaxed mb-4">{m.bio}</p>
              <div className="flex justify-center flex-wrap gap-2">
                <a
                  href={`mailto:${m.email}`}
                  className="text-xs text-[#0D1117]/40 hover:text-[#b1004d] transition-colors break-all"
                >
                  {m.email}
                </a>
                {m.web && (
                  <a
                    href={m.web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#b1004d] hover:underline"
                  >
                    Web ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
