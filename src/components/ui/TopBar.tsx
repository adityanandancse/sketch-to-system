"use client";

import { useState } from "react";
import { useISTClock } from "@/hooks/useISTClock";
import RollText from "./RollText";

const TIME_PLACEHOLDER = "--:--";

const button =
  "group flex cursor-pointer items-center gap-2 font-mono text-xs tracking-[0.2em]";

export default function TopBar() {
  const clock = useISTClock();
  const time = clock === TIME_PLACEHOLDER ? clock : `${clock} (IST)`;
  const [soundOn, setSoundOn] = useState(false);

  return (
    <header className="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-start justify-between px-6 py-5 text-paper mix-blend-difference md:px-10">
      <span className="font-mono text-xs tracking-[0.2em]">ADITYA NANDAN</span>

      <p className="absolute left-1/2 hidden -translate-x-1/2 text-center font-mono text-[11px] uppercase md:block">
        <span className="block">+ Current time in Noida, India:</span>
        <span className="block">{time}</span>
      </p>

      <div className="pointer-events-auto flex items-center gap-6 md:gap-8">
        {/* Local state only — no audio wired up yet. */}
        <button
          type="button"
          className={button}
          aria-label="Sound"
          aria-pressed={soundOn}
          onClick={() => setSoundOn((on) => !on)}
        >
          <RollText text="SOUND" />
          <span className="text-[10px] opacity-60">{soundOn ? "ON" : "OFF"}</span>
        </button>

        {/* No-op for now. */}
        <button
          type="button"
          className={button}
          aria-label="Menu"
          aria-expanded={false}
        >
          <RollText text="MENU" />
        </button>
      </div>
    </header>
  );
}
