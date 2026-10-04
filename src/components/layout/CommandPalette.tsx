/**
 * BuildCalc Pro — Cmd+K command palette.
 *
 * Fuzzy-ish search across every calculator (title, description, tags,
 * formula). Groups results by category; Enter jumps straight to the tool.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, SearchX } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useUiStore } from "@/store/useUiStore";
import { searchTools, toolHref, TOOL_CATEGORIES } from "@/lib/tools-registry";
import { CATEGORY_META, type Category } from "@/types/estimator";
import { toolIcon } from "@/lib/tool-icons";

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const [query, setQuery] = React.useState("");

  // Global ⌘K / Ctrl+K toggle.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUiStore.getState().paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const results = React.useMemo(() => searchTools(query), [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const byCategory = React.useMemo(() => {
    const map = new Map<Category, typeof results>();
    for (const t of results) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return TOOL_CATEGORIES.filter((c) => map.has(c)).map((c) => ({
      category: c,
      tools: map.get(c)!,
    }));
  }, [results]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search calculators — try “roof”, “concrete”, “paint”…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2">
            <SearchX className="h-8 w-8 text-zinc-600" />
            <p>No calculators match “{query}”.</p>
            <p className="text-xs text-zinc-600">Phase 2 adds more tools weekly.</p>
          </div>
        </CommandEmpty>

        {byCategory.map(({ category, tools }, gi) => (
          <React.Fragment key={category}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={CATEGORY_META[category].label}>
              {tools.map((t) => {
                const Icon = toolIcon(t.iconName);
                return (
                  <CommandItem
                    key={t.id}
                    value={`${t.title} ${t.tags.join(" ")}`}
                    onSelect={() => go(t.available ? toolHref(t) : "/tools")}
                    disabled={!t.available}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-900 border border-border">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{t.title}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {t.shortDescription}
                      </span>
                    </span>
                    {!t.available && (
                      <Badge variant="outline" className="text-[10px]">
                        Soon
                      </Badge>
                    )}
                    <CornerDownLeft className="h-3.5 w-3.5 text-zinc-600" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
