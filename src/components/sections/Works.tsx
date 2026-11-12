"use client";

import { useEffect, useRef, useState } from "react";
import { usePinnedLayout } from "@/hooks/usePinnedLayout";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useLenis } from "@/components/providers/LenisContext";
import RollText from "@/components/ui/RollText";
import type { WorkCanvasHandle } from "@/components/three/WorkCanvas";
import { works, type Work } from "@/content/site";

// Client-only: keeps three.js out of the server render and initial bundle.
const WorkCanvas = dynamic(() => import("@/components/three/WorkCanvas"), {
  ssr: false,
});

const INDEX_LABEL = "03 / WORKS";
const TOTAL = String(works.length).padStart(2, "0");

/* ---------- Shared pieces ---------- */

/** Work image; swaps to the generated placeholder if the file is missing. */
function WorkImage({ work, className }: { work: Work; className?: string }) {
  const applyFallback = (img: HTMLImageElement) => {
    if (img.dataset.fallback) return;
    img.dataset.fallback = "true";
    // Loaded on demand so three.js stays out of the main bundle.
    import("@/lib/placeholderTexture").then(({ placeholderDataUrl }) => {
      img.src = placeholderDataUrl(work.no, work.title);
    });
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      // An error fired before hydration never reaches onError — catch it here.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) applyFallback(img);
      }}
      src={work.image}
      alt={`${work.title} — ${work.kind}`}
      className={className}
      onError={(event) => applyFallback(event.currentTarget)}
    />
  );
}

