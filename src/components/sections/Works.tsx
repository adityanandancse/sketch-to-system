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
import DraftBadge from "@/components/ui/DraftBadge";
import { isDev, showDraft } from "@/lib/draft";
import type { WorkCanvasHandle } from "@/components/three/WorkCanvas";
import { works, type Work, type WorkStat } from "@/content/site";

// Client-only: keeps three.js out of the server render and initial bundle.
const WorkCanvas = dynamic(() => import("@/components/three/WorkCanvas"), {
  ssr: false,
});

const INDEX_LABEL = "03 / WORKS";
const TOTAL = String(works.length).padStart(2, "0");

/* ---------- Shared pieces ---------- */

/**
 * Work image; swaps to the generated placeholder if the work has no image or
 * the file is missing.
 */
function WorkImage({
  work,
  className,
  lazy,
}: {
  work: Work;
  className?: string;
  /** Defer loading until near the viewport (stacked cards). */
  lazy?: boolean;
}) {
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
      alt={work.imageAlt ?? `${work.title} — ${work.kind}`}
      // Intrinsic size of every work image (16:10); CSS sets the rendered box.
      width={1600}
      height={1000}
      loading={lazy ? "lazy" : undefined}
      decoding="async"
      className={className}
      onError={(event) => applyFallback(event.currentTarget)}
    />
  );
}

