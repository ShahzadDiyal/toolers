/**
 * BuildCalc Pro — Recently used tools.
 *
 * Tiny localStorage-backed MRU list (max 8 slugs) powering the homepage
 * "Quick Access" section and the command menu's "Recent" group.
 * Entirely client-side; safe to call during SSR (no-ops).
 */
"use client";

import { getToolBySlug } from "@/data/toolsRegistry";
import type { ToolMetadata } from "@/types/estimator";

const KEY = "buildcalc_recent_tools";
const MAX = 8;

function readSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string").slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

/** Most-recent-first list of tool metadata (drops unknown slugs). */
export function getRecentTools(): ToolMetadata[] {
  const out: ToolMetadata[] = [];
  for (const slug of readSlugs()) {
    const tool = getToolBySlug(slug);
    if (tool) out.push(tool);
  }
  return out;
}

/** Push a slug to the front of the MRU list. */
export function pushRecentTool(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = [slug, ...readSlugs().filter((s) => s !== slug)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode etc. — recents are a nicety, not a requirement.
  }
}

/** React hook returning the recent list (refreshes on mount + focus). */
import * as React from "react";

export function useRecentTools(): ToolMetadata[] {
  const [tools, setTools] = React.useState<ToolMetadata[]>([]);
  React.useEffect(() => {
    setTools(getRecentTools());
    const onFocus = () => setTools(getRecentTools());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  return tools;
}
