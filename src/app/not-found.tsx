import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "404" };

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-ink px-6 text-center text-paper">
      <p className="font-mono text-xs tracking-[0.2em] text-graphite">404</p>
      <h1 className="font-display text-6xl leading-none uppercase md:text-8xl">
        Not built yet.
      </h1>
      <Link
        href="/"
        className="border border-paper/40 px-5 py-3 font-mono text-xs tracking-[0.2em] transition-colors hover:border-paper"
      >
        ← BACK TO INDEX
      </Link>
    </main>
  );
}
