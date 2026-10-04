/**
 * BuildCalc Pro — Online/offline awareness hook.
 *
 * The platform is 100% client-side: "offline" here is a feature badge, not an
 * error state. Components use this to show the "Private — no cloud" indicator
 * in the navbar and to reassure job-site users with spotty reception.
 */
"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true; // Assume online during SSR; corrected on hydration.
}

/** Returns true when the browser reports a network connection. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
