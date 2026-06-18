"use client";

import { useState } from "react";

const PHOTOS = [
  { seed: "4fin-lobby",      w: 800, h: 540, caption: "Recepce třebíčské kanceláře" },
  { seed: "4fin-office1",    w: 600, h: 820, caption: "Konzultační místnost" },
  { seed: "4fin-team1",      w: 800, h: 560, caption: "Pracovní prostor poradců" },
  { seed: "4fin-meeting",    w: 600, h: 780, caption: "Prostor pro klientské schůzky" },
  { seed: "4fin-exterior",   w: 800, h: 500, caption: "Naše kancelář v centru Třebíče" },
  { seed: "4fin-desk",       w: 600, h: 840, caption: "Detail pracovního zázemí" },
  { seed: "4fin-conference", w: 800, h: 540, caption: "Zasedací místnost" },
  { seed: "4fin-hall",       w: 600, h: 720, caption: "Vstupní hala" },
  { seed: "4fin-team2",      w: 800, h: 520, caption: "Tým 4fin v každodenní práci" },
];

function PhotoCard({ seed, w, h, caption }: (typeof PHOTOS)[number]) {
  const [hovered, setHovered] = useState(false);
  const src = `https://picsum.photos/seed/${seed}/${w}/${h}`;
  const aspect = `${(h / w) * 100}%`;

  return (
    <div
      className="relative mb-3 overflow-hidden rounded-[14px] cursor-zoom-in group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ paddingBottom: aspect }} className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={caption}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Caption overlay */}
        <div
          className="absolute inset-0 flex items-end p-4 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(13,17,23,0.72) 0%, transparent 55%)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <span className="text-white text-[0.82rem] font-medium leading-snug">
            {caption}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  return (
    <section className="py-[88px] px-7 bg-[#f2f0ed]">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-12 max-w-[560px]">
          <div className="text-[0.78rem] font-semibold text-[#b1004d] uppercase tracking-widest mb-3">
            Naše zázemí
          </div>
          <h2
            className="font-display font-bold tracking-[-0.03em] mb-4"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)" }}
          >
            Jak to u nás vypadá
          </h2>
          <p className="text-[#3A424E] text-[1.05rem] leading-relaxed">
            Rádi vás přivítáme osobně — v Třebíči, Brně nebo Náměšti nad Oslavou.
            Přijďte si sednout, dát kávu a probrat, co vás čeká.
          </p>
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 gap-3">
          {PHOTOS.map((p) => (
            <PhotoCard key={p.seed} {...p} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex items-center justify-between gap-6 flex-wrap">
          <p className="text-[0.9rem] text-[#697586]">
            Nebo nás nejdřív vyzkoušejte online — schůzka bez závazku, kdykoliv.
          </p>
          <a
            href="#kontakt"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#0D1117] px-6 py-[12px] text-[0.92rem] font-semibold text-white hover:bg-[#1a2230] transition-all hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(13,17,23,0.18)]"
          >
            Domluvit schůzku →
          </a>
        </div>
      </div>
    </section>
  );
}
