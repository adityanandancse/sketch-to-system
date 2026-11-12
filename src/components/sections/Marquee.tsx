"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "@/components/providers/LenisContext";
import { marquee } from "@/content/site";

// Each group repeats the item set; the track holds two identical groups, so
// shifting it by -50% loops seamlessly. 2 × 4 sets stays wider than twice the
// viewport up to 4K.
const SETS_PER_GROUP = 4;
const LOOP_SECONDS = 30;
const SYMBOLS = new Set(["→", "✳"]);

const groupItems = Array.from({ length: SETS_PER_GROUP }, () => marquee).flat();

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
      aria-hidden
      className="overflow-hidden border-y border-ink bg-signal py-6 text-ink md:py-10"
    >
      <div className="js-track flex w-max font-display text-[clamp(3rem,9vw,8rem)] leading-none whitespace-nowrap uppercase will-change-transform">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center gap-10 pr-10">
            {groupItems.map((item, i) => (
              <span key={i} className={SYMBOLS.has(item) ? "font-sans" : undefined}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
