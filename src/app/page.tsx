"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Token test page only — real sections come later.
export default function Home() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".js-intent", {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".js-intent",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: root },
  );

  return (
    <main ref={root}>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
        <span className="absolute top-6 left-6 font-mono text-xs tracking-widest text-graphite">
          01 / INDEX
        </span>

        <h1 className="font-display text-[clamp(4rem,18vw,22rem)] leading-[0.85] uppercase">
          <span className="block">Sketch</span>
          <span className="-my-[0.15em] block font-script text-[0.45em] leading-none text-signal normal-case">
            to
          </span>
          <span className="block">System</span>
        </h1>

        <p className="js-intent mt-10 font-serif text-2xl italic md:text-4xl">
          Only the intent stays human.
        </p>
      </section>

      <section className="h-[300vh] bg-paper p-6 text-ink">
        <p className="font-mono text-xs tracking-widest">02 / SCROLL TEST</p>
        <p className="mt-6 max-w-xl font-serif text-3xl">
          Three screens of paper to feel the smooth scroll.
        </p>
      </section>
    </main>
  );
}
