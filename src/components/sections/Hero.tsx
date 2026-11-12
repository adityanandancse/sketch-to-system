"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";

// Client-only: keeps three.js out of the server render and initial bundle.
const FluidDye = dynamic(() => import("@/components/three/FluidDye"), {
  ssr: false,
});

const DYE_OPACITY_PAPER = 0.9;
const DYE_OPACITY_INK = 0.55;

/* ---------- Sketch grid geometry (viewBox 1440 × 900) ---------- */

const W = 1440;
const H = 900;

// Seeded PRNG so the hand-drawn jitter is identical on server and client.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(1440900);
const jitter = () => (rand() * 2 - 1) * 3;

type Coords = [number, number, number, number];
type GridLine = { sketch: Coords; straight: Coords };

const toD = ([x1, y1, x2, y2]: Coords) =>
  `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;

const COLS = Array.from({ length: 12 }, (_, i) => 60 + i * 120);
const ROWS = Array.from({ length: 8 }, (_, i) => Math.round(50 + (i * 800) / 7));

const GRID_LINES: GridLine[] = [
  ...COLS.map<GridLine>((x) => ({
    sketch: [x + jitter(), 0, x + jitter(), H],
    straight: [x, 0, x, H],
  })),
  ...ROWS.map<GridLine>((y) => ({
    sketch: [0, y + jitter(), W, y + jitter()],
    straight: [0, y, W, y],
  })),
];

const CIRCLES = [
  { cx: COLS[3], cy: ROWS[4], r: 300 },
  { cx: COLS[8], cy: ROWS[3], r: 380 },
];

const CROSSHAIRS = [
  [COLS[2], ROWS[2]],
  [COLS[9], ROWS[1]],
  [COLS[4], ROWS[6]],
  [COLS[7], ROWS[4]],
].map(([x, y]) => `M${x - 10} ${y}H${x + 10}M${x} ${y - 10}V${y + 10}`);

const TICKS = Array.from({ length: 61 }, (_, i) => {
  const x = i * 24;
  return `M${x} ${H}V${H - (i % 5 === 0 ? 14 : 7)}`;
});

const ANNOTATIONS = [
  { sketch: "fig. 01 — sketch", system: "fig. 01 — system", pos: "top-24 left-6 md:left-10" },
  { sketch: "x 1440", system: "grid 12 col", pos: "top-24 right-6 md:right-10" },
  { sketch: "y 900", system: "build 1.0", pos: "top-1/2 left-6 md:left-10" },
  { sketch: "rev. 0", system: "rev. final", pos: "top-1/2 right-6 md:right-10" },
];

const PAPER = "#F2EEE6";
const INK = "#0B0B0C";
const GRAPHITE = "#8A8780";
const SIGNAL_FAINT = "rgba(226,35,26,0.35)";

const stageVars = {
  "--bg": PAPER,
  "--fg": INK,
  "--line": GRAPHITE,
  backgroundColor: "var(--bg)",
  color: "var(--fg)",
} as CSSProperties;

const shape = {
  vectorEffect: "non-scaling-stroke",
} as const;

const title = "js-title block";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  // Read by FluidDye every frame; driven by the scroll timeline below.
  const dyeOpacity = useRef(DYE_OPACITY_PAPER);

  useGSAP(
    (_context, contextSafe) => {
      const section = root.current;
      const stage = section?.querySelector<HTMLElement>(".js-stage");
      const svg = section?.querySelector<SVGSVGElement>(".js-grid");
      if (!section || !stage || !svg) return;

      // Reduced motion: leave the static paper state exactly as rendered.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      /* ---------- Scroll: sketch → system ---------- */

      const lineEls = gsap.utils.toArray<SVGPathElement>(".js-grid-line");
      const mixBg = gsap.utils.interpolate(PAPER, INK);
      const mixFg = gsap.utils.interpolate(INK, PAPER);
      const mixLine = gsap.utils.interpolate(GRAPHITE, SIGNAL_FAINT);
      const progress = { t: 0 };

      const applyProgress = () => {
        const { t } = progress;
        stage.style.setProperty("--bg", mixBg(t));
        stage.style.setProperty("--fg", mixFg(t));
        stage.style.setProperty("--line", mixLine(t));
        dyeOpacity.current =
          DYE_OPACITY_PAPER + (DYE_OPACITY_INK - DYE_OPACITY_PAPER) * t;
        lineEls.forEach((el, i) => {
          const { sketch, straight } = GRID_LINES[i];
          el.setAttribute(
            "d",
            toD(sketch.map((v, n) => v + (straight[n] - v) * t) as Coords),
          );
        });
      };

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        })
        // Theme vars + line straightening across the whole scroll.
        .to(progress, { t: 1, duration: 1, onUpdate: applyProgress }, 0)
        .to(svg, { scale: 1.08, duration: 1 }, 0)
        .to(".js-scroll-hint", { opacity: 0, duration: 0.1 }, 0)
        // Annotation swap in the middle third.
        .to('[data-state="sketch"]', { opacity: 0, duration: 1 / 6 }, 1 / 3)
        .to('[data-state="system"]', { opacity: 1, duration: 1 / 6 }, 1 / 2)
        .to(".js-title-block", { scale: 0.92, y: "-4vh", duration: 0.25 }, 0.75);

      /* ---------- Intro: runs once fonts are ready ---------- */

      let cancelled = false;
      let split: SplitText | undefined;

      const playIntro = () => {
        // Dashes on non-scaling strokes are measured in screen pixels while
        // getTotalLength() is in viewBox units, so scale up to guarantee the
        // dash covers the whole stroke. Dashes are cleared when drawing ends.
        const box = svg.getBoundingClientRect();
        const unit = Math.max(box.width / W, box.height / H, 1);
        const drawn = gsap.utils.toArray<SVGGeometryElement>(".js-draw");
        drawn.forEach((el) => {
          const length = el.getTotalLength() * unit;
          gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
        });

        split = SplitText.create(".js-title", { type: "chars", mask: "chars" });

        gsap
          .timeline()
          .to(
            drawn,
            {
              strokeDashoffset: 0,
              duration: 1.6,
              stagger: 0.03,
              ease: "power2.inOut",
            },
            0,
          )
          .set(drawn, { clearProps: "strokeDasharray,strokeDashoffset" })
          .from(".js-mark", { autoAlpha: 0, duration: 0.4, stagger: 0.02 }, 1.6)
          .from(
            split.chars,
            { yPercent: 110, duration: 1, stagger: 0.04, ease: "expo.out" },
            0.4,
          )
          .fromTo(
            ".js-to",
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 0.9,
              ease: "power3.inOut",
              clearProps: "clipPath",
            },
            ">-0.2",
          )
          .from(
            ".js-fade-up",
            {
              y: 20,
              autoAlpha: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power2.out",
            },
            ">-0.5",
          );

        // Every "from" state is now applied inline; lift the CSS pre-hide.
        stage.dataset.intro = "done";
      };

      // contextSafe: the late-running intro is still scoped to this section
      // and reverted with everything else on cleanup.
      const safeIntro = contextSafe ? contextSafe(playIntro) : playIntro;
      document.fonts.ready.then(() => {
        if (!cancelled) safeIntro();
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: root },
  );

  return (
    <section id="hero" ref={root} className="relative h-[250vh]">
      <div
        className="js-stage sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
        style={stageVars}
        data-intro="pending"
      >
        {/* Layer A — sketch grid */}
        <svg
          className="js-grid absolute inset-0 z-0 h-full w-full"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          fill="none"
          stroke="var(--line)"
          strokeWidth={1}
          aria-hidden
        >
          {GRID_LINES.map((line, i) => (
            <path
              key={i}
              className="js-grid-line js-draw"
              d={toD(line.sketch)}
              data-intro-item
              {...shape}
            />
          ))}
          {CIRCLES.map((circle, i) => (
            <circle key={i} className="js-draw" data-intro-item {...circle} {...shape} />
          ))}
          <path className="js-draw" d={`M0 ${H}L${W} 0`} data-intro-item {...shape} />
          {CROSSHAIRS.map((d, i) => (
            <path key={i} className="js-mark" d={d} data-intro-item {...shape} />
          ))}
          {TICKS.map((d, i) => (
            <path key={i} className="js-mark" d={d} data-intro-item {...shape} />
          ))}
        </svg>

        {/* Fluid dye — between the grid (z-0) and the title block (z-10) */}
        <FluidDye className="z-[5]" opacity={dyeOpacity} />

        {/* Annotation labels: sketch text with a system twin */}
        {ANNOTATIONS.map((note) => (
          <div
            key={note.sketch}
            className={`js-mark absolute font-mono text-[10px] whitespace-nowrap uppercase ${note.pos}`}
            style={{ color: "var(--line)" }}
            data-intro-item
            aria-hidden
          >
            <span data-state="sketch">{note.sketch}</span>
            <span
              data-state="system"
              className={`absolute top-0 opacity-0 ${note.pos.includes("right") ? "right-0" : "left-0"}`}
            >
              {note.system}
            </span>
          </div>
        ))}

        {/* Layer B — title block */}
        <div className="js-title-block relative z-10 flex flex-col items-center px-6 text-center">
          <h1 className="relative font-display text-[clamp(4rem,17vw,16rem)] leading-[0.85] uppercase">
            <span className={title} data-intro-item>
              Sketch
            </span>
            <span
              className="js-to absolute top-1/2 left-[58%] z-10 -translate-x-1/2 -translate-y-1/2 -rotate-6 px-[0.3em] py-[0.35em] font-script text-[clamp(2.5rem,7vw,7rem)] leading-none text-signal normal-case"
              data-intro-item
            >
              to
            </span>
            <span className={title} data-intro-item>
              System
            </span>
          </h1>
          <p
            className="js-fade-up mt-8 font-serif text-[clamp(1.1rem,1.6vw,1.6rem)] italic"
            data-intro-item
          >
            Designer &amp; full-stack engineer — from first line to production.
          </p>
        </div>

        <span
          className="js-fade-up absolute bottom-6 left-6 font-mono text-[11px] md:left-10"
          data-intro-item
        >
          01 / INDEX
        </span>
        <span
          className="js-fade-up absolute right-6 bottom-6 font-mono text-[11px] md:right-10"
          data-intro-item
        >
          <span className="js-scroll-hint block">
            <span className="block animate-bob motion-reduce:animate-none">
              SCROLL ↓
            </span>
          </span>
        </span>
      </div>
    </section>
  );
}
