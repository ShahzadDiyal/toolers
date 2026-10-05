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
      className="flex h-14 w-full items-center gap-3 rounded-xl border border-border bg-white px-5 text-left shadow-card transition-colors hover:border-[#2563EB]"
      aria-label="Search calculators"
    >
      <Search className="h-5 w-5 shrink-0 text-[#ED7D22]" />
      <span className="flex-1 truncate text-base text-[#5A6C85]">
        Search calculators — “shingles”, “rebar”, “markup”…
      </span>
      <kbd className="hidden shrink-0 rounded-md border border-border bg-[#F1F5F9] px-2 py-1 font-mono text-xs text-[#5A6C85] sm:block">
        ⌘K
      </kbd>
    </button>
  );
}
