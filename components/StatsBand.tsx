"use client";

import { useRef, useEffect } from "react";

const STATS = [
  { count: 5000, suffix: "+", label: "spokojených klientů" },
  { count: 200, suffix: " mil. Kč", label: "vyřízených hypoték" },
  { count: 40, suffix: "+", label: "bank a institucí" },
  { count: 4, suffix: "", label: "pobočky v kraji" },
];

const fmt = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });

function CountUp({ count, suffix }: { count: number; suffix: string }) {
  const elRef = useRef<HTMLElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || doneRef.current) return;
          doneRef.current = true;

          const t0 = performance.now();
          const duration = 1100;

          function step(ts: number) {
            const p = Math.min((ts - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el!.textContent = fmt.format(Math.round(count * eased)) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }

          requestAnimationFrame(step);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count, suffix]);

  return (
    <b
      ref={elRef}
      className="font-display font-bold text-[2.4rem] leading-none tracking-[-0.03em] block tabular-nums"
    >
      0{suffix}
    </b>
  );
}

export default function StatsBand() {
  return (
    <div className="border-t border-b border-[#E6E8EC] bg-[#F6F7F9]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => {
            const borderR =
              i % 2 === 0
                ? "border-r border-[#E6E8EC]"
                : i === 1
                ? "md:border-r md:border-[#E6E8EC]"
                : i === 2
                ? "border-r border-[#E6E8EC]"
                : "";
            const borderB = i < 2 ? "border-b border-[#E6E8EC] md:border-b-0" : "";
            return (
              <div key={s.label} className={`px-7 py-8 ${borderR} ${borderB}`}>
                <CountUp count={s.count} suffix={s.suffix} />
                <span className="text-[0.86rem] text-[#697586] mt-1 block">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
