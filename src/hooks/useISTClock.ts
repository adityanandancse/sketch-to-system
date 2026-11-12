"use client";

import { useSyncExternalStore } from "react";

const PLACEHOLDER = "--:--";

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 15_000);
  return () => window.clearInterval(id);
}

const getTime = () => timeFormat.format(new Date());
// Server + hydration render the placeholder, so markup always matches.
const getServerTime = () => PLACEHOLDER;

/**
 * Current time in India as "h:mm A". Returns "--:--" until mounted, then
 * updates every 15 seconds.
 */
export function useISTClock() {
  return useSyncExternalStore(subscribe, getTime, getServerTime);
}
