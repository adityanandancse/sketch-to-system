"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePinnedLayout } from "@/hooks/usePinnedLayout";
import { flow } from "@/content/site";

/* ---------- Horizontal pinned scroll (md+) ---------- */

function FlowHorizontal() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const pin = section?.querySelector<HTMLElement>(".js-flow-pin");
      const track = section?.querySelector<HTMLElement>(".js-flow-track");
      const fill = section?.querySelector<HTMLElement>(".js-flow-fill");
      const dot = section?.querySelector<HTMLElement>(".js-flow-dot");
      if (!pin || !track || !fill || !dot) return;

      // Function values are re-evaluated on every refresh (incl. resize).
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const scroll = gsap.to(track, {
        x: () => -distance(),
        ease: "none", // Required for containerAnimation.
        onUpdate: () => {
          // The line lives in the track, so the dot at the fill's leading
          // edge ends up travelling across the viewport with scroll progress.
          const progress = scroll.progress();
          fill.style.transform = `scaleX(${progress})`;
          dot.style.left = `${progress * 100}%`;
        },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Each panel's copy rises in as the panel reaches 60% of the viewport.
      gsap.utils.toArray<HTMLElement>(".js-flow-step").forEach((panel) => {
        gsap.from(panel.querySelectorAll(".js-flow-reveal"), {
          y: 40,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scroll,
            start: "left 60%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Web fonts change text heights above this section; re-measure so the
      // pin starts in the right place (window resize refreshes by itself).
      let cancelled = false;
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
      return () => {
        cancelled = true;
      };
    },
    { scope: root },
  );

  return (
    <section id="flow" ref={root} className="overflow-hidden bg-ink text-paper">
      <div className="js-flow-pin flex h-screen items-center overflow-hidden">
        <div className="js-flow-track relative flex w-max items-center pl-10">
          {/* Mid-height progress line, spanning the whole track */}
          <div
            className="absolute inset-x-0 top-1/2 h-px bg-graphite/40"
            aria-hidden
          >
            <div className="js-flow-fill h-full w-full origin-left scale-x-0 bg-signal" />
            <div className="js-flow-dot absolute top-1/2 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal" />
          </div>

          {/* Intro panel */}
          <div className="relative w-[45vw] shrink-0 pr-10">
            <p className="font-mono text-xs tracking-[0.2em]">{flow.index}</p>
            <h2 className="mt-8 bg-ink py-2 font-serif text-[clamp(2.5rem,5vw,5.5rem)] leading-none italic">
              {flow.heading}
            </h2>
          </div>

          {/* Step panels */}
          {flow.steps.map((step) => (
            <article
              key={step.no}
              className="js-flow-step relative flex h-[70vh] w-[38vw] shrink-0 flex-col justify-between border-l border-graphite/40 p-10"
            >
              <span
                className="font-display text-[clamp(8rem,16vw,16rem)] leading-none text-transparent opacity-25 [-webkit-text-stroke:1px_var(--color-paper)]"
                aria-hidden
              >
                {step.no}
              </span>
              <div>
                <h3 className="js-flow-reveal font-display text-5xl uppercase">
                  {step.title}
                </h3>
                <p className="js-flow-reveal mt-4 max-w-sm font-sans text-lg text-paper/70">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Vertical list (mobile, reduced motion) ---------- */

function FlowVertical() {
  return (
    <section id="flow" className="bg-ink px-6 py-24 text-paper md:px-10 md:py-32">
      <p className="font-mono text-xs tracking-[0.2em]">{flow.index}</p>
      <h2 className="mt-8 max-w-3xl font-serif text-[clamp(2.5rem,5vw,5.5rem)] leading-none italic">
        {flow.heading}
      </h2>

      <ol className="mt-16 max-w-3xl">
        {flow.steps.map((step) => (
          <li
            key={step.no}
            className="flex gap-6 border-t border-graphite/40 py-10"
          >
            <span className="font-mono text-sm text-signal">{step.no}</span>
            <div>
              <h3 className="font-display text-4xl uppercase">{step.title}</h3>
              <p className="mt-3 max-w-sm font-sans text-lg text-paper/70">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Section ---------- */

export default function Flow() {
  const pinned = usePinnedLayout();
  return pinned ? <FlowHorizontal /> : <FlowVertical />;
}
