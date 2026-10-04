/**
 * BuildCalc Pro — Hook for calculator components to register with the
 * tool-page quick-action bar (Reset Inputs / Save JSON Draft).
 *
 * Usage inside a tool component:
 *   useToolActions({
 *     toolTitle: "Concrete Slab Calculator",
 *     resetInputs: () => { setLength(20); ... },
 *     saveDraft: () => saveToolDraft("concrete-slab", { length, width }),
 *   });
 */
"use client";

import * as React from "react";
import { useToolPageStore, type ToolActions } from "@/store/useToolPageStore";

export function useToolActions(actions: ToolActions): void {
  const registerActions = useToolPageStore((s) => s.registerActions);
  const clearActions = useToolPageStore((s) => s.clearActions);
  const ref = React.useRef(actions);
  ref.current = actions;

  React.useEffect(() => {
    // Register stable wrappers so tools don't need memoized callbacks.
    registerActions({
      toolTitle: ref.current.toolTitle,
      resetInputs: () => ref.current.resetInputs(),
      saveDraft: () => ref.current.saveDraft(),
    });
    return () => clearActions();
  }, [registerActions, clearActions]);
}

/* ------------------------------------------------------------------ */
/*  JSON draft helpers (localStorage, per-tool)                         */
/* ------------------------------------------------------------------ */

export interface ToolDraft {
  app: "buildcalc-pro";
  kind: "tool-draft";
  slug: string;
  savedAt: string;
  inputs: Record<string, number | string>;
}

export function draftKey(slug: string): string {
  return `buildcalc_draft_${slug}`;
}

/** Save current inputs as a JSON draft on this device. */
export function saveToolDraft(
  slug: string,
  inputs: Record<string, number | string>,
): void {
  const draft: ToolDraft = {
    app: "buildcalc-pro",
    kind: "tool-draft",
    slug,
    savedAt: new Date().toISOString(),
    inputs,
  };
  try {
    window.localStorage.setItem(draftKey(slug), JSON.stringify(draft));
  } catch {
    // Private mode — the toast will say it couldn't save.
    throw new Error("Draft could not be saved (browser storage blocked).");
  }
}

/** Load a previously saved draft, or null. */
export function loadToolDraft(slug: string): ToolDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ToolDraft;
    if (parsed?.app !== "buildcalc-pro" || parsed?.kind !== "tool-draft") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Delete the draft for a tool. */
export function clearToolDraft(slug: string): void {
  try {
    window.localStorage.removeItem(draftKey(slug));
  } catch {
    /* noop */
  }
}
