"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import DraftBadge from "@/components/ui/DraftBadge";
import RollText from "@/components/ui/RollText";
import { showDraft } from "@/lib/draft";
import { contact, profile } from "@/content/site";

const MAGNET_PX = 18;
const COPIED_MS = 1600;

// A draft / example-placeholder email is shown in development only.
const emailIsDraft =
  contact.emailDraft || contact.email.endsWith("@example.com");
const emailVisible = showDraft(emailIsDraft);
// Same for the résumé link until the PDF exists.
const resumeVisible = showDraft(profile.resumeDraft);
const socials = contact.socials.filter((social) => social.href);

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      return; // Clipboard unavailable or denied — leave the label alone.
    }
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  useGSAP(
    (_context, contextSafe) => {
      const section = root.current;
      if (!section) return;

      // Reduced motion: no reveal, no magnet.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      /* Magnetic email link (fine pointers only) */
      const zone = section.querySelector<HTMLElement>(".js-magnet-zone");
      const link = section.querySelector<HTMLElement>(".js-magnet");
      let removeMagnet = () => {};

      if (zone && link && !window.matchMedia("(pointer: coarse)").matches) {
        const xTo = gsap.quickTo(link, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(link, "y", { duration: 0.4, ease: "power3.out" });
        const clamp = gsap.utils.clamp(-1, 1);

        const onMove = (event: PointerEvent) => {
          const rect = zone.getBoundingClientRect();
          const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          xTo(clamp(nx) * MAGNET_PX);
          yTo(clamp(ny) * MAGNET_PX);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        zone.addEventListener("pointermove", onMove);
        zone.addEventListener("pointerleave", onLeave);
        removeMagnet = () => {
          zone.removeEventListener("pointermove", onMove);
          zone.removeEventListener("pointerleave", onLeave);
        };
      }

      /* Reveal, once fonts are ready */
      let cancelled = false;
      let split: SplitText | undefined;

      const reveal = () => {
        split = SplitText.create(".js-contact-line", { type: "chars", mask: "chars" });
        gsap
          .timeline({
            scrollTrigger: { trigger: ".js-contact-lines", start: "top 80%" },
          })
          .from(split.chars, {
            yPercent: 110,
            duration: 1,
            stagger: 0.025,
            ease: "expo.out",
          })
          .from(
            ".js-contact-fade",
            { y: 30, autoAlpha: 0, duration: 0.9, ease: "power2.out" },
            ">-0.6",
          );
      };

      const safeReveal = contextSafe ? contextSafe(reveal) : reveal;
      document.fonts.ready.then(() => {
        if (!cancelled) safeReveal();
      });

      return () => {
        cancelled = true;
        split?.revert();
        removeMagnet();
      };
    },
    { scope: root },
  );

  return (
    <section
      id="contact"
      ref={root}
      className="flex min-h-screen flex-col justify-between gap-16 bg-ink px-6 py-32 text-paper md:px-10"
    >
      {/* Index row */}
      <div className="flex items-center gap-6">
        <span className="font-mono text-xs tracking-[0.2em]">{contact.index}</span>
        <span className="h-px flex-1 bg-graphite" aria-hidden />
      </div>

      <h2 className="js-contact-lines font-display text-[clamp(3.5rem,11vw,12rem)] leading-[0.85] uppercase">
        {contact.lines.map((line, i) => (
          <span
            key={line}
            className={`js-contact-line block ${i > 0 ? "md:pl-[12vw]" : ""}`}
          >
            {line}
          </span>
        ))}
      </h2>

      <div className="js-contact-fade relative">
        {emailVisible ? (
          <>
            <DraftBadge draft={emailIsDraft} className="-top-8 left-0" />

            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              {/* Padded box the magnet listens on. */}
              <div className="js-magnet-zone -m-6 p-6">
                <a
                  href={`mailto:${contact.email}`}
                  className="js-magnet relative inline-block font-serif text-[clamp(2rem,6vw,6.5rem)] leading-tight break-all italic after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.19,1,0.22,1)] hover:after:scale-x-100 motion-reduce:after:transition-none"
                >
                  {contact.email}
                </a>
              </div>

              <button
                type="button"
                onClick={copyEmail}
                aria-label={copied ? "Email copied" : "Copy email address"}
                className="group mb-3 cursor-pointer font-mono text-xs tracking-[0.2em]"
              >
                <RollText text={copied ? "COPIED" : "COPY"} />
              </button>
            </div>

            <p className="mt-6 font-mono text-xs text-graphite">{contact.reply}</p>
          </>
        ) : (
          <p className="font-serif text-[clamp(1.5rem,3vw,3rem)] italic">
            Reach me on LinkedIn or GitHub below.
          </p>
        )}

        {socials.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group inline-flex font-mono text-xs tracking-[0.2em] uppercase"
                >
                  <RollText text={`${social.label} ↗`} />
                </a>
              </li>
            ))}
          </ul>
        )}

        {resumeVisible && (
          <div className="relative mt-10 inline-block">
            <a
              href={profile.resumeUrl}
              download="Aditya-Nandan-Resume.pdf"
              aria-label="Download resume"
              className="group inline-flex border border-paper/40 px-5 py-3 font-mono text-xs tracking-[0.2em]"
            >
              <RollText text="DOWNLOAD RESUME ↓" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
