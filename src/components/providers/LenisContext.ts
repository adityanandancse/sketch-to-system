"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

export const LenisContext = createContext<Lenis | null>(null);

/**
 * Returns the active Lenis instance, or null before it mounts and when
 * smooth scrolling is skipped (prefers-reduced-motion).
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}
