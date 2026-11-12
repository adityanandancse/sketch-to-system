"use client";

import { useSyncExternalStore } from "react";

// Pinned / scroll-driven layouts only on md+ and when motion is allowed.
const PINNED_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PINNED_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(PINNED_QUERY).matches;
// Server render and hydration always use the simple stacked layout.
const getServerSnapshot = () => false;

/**
 * True when a section should use its pinned desktop layout; false on mobile,
 * under prefers-reduced-motion, and during server render / hydration.
 */
export function usePinnedLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
