"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "@/components/providers/LenisContext";
import { marquee } from "@/content/site";

// The track holds two identical groups, so shifting it by -50% loops
// seamlessly. One pass of the tech stack is already several viewports wide.
// Sized to the group width so the on-screen speed stays ~150px/s at 1440.
const LOOP_SECONDS = 67;
const SEPARATOR = "✱";

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>(".js-track");
      if (!track) return;

      // Reduced motion: static row, no loop.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const loop = gsap.to(track, {
        xPercent: -50,
        duration: LOOP_SECONDS,
        ease: "none",
        repeat: -1,
      });
      // Start far from zero so the loop can also run backwards indefinitely.
      loop.totalTime(LOOP_SECONDS * 1000);

      // Smoothed values, eased toward their targets and applied every tick.
      const motion = { timeScale: 1, skew: 0 };
      const scaleTo = gsap.quickTo(motion, "timeScale", {
        duration: 0.5,
        ease: "power2.out",
      });
      const skewTo = gsap.quickTo(motion, "skew", {
        duration: 0.5,
        ease: "power2.out",
      });
      const setSkew = gsap.quickSetter(track, "skewX", "deg");

      const tick = () => {
        const velocity = lenis?.velocity ?? 0;
        const boost = gsap.utils.clamp(0, 4, Math.abs(velocity) * 0.08);
        // Scrolling up runs the loop backwards; idle eases back to 1.
        scaleTo(velocity < 0 ? -(1 + boost) : 1 + boost);
        skewTo(gsap.utils.clamp(-8, 8, velocity * 0.1));

        loop.timeScale(motion.timeScale);
        setSkew(motion.skew);
      };

      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root, dependencies: [lenis], revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      className="overflow-hidden border-y border-ink bg-signal py-6 text-ink md:py-10"
    >
      <p className="sr-only">
        {marquee.label}: {marquee.items.join(", ")}
      </p>
      <div
        aria-hidden="true"
        className="js-track flex w-max font-display text-[clamp(3rem,9vw,8rem)] leading-none whitespace-nowrap uppercase will-change-transform"
      >
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center gap-10 pr-10">
            {marquee.items.flatMap((item) => [
              <span key={item}>{item}</span>,
              <span key={`${item}-sep`} className="font-sans" aria-hidden="true">
                {SEPARATOR}
              </span>,
            ])}
          </div>
        ))}
      </div>
    </div>
  );
}