function StackTags({ stack, className }: { stack: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {stack.map((item) => (
        <li
          key={item}
          className="rounded-full border border-graphite/50 px-3 py-1 font-mono text-[11px]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function VisitLink({ url, className }: { url: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Visit site"
      className={`group inline-flex font-mono text-xs tracking-[0.2em] ${className ?? ""}`}
    >
      <RollText text="VISIT SITE ↗" />
    </a>
  );
}

/* ---------- Stacked layout (mobile, reduced motion) ---------- */

function WorksStacked() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray<HTMLElement>(".js-card").forEach((card) => {
        gsap.fromTo(
          card,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.1,
            ease: "power4.inOut",
            clearProps: "clipPath",
            scrollTrigger: { trigger: card, start: "top 85%" },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="works"
      ref={root}
      className="bg-ink px-6 py-24 text-paper md:px-10 md:py-32"
    >
      <h2 className="font-mono text-xs tracking-[0.2em]">{INDEX_LABEL}</h2>

      <div className="mx-auto mt-14 max-w-3xl space-y-20">
        {works.map((work) => (
          <article key={work.no} className="js-card">
            <div className="aspect-[16/10] overflow-hidden border border-graphite">
              <WorkImage work={work} className="h-full w-full object-cover" />
            </div>
            <p className="mt-6 font-mono text-xs text-signal uppercase">
              {work.no} — {work.kind}
            </p>
            <h3 className="mt-3 font-display text-[clamp(2.5rem,10vw,5rem)] leading-[0.9] uppercase">
              {work.title}
            </h3>
            <p className="mt-3 font-mono text-xs text-graphite">{work.year}</p>
            <p className="mt-5 font-serif text-xl leading-snug text-paper/85">
              {work.summary}
            </p>
            <p className="mt-5 font-mono text-xs">Role — {work.role}</p>
            <StackTags stack={work.stack} className="mt-5" />
            {work.url && <VisitLink url={work.url} className="mt-6" />}
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Pinned showcase (md+) ---------- */

function WorksPinned() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<WorkCanvasHandle | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    (_context, contextSafe) => {
      const section = root.current;
      const fill = section?.querySelector<HTMLElement>(".js-progress-fill");
      if (!section || !fill || !contextSafe) return;

      const count = works.length;
      const blocks = gsap.utils.toArray<HTMLElement>(".js-work-text");
      const linesOf = (block: HTMLElement) =>
        Array.from(block.querySelectorAll<HTMLElement>(".js-line"));
      const extrasOf = (block: HTMLElement) =>
        Array.from(block.querySelectorAll<HTMLElement>(".js-work-extra"));

      /* Text swap: outgoing lines rise out, incoming lines rise in */
      const swapText = contextSafe((prev: number, next: number) => {
        blocks.forEach((block, i) => {
          gsap.killTweensOf([block, ...linesOf(block), ...extrasOf(block)]);
          if (i !== prev && i !== next) gsap.set(block, { autoAlpha: 0 });
        });

        const outgoing = blocks[prev];
        const incoming = blocks[next];

        gsap.set(outgoing, { autoAlpha: 1 });
        gsap.to(extrasOf(outgoing), { opacity: 0, duration: 0.3 });
        gsap.to(linesOf(outgoing), {
          yPercent: -100,
          opacity: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: "power3.inOut",
        });
        gsap.set(outgoing, { autoAlpha: 0, delay: 0.95 });

        gsap.set(incoming, { autoAlpha: 1 });
        gsap.fromTo(
          linesOf(incoming),
          { yPercent: 100, opacity: 1 },
          {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.15,
          },
        );
        gsap.fromTo(
          extrasOf(incoming),
          { opacity: 0 },
          { opacity: 1, duration: 0.5, delay: 0.6 },
        );
      });

      const change = (next: number) => {
        const prev = activeRef.current;
        if (next === prev) return;
        activeRef.current = next;
        setActive(next);
        canvas.current?.goTo(next);
        swapText(prev, next);
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          fill.style.transform = `scaleY(${self.progress})`;
          change(Math.min(count - 1, Math.floor(self.progress * count)));
        },
      });

      /* Line masks, once fonts are in (re-split on resize) */
      let cancelled = false;
      let split: SplitText | undefined;
      const createSplit = contextSafe(() => {
        split = SplitText.create(".js-split", {
          type: "lines",
          mask: "lines",
          linesClass: "js-line",
          autoSplit: true,
        });
      });
      document.fonts.ready.then(() => {
        if (!cancelled) createSplit();
      });

      /* Keyboard: step between projects while the section is pinned */
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (!trigger.isActive) return;

        const next = activeRef.current + (event.key === "ArrowDown" ? 1 : -1);
        if (next < 0 || next >= count) return; // Let the page scroll on past.

        event.preventDefault();
        // Middle of that project's slice of the scroll range.
        const y = trigger.start + ((next + 0.5) / count) * (trigger.end - trigger.start);
        if (lenisRef.current) lenisRef.current.scrollTo(y);
        else window.scrollTo({ top: y, behavior: "smooth" });
      };
      window.addEventListener("keydown", onKeyDown);

      return () => {
        cancelled = true;
        split?.revert();
        window.removeEventListener("keydown", onKeyDown);
      };
    },
    { scope: root },
  );

  const current = works[active];

  return (
    <section
      id="works"
      ref={root}
      className="relative bg-ink text-paper"
      style={{ height: `${works.length * 100}vh` }}
    >
      <div className="sticky top-0 grid h-screen grid-cols-12 grid-rows-[auto_1fr] gap-x-6 px-10 pt-24 pb-10">
        {/* Left-edge progress */}
        <div className="absolute top-24 bottom-10 left-4 w-px bg-graphite/40" aria-hidden>
          <div className="js-progress-fill h-full w-full origin-top scale-y-0 bg-signal" />
        </div>

        {/* Header row */}
        <div className="col-span-12 flex items-end justify-between">
          <h2 className="font-mono text-xs tracking-[0.2em]">{INDEX_LABEL}</h2>

          <p
            className="flex items-baseline"
            aria-label={`Project ${current.no} of ${TOTAL}`}
          >
            <span
              className="block h-[1em] overflow-hidden font-display text-[clamp(3rem,6vw,6rem)] leading-none"
              aria-hidden
            >
              <span
                className="block transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
                style={{
                  transform: `translateY(-${(active * 100) / works.length}%)`,
                }}
              >
                {works.map((work) => (
                  <span key={work.no} className="block h-[1em]">
                    {work.no}
                  </span>
                ))}
              </span>
            </span>
            <span className="ml-2 font-mono text-xs text-graphite" aria-hidden>
              / {TOTAL}
            </span>
          </p>
        </div>

        {/* Text panel — all projects stacked in one cell, one visible */}
        <div className="col-span-5 grid content-center">
          {works.map((work, i) => (
            <div
              key={work.no}
              className={`js-work-text col-start-1 row-start-1 ${i === 0 ? "" : "invisible opacity-0"}`}
            >
              <p className="js-split font-mono text-xs text-signal uppercase">
                {work.kind}
              </p>
              <h3 className="js-split mt-4 font-display text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9] uppercase">
                {work.title}
              </h3>
              <p className="js-split mt-4 font-mono text-xs text-graphite">
                {work.year}
              </p>
              <p className="js-split mt-6 font-serif text-xl leading-snug text-paper/85 md:text-2xl">
                {work.summary}
              </p>
              <p className="js-split mt-6 font-mono text-xs">Role — {work.role}</p>
              <StackTags stack={work.stack} className="js-work-extra mt-6" />
              {work.url && <VisitLink url={work.url} className="js-work-extra mt-6" />}
            </div>
          ))}
        </div>

        {/* Image frame */}
        <figure className="col-span-6 col-start-7 self-center">
          <div className="relative aspect-[16/10] overflow-hidden border border-graphite">
            {/* Shown until the canvas is ready, and if WebGL is unavailable. */}
            <WorkImage
              key={current.no}
              work={current}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <WorkCanvas items={works} controls={canvas} initialIndex={active} />
          </div>
          <figcaption className="mt-3 font-mono text-[10px] text-graphite uppercase">
            fig. 03.{current.no} — {current.title}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ---------- Section ---------- */

export default function Works() {
  // Pinned showcase on md+ with motion allowed; stacked layout otherwise.
  const pinned = usePinnedLayout();

  // The two layouts differ a lot in height; re-measure every ScrollTrigger.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pinned]);

  return pinned ? <WorksPinned /> : <WorksStacked />;
}