function StackTags({
  stack,
  draft,
  className,
  small,
}: {
  stack: string[];
  /** The work's `stackDraft` flag: dev-only with a badge, hidden in production. */
  draft?: boolean;
  className?: string;
  /** Compact chips for slides that carry stats. */
  small?: boolean;
}) {
  if (draft && !isDev) return null;

  return (
    <ul
      className={`flex flex-wrap ${small ? "gap-1.5" : "gap-2"} ${draft ? "relative w-fit" : ""} ${className ?? ""}`}
    >
      {draft && (
        <li className="contents">
          <DraftBadge draft className="top-1/2 left-full ml-3 -translate-y-1/2" />
        </li>
      )}
      {stack.map((item) => (
        <li
          key={item}
          className={`rounded-full border border-graphite/50 font-mono ${
            small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Year line. A draft or unfinished ("TODO") year is dev-only, flagged with a
 * badge; in production it renders nothing.
 */
function WorkYear({
  year,
  draft,
  className,
  textClassName,
}: {
  year: string;
  /** The work's `periodDraft` flag. */
  draft?: boolean;
  className?: string;
  textClassName?: string;
}) {
  const pending = Boolean(draft) || year.includes("TODO");
  if (pending && !isDev) return null;

  return (
    <div className={`relative w-fit ${className ?? ""}`}>
      <p className={`font-mono text-xs text-graphite ${textClassName ?? ""}`}>{year}</p>
      <DraftBadge draft={pending} className="top-1/2 left-full ml-3 -translate-y-1/2" />
    </div>
  );
}

/** Optional use cases (mobile card only; the desktop slide has no room). */
function WorkUseCases({ work, className }: { work: Work; className?: string }) {
  if (!work.useCases?.length) return null;

  return (
    <div className={className}>
      <h4 className="mb-2 font-mono text-[10px] text-graphite">USE CASES</h4>
      <ul className="space-y-1">
        {work.useCases.map((item) => (
          <li key={item} className="flex gap-2 font-sans text-sm text-paper/70">
            <span aria-hidden>·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Headline stats + outcomes (works that define them) ---------- */

const MAX_STATS = 4;
/** A work that carries headline stats gets the fuller, business-first layout. */
const isFeatured = (work: Work) =>
  Boolean(work.stats?.length || work.outcomes?.length);
/** No headline stats: the facts take the stats position instead. */
const factsAsStats = (work: Work) => !work.stats?.length && Boolean(work.facts?.length);
const OUTCOMES_LABEL = "How it helps the business";
// The slide has room for the first three outcomes; the rest are on the card.
const COMPACT_OUTCOMES = 3;

/** Numeric target for the count-up; null for "TODO" and for zero. */
function countTarget(value: string) {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n !== 0 ? n : null;
}

/**
 * Same technique as the Impact count-up, but keeps the value's own decimals
 * and thousands separators ("1,790", "96.5"). Call inside a useGSAP context.
 */
function playStatCounts(scope: Element, trigger: Element, start: string) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const counters = Array.from(
    scope.querySelectorAll<HTMLElement>(".js-stat-count[data-value]"),
  );
  if (!counters.length) return;

  const timeline = gsap.timeline({ scrollTrigger: { trigger, start } });
  counters.forEach((el, i) => {
    const final = el.dataset.value ?? "";
    const target = countTarget(final);
    if (target === null) return;

    const decimals = final.split(".")[1]?.length ?? 0;
    const format = (n: number) =>
      n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    const count = { n: 0 };
    el.textContent = format(0);
    timeline.to(
      count,
      {
        n: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(count.n);
        },
        onComplete: () => {
          el.textContent = final;
        },
      },
      i * 0.1,
    );
  });
}

/** First four final stats, plus (in development only) any drafts. */
function statsToShow(stats: WorkStat[]) {
  const finals = stats.filter((stat) => !stat.draft).slice(0, MAX_STATS);
  const drafts = stats.filter((stat) => stat.draft && showDraft(true));
  return [...finals, ...drafts];
}

function WorkStats({
  work,
  className,
  notes,
}: {
  work: Work;
  className?: string;
  /** "tooltip": note on hover/focus. "inline": note as a small line. */
  notes: "tooltip" | "inline";
}) {
  // Facts stand in as text "stats" (no note, no count-up) when there are none.
  const fromFacts = factsAsStats(work);
  const stats: WorkStat[] = fromFacts
    ? (work.facts ?? [])
        .filter((fact) => showDraft(Boolean(fact.draft)))
        .map((fact) => ({ ...fact, unit: "", note: "" }))
    : statsToShow(work.stats ?? []);
  if (!stats.length) return null;

  return (
    <dl className={className}>
      {stats.map((stat) => {
        const animated = countTarget(stat.value) !== null;
        return (
          <div
            key={stat.label}
            className="group relative flex min-w-0 flex-col-reverse justify-end outline-offset-4 outline-signal focus-visible:outline-1"
            tabIndex={notes === "tooltip" && stat.note ? 0 : undefined}
            data-draft={stat.draft || undefined}
          >
            <DraftBadge draft={Boolean(stat.draft)} className="-top-5 left-0" />
            <dt className="mt-2 line-clamp-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-graphite uppercase">
              {stat.label}
            </dt>
            {/* Fixed-height value block, so every label starts on one line. */}
            {/* Fact values are words, not numbers: set smaller so they fit. */}
            <dd
              className={`h-[1em] font-display leading-none whitespace-nowrap ${
                fromFacts
                  ? "text-[clamp(1rem,1.4vw,1.75rem)]"
                  : "text-[clamp(1.75rem,2.8vw,3rem)]"
              }`}
            >
              {/* Screen readers get the real value, never a mid-count number. */}
              <span className="sr-only">
                {stat.prefix && `${stat.prefix} `}
                {stat.value}
                {stat.unit && ` ${stat.unit}`}
              </span>
              <span aria-hidden="true" className="flex h-[1em] items-baseline">
                {/* The display face has no "≤"; set the prefix in the sans. */}
                {stat.prefix && (
                  <span className="mr-[0.08em] font-sans text-[0.6em] text-graphite">
                    {stat.prefix}
                  </span>
                )}
                <span
                  className={`inline-block tabular-nums ${animated ? "js-stat-count" : ""}`}
                  data-value={animated ? stat.value : undefined}
                >
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="ml-[0.08em] text-[0.55em] text-signal">{stat.unit}</span>
                )}
              </span>
            </dd>
            {!stat.note ? null : notes === "tooltip" ? (
              <dd className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-60 border border-graphite bg-paper p-2 font-sans text-xs leading-snug text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {stat.note}
              </dd>
            ) : (
              <dd className="order-first mt-2 font-sans text-xs leading-snug text-paper/60">
                {stat.note}
              </dd>
            )}
          </div>
        );
      })}
    </dl>
  );
}

/** Scale at a glance, as one inline row. */
function WorkFacts({ work, className }: { work: Work; className?: string }) {
  const facts = work.facts?.filter((fact) => showDraft(Boolean(fact.draft))) ?? [];
  if (!facts.length) return null;

  return (
    <dl className={`flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] ${className ?? ""}`}>
      {facts.map((fact) => (
        <div key={fact.label} className="flex gap-1.5">
          <dt className="text-graphite">{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function OutcomeTitles({
  work,
  compact,
  withResult,
}: {
  work: Work;
  /** Slide version: the first three titles only. */
  compact?: boolean;
  /** Also show each outcome's result line. */
  withResult?: boolean;
}) {
  return (
    <ol
      className={
        compact
          ? "space-y-1"
          : withResult
            ? "space-y-3"
            : "space-y-1"
      }
    >
      {work.outcomes?.map((outcome, i) => (
        <li
          key={outcome.title}
          className={`flex items-baseline gap-3 font-sans text-sm text-paper/85 ${
            compact && i >= COMPACT_OUTCOMES ? "hidden" : ""
          }`}
        >
          <span className="font-mono text-[10px] text-signal" aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>
            {outcome.title}
            {withResult && (
              <span className="mt-0.5 block text-xs leading-snug text-paper/60">
                {outcome.result}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

function WorkCredit({
  work,
  className,
  oneLine,
}: {
  work: Work;
  className?: string;
  /** Slide version: a single line, cut with an ellipsis. */
  oneLine?: boolean;
}) {
  if (!work.credit) return null;
  return (
    <p
      title={oneLine ? work.credit : undefined}
      className={`font-mono text-[10px] leading-relaxed text-graphite/80 ${oneLine ? "truncate" : ""} ${className ?? ""}`}
    >
      {work.credit}
    </p>
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

/** Live site link, with the App Store link beside it when the work has one. */
function WorkLinks({ work, className }: { work: Work; className?: string }) {
  const appStore =
    work.appStore && showDraft(Boolean(work.appStore.draft)) ? work.appStore : null;
  const links = work.links ?? [];
  // A status line stands in for the link only when there is no live url.
  const status = work.url ? null : work.status;
  if (!work.url && !links.length && !appStore && !status) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${className ?? ""}`}>
      {/* A links row replaces the single link, so the site is not listed twice. */}
      {work.url && !links.length && <VisitLink url={work.url} />}
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex font-mono text-xs tracking-[0.1em]"
        >
          <RollText text={`${link.label} ↗`} />
        </a>
      ))}
      {status && (
        <p className="flex items-center gap-2 font-mono text-xs text-graphite">
          <span className="size-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
          {status}
        </p>
      )}
      {appStore && (
        <span className="relative inline-flex">
          <a
            href={appStore.href}
            target="_blank"
            rel="noopener"
            className="group inline-flex font-mono text-xs tracking-[0.2em] uppercase"
          >
            <RollText text={`${appStore.label} ↗`} />
          </a>
          <DraftBadge
            draft={Boolean(appStore.draft)}
            className="top-1/2 left-full ml-3 -translate-y-1/2"
          />
        </span>
      )}
    </div>
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

      gsap.utils.toArray<HTMLElement>(".js-stats").forEach((stats) => {
        playStatCounts(stats, stats, "top 85%");
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
              <WorkImage work={work} lazy className="h-full w-full object-cover" />
            </div>
            <p className="mt-6 font-mono text-xs text-signal uppercase">
              {work.no} — {work.kind}
            </p>
            <h3 className="mt-3 font-display text-[clamp(2.5rem,10vw,5rem)] leading-[0.9] uppercase">
              {work.title}
            </h3>
            <WorkYear year={work.year} draft={work.periodDraft} className="mt-3" />
            <p className="mt-5 font-serif text-xl leading-snug text-paper/85">
              {work.summary}
            </p>
            {/* Works with headline stats lead with role, numbers, scale and
                stack; the others keep role + stack at the end. */}
            {isFeatured(work) && (
              <>
                <p className="mt-4 font-mono text-[11px] leading-relaxed text-graphite">
                  {work.role}
                </p>
                <WorkCredit work={work} className="mt-2" />
              </>
            )}
            <WorkStats
              work={work}
              notes="inline"
              className="js-stats mt-8 grid grid-cols-2 gap-x-6 gap-y-8"
            />
            {/* Not repeated when the facts already sit in the stats position. */}
            {!factsAsStats(work) && <WorkFacts work={work} className="mt-8" />}
            {isFeatured(work) && (
              <StackTags stack={work.stack} draft={work.stackDraft} small className="mt-5" />
            )}
            {work.practices && (
              <p className="mt-4 font-sans text-xs leading-snug text-paper/50">
                {work.practices}
              </p>
            )}
            {work.outcomes?.length ? (
              <details className="mt-8 border-y border-graphite/40 py-3">
                <summary className="cursor-pointer font-mono text-xs tracking-[0.15em] uppercase">
                  {OUTCOMES_LABEL}
                </summary>
                <div className="mt-4">
                  <OutcomeTitles work={work} withResult />
                </div>
                {/* TODO(step 09): "Read the case study →" link to /work/erp
                    once that route exists. */}
              </details>
            ) : null}
            <WorkUseCases work={work} className="mt-5" />
            {!isFeatured(work) && (
              <>
                <p className="mt-5 font-mono text-xs">Role — {work.role}</p>
                <WorkCredit work={work} className="mt-2" />
                <StackTags stack={work.stack} draft={work.stackDraft} className="mt-5" />
              </>
            )}
            <WorkLinks work={work} className="mt-6" />
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

      // The panel's visibility is imperative, so seed it from the same index
      // the counter, caption and canvas use. Without this, a re-run of this
      // setup while a later slide is active (StrictMode's double effect after
      // a mid-section reload, Fast Refresh) left slide 01's text showing.
      gsap.set(blocks, { autoAlpha: (i: number) => (i === activeRef.current ? 1 : 0) });

      /* Text swap: outgoing lines rise out, incoming lines rise in */
      const swapText = contextSafe((prev: number, next: number) => {
        blocks.forEach((block, i) => {
          gsap.killTweensOf([block, ...linesOf(block), ...extrasOf(block)]);
          if (i !== prev && i !== next) gsap.set(block, { autoAlpha: 0 });
        });

        const outgoing = blocks[prev];
        const incoming = blocks[next];

        // Lines only exist once fonts have loaded and the text is split. A
        // change before that (page loaded mid-section) just swaps the blocks.
        const outLines = linesOf(outgoing);
        const inLines = linesOf(incoming);

        if (!outLines.length || !inLines.length) {
          gsap.set(outgoing, { autoAlpha: 0 });
          gsap.set(incoming, { autoAlpha: 1 });
          gsap.set(extrasOf(incoming), { opacity: 1 });
          return;
        }

        gsap.set(outgoing, { autoAlpha: 1 });
        gsap.to(extrasOf(outgoing), { opacity: 0, duration: 0.3 });
        gsap.to(outLines, {
          yPercent: -100,
          opacity: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: "power3.inOut",
        });
        gsap.set(outgoing, { autoAlpha: 0, delay: 0.95 });

        gsap.set(incoming, { autoAlpha: 1 });
        gsap.fromTo(
          inLines,
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
        // The site-wide film grain sits above everything, covers included.
        // The frame cannot be lifted over it (the pinned container is its own
        // stacking context), so the grain drops to 2% while this is pinned.
        onToggle: (self) => {
          document.documentElement.toggleAttribute("data-grain-low", self.isActive);
        },
        onUpdate: (self) => {
          fill.style.transform = `scaleY(${self.progress})`;
          change(Math.min(count - 1, Math.floor(self.progress * count)));
        },
      });

      /* Headline stats count up once, as the section comes into view */
      gsap.utils.toArray<HTMLElement>(".js-stats").forEach((stats) => {
        playStatCounts(stats, section, "top 60%");
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
        document.documentElement.removeAttribute("data-grain-low");
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
      {/* pt 68px: the text starts ~32px under the top bar's 36px. */}
      <div className="sticky top-0 grid h-screen grid-cols-12 grid-rows-[auto_1fr] gap-x-6 px-10 pt-[68px] pb-10">
        {/* Left-edge progress */}
        <div className="absolute top-[68px] bottom-10 left-4 w-px bg-graphite/40" aria-hidden>
          <div className="js-progress-fill h-full w-full origin-top scale-y-0 bg-signal" />
        </div>

        {/* Header row — over the image column; the text panel has the left
            column to itself, from the top. */}
        <div className="col-span-6 col-start-7 row-start-1 flex items-end justify-between">
          <h2 className="self-start font-mono text-xs tracking-[0.2em]">{INDEX_LABEL}</h2>

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
        {/* Top-aligned and spanning both rows, so every entry starts at the
            same height and has the full viewport to fit in. grid-cols-1 pins
            the column to the panel's width: an auto column would grow to the
            longest unbroken line (the one-line credit) and run under the image. */}
        <div className="col-span-5 col-start-1 row-span-2 row-start-1 grid grid-cols-1 content-start">
          {works.map((work, i) => (
            <div
              key={work.no}
              className={`js-work-text col-start-1 row-start-1 ${i === 0 ? "" : "invisible opacity-0"}`}
            >
              <p className="js-split font-mono text-xs text-signal uppercase">
                {work.kind}
              </p>
              <h3 className="js-split mt-3 font-display text-[clamp(48px,5.2vw,96px)] leading-[0.9] uppercase">
                {work.title}
              </h3>
              <WorkYear
                year={work.year}
                draft={work.periodDraft}
                className="mt-3"
                textClassName="js-split"
              />
              {/* Three lines at most, so the slide fits one viewport; the full
                  summary is on the mobile card and in the case study. */}
              <p
                className={`js-split line-clamp-3 font-serif leading-snug text-paper/85 ${
                  isFeatured(work) ? "mt-3 text-lg" : "mt-4 text-xl"
                }`}
              >
                {work.summary}
              </p>
              {isFeatured(work) && (
                <>
                  <p className="js-split mt-3 font-mono text-[11px] leading-relaxed text-graphite">
                    {work.role}
                  </p>
                  <WorkCredit work={work} oneLine className="js-work-extra mt-1" />
                </>
              )}
              <WorkStats
                work={work}
                notes="tooltip"
                className={`js-work-extra js-stats mt-4 grid gap-x-4 gap-y-6 ${
                  factsAsStats(work) ? "grid-cols-3" : "grid-cols-4"
                }`}
              />
              {work.outcomes?.length ? (
                <div className="js-work-extra mt-4">
                  <h4 className="sr-only">{OUTCOMES_LABEL}</h4>
                  <OutcomeTitles work={work} compact />
                </div>
              ) : null}
              {isFeatured(work) ? (
                <>
                  {/* Facts and practices are left to the mobile card and the
                      case study: they do not fit one viewport at 1280×720. */}
                  <StackTags
                    stack={work.stack}
                    draft={work.stackDraft}
                    small
                    className="js-work-extra mt-4"
                  />
                  {/* TODO(step 09): "Read the case study →" link to /work/erp
                      once that route exists. */}
                </>
              ) : (
                <>
                  <p className="js-split mt-6 font-mono text-xs">Role — {work.role}</p>
                  <WorkCredit work={work} oneLine className="js-work-extra mt-1" />
                  <StackTags
                    stack={work.stack}
                    draft={work.stackDraft}
                    className="js-work-extra mt-6"
                  />
                </>
              )}
              <WorkLinks
                work={work}
                className={`js-work-extra ${isFeatured(work) ? "mt-4" : "mt-6"}`}
              />
            </div>
          ))}
        </div>

        {/* Image frame */}
        <figure className="col-span-6 col-start-7 row-start-2 self-center">
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
