"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import DraftBadge from "@/components/ui/DraftBadge";
import { isDev } from "@/lib/draft";
import { experience } from "@/content/site";

const isTodo = (text: string) => text.startsWith("TODO");

// Roles always render; in production any unfinished "TODO" copy is stripped.
const roles = experience.roles.map((role) =>
  isDev
    ? role
    : {
        ...role,
        period: role.period.includes("TODO") ? "—" : role.period,
        points: role.points.filter((point) => !isTodo(point)),
        stackGroups: role.stackGroups
          ?.map((group) => ({
            ...group,
            items: group.items.filter((item) => !isTodo(item)),
          }))
          .filter((group) => group.items.length > 0),
      },
);

type RowProps = {
  period: string;
  type: string;
  title: string;
  org: string;
  draft?: boolean;
  children?: ReactNode;
};

function Row({ period, type, title, org, draft = false, children }: RowProps) {
  return (
    <article className="js-exp-row relative py-10">
      <span
        className="js-exp-rule absolute inset-x-0 top-0 h-px bg-graphite/40"
        aria-hidden
      />
      <DraftBadge draft={draft} className="top-3 right-0" />

      <div className="grid grid-cols-1 gap-y-5 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-3">
          <p className="js-exp-text font-mono text-xs text-graphite">{period}</p>
          <p className="js-exp-text mt-2 max-w-[26ch] font-mono text-[11px] leading-relaxed text-graphite">
            {type}
          </p>
        </div>

        <div className="md:col-span-4">
          <h3 className="js-exp-text font-display text-[clamp(1.6rem,2.6vw,2.8rem)] leading-[0.95] uppercase">
            {title}
          </h3>
          <p className="js-exp-text mt-3 font-serif text-xl text-signal italic">
            {org}
          </p>
        </div>

        <div className="md:col-span-5">{children}</div>
      </div>
    </article>
  );
}

export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const section = root.current;
      if (!section) return;

      // Reduced motion: no animations; the progress line shows filled.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      /* Left-edge line fills with scroll progress through the section */
      gsap.fromTo(
        ".js-exp-progress",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        },
      );

      let cancelled = false;
      const splits: SplitText[] = [];

      const animate = () => {
        gsap.utils.toArray<HTMLElement>(".js-exp-row").forEach((row) => {
          const scrollTrigger = { trigger: row, start: "top 85%" };

          gsap.from(row.querySelector(".js-exp-rule"), {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1,
            ease: "power3.inOut",
            scrollTrigger,
          });

          // The education row has no dashes or pills to fade.
          const fades = row.querySelectorAll(".js-exp-fade");
          if (fades.length) {
            gsap.from(fades, {
              autoAlpha: 0,
              duration: 0.6,
              delay: 0.8,
              scrollTrigger,
            });
          }

          // Line masks, re-split on resize.
          splits.push(
            SplitText.create(row.querySelectorAll(".js-exp-text"), {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 100,
                  duration: 0.9,
                  stagger: 0.04,
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

  const { education } = experience;

  return (
    <section
      id="experience"
      ref={root}
      className="relative bg-ink px-6 py-32 text-paper md:px-10 md:py-44"
    >
      {/* Left-edge progress line (md+) */}
      <div
        className="absolute top-32 bottom-32 left-4 hidden w-px bg-graphite/30 md:block"
        aria-hidden
      >
        <div className="js-exp-progress h-full w-full origin-top bg-signal" />
      </div>

      {/* Index row */}
      <div className="flex items-center gap-6">
        <span className="font-mono text-xs tracking-[0.2em]">{experience.index}</span>
        <span className="h-px flex-1 bg-graphite" aria-hidden />
      </div>

      <h2 className="mt-16 font-serif text-[clamp(2.5rem,5vw,5.5rem)] leading-none italic md:mt-24">
        {experience.heading}
      </h2>

      <div className="mt-16 md:mt-24">
        {roles.map((role) => (
          <Row
            key={`${role.org}-${role.title}`}
            period={role.period}
            type={role.type}
            title={role.title}
            org={role.org}
            draft={role.draft}
          >
            {role.points.length > 0 && (
              <ul className="space-y-3">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="js-exp-fade text-graphite" aria-hidden>
                      —
                    </span>
                    <span className="js-exp-text font-sans text-base text-paper/80">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {/* Tech by area: stacked on mobile, two columns of groups on md+. */}
            {role.stackGroups && role.stackGroups.length > 0 && (
              <div className="js-exp-fade mt-6 grid grid-cols-1 gap-x-6 gap-y-2.5 md:grid-cols-2">
                {role.stackGroups.map((group) => (
                  <div key={group.label}>
                    <h4 className="font-mono text-[10px] tracking-[0.15em] text-graphite uppercase">
                      {group.label}
                    </h4>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-graphite/50 px-3 py-1 font-mono text-[11px]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Row>
        ))}

        <Row
          period="EDUCATION"
          type={education.period}
          title={education.degree}
          org={education.school}
        >
          <p className="js-exp-text font-sans text-base text-paper/80">
            {education.note}
          </p>
        </Row>
      </div>
    </section>
  );
}
