"use client";

import type { CSSProperties } from "react";

type RollTextProps = {
  text: string;
  className?: string;
};

const copy =
  "block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] [transition-delay:calc(var(--i)*18ms)] group-hover:-translate-y-full motion-reduce:transition-none";

/**
 * Per-character vertical roll. Triggers when an ancestor with the Tailwind
 * `group` class is hovered.
 */
export default function RollText({ text, className }: RollTextProps) {
  return (
    <span
      aria-label={text}
      className={`inline-flex leading-none ${className ?? ""}`}
    >
      {Array.from(text).map((char, i) => {
        const glyph = char === " " ? " " : char;
        return (
          <span
            key={i}
            aria-hidden
            className="roll-char relative inline-block overflow-hidden leading-none"
            style={{ "--i": i } as CSSProperties}
          >
            <span className={copy}>{glyph}</span>
            <span className={`${copy} absolute top-full left-0`}>{glyph}</span>
          </span>
        );
      })}
    </span>
  );
}
