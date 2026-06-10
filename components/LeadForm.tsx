"use client";

import { useState } from "react";

const TOPICS = ["Hypotéka", "Investice", "Pojištění", "Reality"];

const CHECKS = [
  "Srovnání napříč všemi bankami",
  "Reálná sazba podle vaší situace",
  "Bez poplatku za sjednání",
];

type State = "idle" | "loading" | "success" | "error";

export default function LeadForm() {
  const [topic, setTopic] = useState("Hypotéka");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<State>("idle");
  const [validErr, setValidErr] = useState("");

  async function handleSubmit() {
    setValidErr("");
    if (!name.trim() || !phone.trim()) {
      setValidErr("Vyplňte prosím jméno a telefon.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, topic, note }),
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  }

  const firstName = name.split(" ")[0] || name;

  return (
    <section id="kontakt" className="py-[88px] px-7 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div
          className="bg-[#0D1117] text-white rounded-[20px] p-[50px] grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left: text + checks */}
          <div>
            <div className="text-[0.78rem] font-semibold text-[#ff7ab8] uppercase tracking-widest mb-3">
              Nezávazně a zdarma
            </div>
            <h2
              className="font-display font-bold tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
            >
              Srovnání na míru do 24 hodin.
            </h2>
            <p className="text-white/70 text-[1.04rem] mb-6 leading-relaxed">
              Nechte kontakt a co řešíte. Poradce projde nabídky bank a ozve se
              s konkrétními čísly — bez obíhání poboček.
            </p>
            <div className="flex flex-col gap-3">
              {CHECKS.map((c) => (
                <div key={c} className="flex items-center gap-3 text-[0.97rem]">
                  <span className="w-[22px] h-[22px] rounded-full bg-white/15 grid place-items-center text-[0.7rem] text-[#7fe3b5] flex-shrink-0">
                    ✓
                  </span>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div className="bg-white rounded-[14px] p-[30px] text-[#0D1117]">
            {state === "success" ? (
              <div className="text-center py-4">
                <div className="w-[60px] h-[60px] rounded-full bg-[#0E9D63] text-white text-[1.7rem] grid place-items-center mx-auto mb-4">
                  ✓
                </div>
                <h3 className="font-display font-bold text-[1.25rem] mb-2">
                  Máme to, {firstName}!
                </h3>
                <p className="text-[#697586] text-sm">
                  Ozveme se na <strong>{phone}</strong> do 24 hodin se srovnáním
                  na téma „{topic}".
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-display font-semibold text-[1.18rem] mb-1">
                  Chci nabídku na míru
                </h3>
                <p className="text-[0.85rem] text-[#697586] mb-[18px]">
                  Vyplníte za 30 sekund, ozveme se telefonicky.
                </p>

                {/* Topic chips */}
                <div className="flex gap-2 flex-wrap mb-[14px]">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`border rounded-full px-3.5 py-2 text-[0.83rem] font-semibold transition-all ${
                        topic === t
                          ? "bg-[#0D1117] text-white border-[#0D1117]"
                          : "bg-white text-[#697586] border-[#D9DCE1] hover:bg-[#F6F7F9]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-[11px]">
                  <input
                    type="text"
                    placeholder="Jméno a příjmení"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-[#D9DCE1] rounded-[10px] px-[14px] py-3 text-[0.96rem] bg-white focus:outline-none focus:border-[#D6006C] focus:shadow-[0_0_0_3px_#FCE7F1] transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full border border-[#D9DCE1] rounded-[10px] px-[14px] py-3 text-[0.96rem] bg-white focus:outline-none focus:border-[#D6006C] focus:shadow-[0_0_0_3px_#FCE7F1] transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Stručně co řešíte (nepovinné)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-[#D9DCE1] rounded-[10px] px-[14px] py-3 text-[0.96rem] bg-white focus:outline-none focus:border-[#D6006C] focus:shadow-[0_0_0_3px_#FCE7F1] transition-all"
                  />

                  {validErr && <p className="text-red-500 text-xs">{validErr}</p>}
                  {state === "error" && (
                    <p className="text-red-500 text-xs">
                      Chyba při odesílání. Zkuste to znovu.
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={state === "loading"}
                    className="w-full flex justify-center bg-[#D6006C] text-white font-semibold py-[13px] rounded-[10px] hover:bg-[#A80055] transition-all hover:-translate-y-px shadow-[0_4px_14px_rgba(214,0,108,0.25)] disabled:opacity-60 mt-1"
                  >
                    {state === "loading" ? "Odesílám…" : "Odeslat poptávku"}
                  </button>
                </div>

                <p className="text-[0.71rem] text-[#697586] text-center mt-3">
                  Odesláním souhlasíte se zpracováním údajů pro účely kontaktování.
                  Data jdou do CRM, ne třetím stranám.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
