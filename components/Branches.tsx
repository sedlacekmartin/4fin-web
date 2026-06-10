const BRANCHES = [
  {
    city: "Třebíč",
    address: "Kubišova 1230/51",
    zip: "674 01 Třebíč",
    phone: "+420 736 XXX XXX",
    isHQ: true,
  },
  {
    city: "Brno",
    address: "Křenová 524/69",
    zip: "602 00 Brno",
    phone: "+420 736 XXX XXX",
    isHQ: false,
  },
  {
    city: "Náměšť n. Oslavou",
    address: "Masarykovo nám. 91",
    zip: "675 71 Náměšť nad Oslavou",
    phone: "+420 736 XXX XXX",
    isHQ: false,
  },
  {
    city: "Znojmo",
    address: "nám. Svobody 210/18",
    zip: "669 02 Znojmo",
    phone: "+420 736 XXX XXX",
    isHQ: false,
  },
];

export default function Branches() {
  return (
    <section className="py-20 px-4 bg-[#F6F7F9]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D6006C] text-sm font-medium uppercase tracking-widest mb-2">
            Pobočky
          </p>
          <h2 className="font-display text-4xl font-bold text-[#0D1117]">
            Jsme nablízku
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BRANCHES.map((b) => (
            <div
              key={b.city}
              className={`rounded-2xl p-6 ${
                b.isHQ
                  ? "bg-[#D6006C] text-white"
                  : "bg-white border border-[#E6E8EC] text-[#0D1117]"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    b.isHQ ? "bg-white" : "bg-[#D6006C]"
                  }`}
                />
                <span
                  className={`font-display text-lg font-bold ${
                    b.isHQ ? "text-white" : "text-[#0D1117]"
                  }`}
                >
                  {b.city}
                </span>
                {b.isHQ && (
                  <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    Sídlo
                  </span>
                )}
              </div>
              <address
                className={`not-italic text-sm leading-relaxed mb-4 ${
                  b.isHQ ? "text-white/80" : "text-[#0D1117]/60"
                }`}
              >
                {b.address}
                <br />
                {b.zip}
              </address>
              <a
                href={`tel:${b.phone.replace(/\s/g, "")}`}
                className={`text-sm font-medium ${
                  b.isHQ ? "text-white" : "text-[#D6006C]"
                }`}
              >
                {b.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
