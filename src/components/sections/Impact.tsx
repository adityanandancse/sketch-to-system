"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import DraftBadge from "@/components/ui/DraftBadge";
import { showDraft } from "@/lib/draft";
import { impact } from "@/content/site";

// Draft metrics are dev-only; with none left the whole section disappears.
const metrics = impact.metrics.filter((metric) => showDraft(metric.draft));

export default function Impact() {
  // Nothing to show (production with every metric still a draft).
  if (!metrics.length) return null;
  return <ImpactSection />;
}

function ImpactSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Reduced motion: the rendered final values stay as they are.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const counters = gsap.utils.toArray<HTMLElement>(".js-count");
      if (!counters.length) return;

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: ".js-metrics", start: "top 85%" },
      });

      counters.forEach((el, i) => {
        const value = Number(el.dataset.value) || 0;
        const count = { n: 0 };
        el.textContent = "0";
        timeline.to(
          count,
          {
            n: value,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(count.n));
            },
          },
          i * 0.1,
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="impact"
      ref={root}
      className="bg-paper px-6 py-32 text-ink md:px-10 md:py-44"
    >
      {/* Top row */}
      <div className="flex items-center gap-6">
        <span className="font-mono text-xs tracking-[0.2em]">{impact.index}</span>
        <span className="h-px flex-1 bg-ink/20" aria-hidden />
      </div>

      <h2 className="mt-16 max-w-4xl font-serif text-[clamp(2.5rem,5vw,5.5rem)] leading-none italic md:mt-24">
        {impact.heading}
      </h2>

      {/* Metrics. Each cell draws its top + left rule; the negative margin
          tucks the outer ones out of sight, leaving only the inner rules. */}
      <div className="mt-16 overflow-hidden md:mt-24">
        <dl className="js-metrics -mt-px -ml-px grid grid-cols-2 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="relative flex flex-col-reverse justify-end border-t border-l border-ink/20 px-4 py-10 md:px-8 md:py-14"
            >
              <DraftBadge draft={metric.draft} />
              <dt>
                <span className="mt-4 block font-mono text-xs tracking-[0.15em] uppercase">
                  {metric.label}
                </span>
                <span className="mt-2 block font-sans text-sm text-ink/60">
                  {metric.note}
                </span>
              </dt>
              <dd className="font-display text-[clamp(4rem,9vw,9rem)] leading-none">
                {/* The prefix ("~") sits outside the counted span, so it stays
                    put while the number runs. */}
                {metric.prefix && (
                  <span className="text-signal">{metric.prefix}</span>
                )}
                {/* Fixed-width digits so the count-up never shifts layout. */}
                <span
                  className="js-count inline-block tabular-nums"
                  style={{ minWidth: `${String(metric.value).length}ch` }}
                  data-value={metric.value}
                >
                  {metric.value}
                </span>
                {metric.suffix && (
                  <span className="text-signal">{metric.suffix}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
