"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { approach } from "@/content/site";

export default function Approach() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const section = root.current;
      if (!section) return;

      // Reduced motion: no animations, everything stays visible.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let cancelled = false;
      const splits: SplitText[] = [];

      const animate = () => {
        /* Heading — characters rise out of their masks */
        const heading = SplitText.create(".js-approach-heading", {
          type: "chars",
          mask: "chars",
        });
        splits.push(heading);
        gsap.from(heading.chars, {
          yPercent: 110,
          duration: 1,
          stagger: 0.03,
          ease: "expo.out",
          scrollTrigger: { trigger: ".js-approach-heading", start: "top 85%" },
        });

        /* Intro — line mask reveal (re-split on resize) */
        splits.push(
          SplitText.create(".js-approach-intro", {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 100,
                duration: 1,
                stagger: 0.08,
                ease: "expo.out",
                scrollTrigger: { trigger: ".js-approach-intro", start: "top 85%" },
              }),
          }),
        );

        /* Pillars — rule draws across, then the row's lines rise */
        gsap.utils.toArray<HTMLElement>(".js-pillar").forEach((row) => {
          const scrollTrigger = { trigger: row, start: "top 85%" };

          gsap.from(row.querySelector(".js-pillar-rule"), {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1,
            ease: "power3.inOut",
            scrollTrigger,
          });

          splits.push(
            SplitText.create(row.querySelectorAll(".js-pillar-text"), {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 100,
                  duration: 0.9,
                  stagger: 0.06,
                  delay: 0.35,
                  ease: "expo.out",
                  scrollTrigger,
                }),
            }),
          );
        });
      };

      const safeAnimate = contextSafe ? contextSafe(animate) : animate;
      document.fonts.ready.then(() => {
        if (!cancelled) safeAnimate();
      });

      return () => {
        cancelled = true;
        splits.forEach((split) => split.revert());
      };
    },
    { scope: root },
  );

  return (
    <section
      id="approach"
      ref={root}
      className="bg-paper px-6 py-32 text-ink md:px-10 md:py-48"
    >
      {/* Top row */}
      <div className="flex items-center gap-6">
        <span className="font-mono text-xs tracking-[0.2em]">{approach.index}</span>
        <span className="h-px flex-1 bg-ink/20" aria-hidden />
      </div>

      <h2 className="mt-16 font-display text-[clamp(3rem,9vw,10rem)] leading-[0.93] uppercase md:mt-24">
        {approach.heading.map((line, i) => (
          <span
            key={line}
            className={`js-approach-heading block ${i > 0 ? "text-signal" : ""}`}
          >
            {line}
          </span>
        ))}
      </h2>

      <p className="js-approach-intro mt-10 max-w-3xl font-serif text-[clamp(1.3rem,2vw,2rem)] italic">
        {approach.intro}
      </p>

      {/* Pillars — rows, not cards */}
      <div className="mt-20 md:mt-32">
        {approach.pillars.map((pillar) => (
          <article
            key={pillar.no}
            // Hover wipe: an ink layer scales up from the bottom edge.
            className="js-pillar group relative -mx-3 px-3 py-12 before:absolute before:inset-0 before:origin-bottom before:scale-y-0 before:bg-ink before:transition-transform before:duration-[600ms] before:ease-[cubic-bezier(0.19,1,0.22,1)] hover:before:scale-y-100 motion-reduce:before:transition-none md:-mx-5 md:px-5"
          >
            <span
              className="js-pillar-rule absolute inset-x-0 top-0 h-px bg-ink/20"
              aria-hidden
            />

            <div className="relative grid grid-cols-1 gap-y-4 transition-colors duration-500 group-hover:text-paper md:grid-cols-12 md:gap-x-6">
              <p className="js-pillar-text font-mono text-sm transition-colors duration-500 group-hover:text-signal md:col-span-2">
                {pillar.no}
              </p>
              <h3 className="js-pillar-text font-display text-[clamp(2rem,4vw,4rem)] leading-none uppercase md:col-span-4">
                {pillar.title}
              </h3>
              <div className="md:col-span-6">
                <p className="js-pillar-text font-serif text-2xl">{pillar.line}</p>
                <p className="js-pillar-text mt-4 font-sans text-base text-ink/70 transition-colors duration-500 group-hover:text-paper/70">
                  {pillar.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
