/**
 * BuildCalc Pro — Category navigation store.
 *
 * Persists contractor-pinned favorite tools to localStorage
 * (key `contractor_pinned_tools`) for one-tap access on the job site.
 * Zero backend — same pattern as the master estimate store.
 */
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const PINNED_TOOLS_KEY = "contractor_pinned_tools";
const MAX_PINS = 24;

interface CategoryNavState {
  /** Pinned tool slugs, most-recently-pinned first. */
  pinnedSlugs: string[];
  /** Pin/unpin a tool by slug. */
  togglePinTool: (slug: string) => void;
  /** Whether a slug is currently pinned. */
  isPinned: (slug: string) => boolean;
  /** Remove slugs that no longer exist in the registry. */
  prunePins: (validSlugs: string[]) => void;
}

function safeStorage() {
  if (typeof window === "undefined") {
    const map = new Map<string, string>();
    return {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
  }
  return {
    getItem: (k: string) => {
      try {
        return window.localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    setItem: (k: string, v: string) => {
      try {
        window.localStorage.setItem(k, v);
      } catch {
        /* private mode — pins just won't persist */
      }
    },
    removeItem: (k: string) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* noop */
      }
    },
  };
}

export const useCategoryStore = create<CategoryNavState>()(
  persist(
    (set, get) => ({
      pinnedSlugs: [],

      togglePinTool: (slug) => {
        const { pinnedSlugs } = get();
        const next = pinnedSlugs.includes(slug)
          ? pinnedSlugs.filter((s) => s !== slug)
          : [slug, ...pinnedSlugs].slice(0, MAX_PINS);
        set({ pinnedSlugs: next });
      },

      isPinned: (slug) => get().pinnedSlugs.includes(slug),

      prunePins: (validSlugs) => {
        const valid = new Set(validSlugs);
        const { pinnedSlugs } = get();
        const pruned = pinnedSlugs.filter((s) => valid.has(s));
        if (pruned.length !== pinnedSlugs.length) set({ pinnedSlugs: pruned });
      },
    }),
    {
      name: PINNED_TOOLS_KEY,
      storage: createJSONStorage(() => safeStorage()),
      partialize: (s) => ({ pinnedSlugs: s.pinnedSlugs }) as CategoryNavState,
    },
  ),
);

/** Selector: pinned slugs array (for lists). */
export function usePinnedSlugs(): string[] {
  return useCategoryStore((s) => s.pinnedSlugs);
}
