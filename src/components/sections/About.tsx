"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { about } from "@/content/site";

// The statement word that is set in signal red.
const ACCENT = "human.";

export default function About() {
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
        /* Statement — words rise out of line masks */
        splits.push(
          SplitText.create(".js-statement-line", {
            type: "lines,words",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.words, {
                yPercent: 100,
                duration: 1.1,
                stagger: 0.05,
                ease: "expo.out",
                scrollTrigger: { trigger: section, start: "top 75%" },
              }),
          }),
        );

        /* Portrait — card wipes up while the image settles */
        gsap
          .timeline({
            scrollTrigger: { trigger: ".js-portrait", start: "top 85%" },
          })
          .fromTo(
            ".js-portrait",
            { clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0% 0 0 0)",
              duration: 1.2,
              ease: "power4.inOut",
            },
            0,
          )
          .fromTo(
            ".js-portrait-img",
            { scale: 1.15 },
            { scale: 1, duration: 1.2, ease: "power4.inOut" },
            0,
          );

        /* Portrait parallax across the whole section */
        gsap.fromTo(
          ".js-portrait-img",
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        /* Lead + body — each paragraph reveals line by line as it enters.
           autoSplit re-splits on resize so line masks stay correct. */
        gsap.utils.toArray<HTMLElement>(".js-copy").forEach((paragraph) => {
          splits.push(
            SplitText.create(paragraph, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 100,
                  duration: 1,
                  stagger: 0.08,
                  ease: "expo.out",
                  scrollTrigger: { trigger: paragraph, start: "top 85%" },
                }),
            }),
          );
        });

        /* Facts — rules draw in, then values fade */
        gsap
          .timeline({
            scrollTrigger: { trigger: ".js-facts", start: "top 85%" },
          })
          .from(".js-fact-line", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.inOut",
          })
          .from(
            ".js-fact-value",
            { autoAlpha: 0, duration: 0.6, stagger: 0.1 },
            ">-0.4",
          );
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
      id="about"
      ref={root}
      className="bg-ink px-6 py-32 text-paper md:px-10 md:py-48"
    >
      {/* Top row */}
      <div className="flex items-center gap-6">
        <span className="font-mono text-xs tracking-[0.2em] text-graphite">
          {about.index}
        </span>
        <span className="h-px flex-1 bg-graphite" aria-hidden />
      </div>

      {/* Statement */}
      <h2 className="mt-16 font-serif text-[clamp(3rem,8vw,9rem)] leading-[0.95] italic md:mt-24">
        {about.statement.map((line, i) => (
          <span
            key={line}
            className={`js-statement-line block ${i > 0 ? "md:pl-[12vw]" : ""}`}
          >
            {line.split(ACCENT).flatMap((part, n) =>
              n === 0
                ? [part]
                : [
                    <span key={n} className="text-signal">
                      {ACCENT}
                    </span>,
                    part,
                  ],
            )}
          </span>
        ))}
      </h2>

      <div className="mt-16 grid grid-cols-1 gap-y-16 md:mt-32 md:grid-cols-12 md:gap-x-6">
        {/* Portrait card */}
        <figure className="max-w-sm md:col-span-5 md:max-w-none">
          <div className="js-portrait aspect-[4/5] overflow-hidden border border-graphite bg-paper text-ink">
            {/* Plain <img>: static export, images are unoptimized anyway. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avatar.png"
              alt="Illustrated portrait of Aditya Nandan"
              className="js-portrait-img h-full w-full object-contain"
            />
          </div>
          <figcaption className="mt-3 font-mono text-[10px] text-graphite uppercase">
            fig. 02 — the author (sketch). 3D version in progress.
          </figcaption>
        </figure>

        {/* Copy */}
        <div className="md:col-span-6 md:col-start-7">
          <p className="js-copy font-serif text-[clamp(1.4rem,2.2vw,2.2rem)] leading-snug">
            {about.lead}
          </p>

          <div className="mt-10 space-y-6">
            {about.body.map((paragraph) => (
              <p
                key={paragraph}
                className="js-copy font-sans text-base leading-relaxed text-paper/75 md:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <dl className="js-facts mt-14">
            {about.facts.map((fact) => (
              <div key={fact.label} className="relative">
                <span
                  className="js-fact-line absolute inset-x-0 top-0 h-px bg-graphite/40"
                  aria-hidden
                />
                <div className="flex items-baseline justify-between gap-6 py-4 font-mono text-xs">
                  <dt className="text-graphite">{fact.label}</dt>
                  <dd className="js-fact-value text-right">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
