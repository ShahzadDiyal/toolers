/**
 * BuildCalc Pro — Hero instant-search field.
 * Looks like a search input; opens the ⌘K command menu on interaction.
 */
"use client";

import { Search } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";

export function HeroSearch() {
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);

  return (
    <button
      type="button"
      onClick={() => setCommandOpen(true)}
      className="flex h-14 w-full items-center gap-3 rounded-xl border border-input bg-zinc-950 px-5 text-left shadow-[inset_0_2px_8px_rgb(0_0_0/0.55)] transition-colors hover:border-primary"
      aria-label="Search calculators"
    >
      <Search className="h-5 w-5 shrink-0 text-zinc-500" />
      <span className="flex-1 truncate text-base text-zinc-500">
        Search calculators — “shingles”, “rebar”, “markup”…
      </span>
      <kbd className="hidden shrink-0 rounded-md border border-border bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-400 sm:block">
        ⌘K
      </kbd>
    </button>
  );
}
