"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useLenis } from "@/components/providers/LenisContext";
import RollText from "@/components/ui/RollText";
import { useISTClock } from "@/hooks/useISTClock";
import { showDraft } from "@/lib/draft";
import { contact, impact, nav, profile } from "@/content/site";

// The Impact section is not rendered when every metric is a hidden draft, so
// don't link to it then.
const impactVisible = impact.metrics.some((metric) => showDraft(metric.draft));
const pages = nav.filter((item) => item.href !== "#impact" || impactVisible);
const socials = contact.socials.filter((social) => social.href);

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] text-graphite uppercase">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function Footer() {
  const lenis = useLenis();
  const time = useISTClock();
  const nameBox = useRef<HTMLDivElement>(null);
  const nameText = useRef<HTMLSpanElement>(null);

  // Size the name so it spans the container width exactly.
  useEffect(() => {
    const box = nameBox.current;
    const text = nameText.current;
    if (!box || !text) return;

    const BASE = 100; // px, measuring size
    let fittedWidth = 0;

    const fit = (force = false) => {
      const width = box.clientWidth;
      if (!width || (!force && width === fittedWidth)) return;
      fittedWidth = width;
      text.style.fontSize = `${BASE}px`;
      const natural = text.getBoundingClientRect().width;
      if (natural) text.style.fontSize = `${(BASE * width) / natural}px`;
    };

    const observer = new ResizeObserver(() => fit());
    observer.observe(box);
    fit();

    // The display font changes the text's width once it loads.
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) fit(true);
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  const goTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    if (lenis) lenis.scrollTo(href, { offset: 0, duration: 1.4 });
    else document.querySelector(href)?.scrollIntoView();
  };

  return (
    <footer className="border-t border-graphite/40 bg-ink px-6 pt-16 pb-6 text-paper md:px-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
        <Column title="Pages">
          <ul className="space-y-2">
            {pages.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-label={item.label}
                  onClick={(event) => goTo(event, item.href)}
                  className="group inline-flex font-mono text-xs uppercase"
                >
                  <RollText text={item.label} />
                </a>
              </li>
            ))}
          </ul>
        </Column>

        <Column title="Profiles">
          {socials.length ? (
            <ul className="space-y-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group inline-flex font-mono text-xs uppercase"
                  >
                    <RollText text={social.label} />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs">—</p>
          )}
        </Column>

        <Column title="Local time">
          <p className="font-mono text-2xl">{time}</p>
          <p className="mt-2 font-mono text-[11px] text-graphite">
            in India · GMT +5:30
          </p>
        </Column>

        <Column title="Status">
          <p className="flex items-center gap-3 font-mono text-xs">
            <span className="relative block size-2 shrink-0 rounded-full bg-signal">
              <span
                className="absolute inset-0 animate-pulse-ring rounded-full bg-signal motion-reduce:animate-none"
                aria-hidden
              />
            </span>
            {profile.status}
          </p>
        </Column>
      </div>

      {/* Full-width name, fitted to the container by the effect above */}
      <div
        ref={nameBox}
        className="mt-16 overflow-hidden leading-none text-paper/10 select-none"
        aria-hidden
      >
        <span
          ref={nameText}
          className="inline-block font-display text-[15vw] leading-none whitespace-nowrap uppercase"
        >
          Aditya Nandan
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between font-mono text-[11px]">
        <span>© 2026 Aditya Nandan</span>
        <span className="font-script text-2xl leading-none text-signal">
          Sketch to System
        </span>
      </div>
    </footer>
  );
}
