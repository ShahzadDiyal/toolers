/**
 * BuildCalc Pro Global fuzzy search command menu (⌘K / Ctrl+K).
 *
 * Spotlight modal over the tool registry: keyboard-driven navigation,
 * category chips, recent tools, match highlighting, and clean empty states
 * with fallback suggestions. Selecting a tool pushes it to the recent list
 * and routes to /tools/[slug].
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, History, SearchX, Sparkles } from "lucide-react";
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
import {
  TOOLS,
  TOOL_CATEGORIES,
  getCategory,
  toolHref,
} from "@/data/toolsRegistry";
import type { Category, ToolMetadata } from "@/types/estimator";
import { toolIcon } from "@/lib/tool-icons";
import { getRecentTools, pushRecentTool } from "@/lib/recent-tools";

/* ------------------------------------------------------------------ */
/*  Fuzzy scoring                                                      */
/* ------------------------------------------------------------------ */

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}

/** Subsequence match bonus: characters of `q` appear in order in `text`. */
function subsequenceScore(q: string, text: string): number {
  let qi = 0;
  let ti = 0;
  let score = 0;
  let streak = 0;
  while (qi < q.length && ti < text.length) {
    if (q[qi] === text[ti]) {
      qi++;
      streak++;
      // Word-boundary hits score higher ("r" in "roof").
      if (ti === 0 || text[ti - 1] === " ") score += 3;
      score += 1 + Math.min(streak, 4) * 0.5;
    } else {
      streak = 0;
    }
    ti++;
  }
  return qi === q.length ? score : 0;
}

function scoreTool(tool: ToolMetadata, rawQuery: string): number {
  const q = normalize(rawQuery).trim();
  if (!q) return 1;
  const title = normalize(tool.title);
  const desc = normalize(tool.shortDescription);
  const cat = normalize(getCategory(tool.category).label);
  const tags = tool.tags.map(normalize).join(" ");

  let score = 0;
  if (title.includes(q)) score += 100;
  if (tags.includes(q)) score += 60;
  if (cat.includes(q)) score += 40;
  if (desc.includes(q)) score += 20;
  score += subsequenceScore(q, title) * 2;
  score += subsequenceScore(q, tags);
  return score;
}

function fuzzySearch(query: string): ToolMetadata[] {
  const q = query.trim();
  if (!q) return [];
  return TOOLS.map((t) => ({ t, s: scoreTool(t, q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.t.title.localeCompare(b.t.title))
    .map((r) => r.t);
}

/* ------------------------------------------------------------------ */
/*  Menu                                                               */
/* ------------------------------------------------------------------ */

const SUGGESTED_QUERIES = ["concrete", "roof", "stair", "paint", "fence", "markup"];

function ToolRow({ tool, onSelect }: { tool: ToolMetadata; onSelect: () => void }) {
  const Icon = toolIcon(tool.iconName);
  const cat = getCategory(tool.category);
  return (
    <CommandItem
      value={`${tool.title} ${tool.tags.join(" ")} ${tool.slug}`}
      onSelect={onSelect}
      className="min-h-[56px]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-zinc-900">
        <Icon className="h-5 w-5 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold">{tool.title}</span>
          {tool.badge && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {tool.badge}
            </Badge>
          )}
        </span>
        <span className="block truncate text-xs text-zinc-500">
          {tool.shortDescription}
        </span>
      </span>
      <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
        {cat.label.split(",")[0]}
      </Badge>
      {!tool.available && (
        <Badge variant="outline" className="shrink-0 text-[10px]">
          Soon
        </Badge>
      )}
      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
    </CommandItem>
  );
}

export function CommandMenu() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const [query, setQuery] = React.useState("");
  const [recent, setRecent] = React.useState<ToolMetadata[]>([]);

  // Global ⌘K / Ctrl+K toggle.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUiStore.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // Refresh recents each time the menu opens.
  React.useEffect(() => {
    if (open) {
      setRecent(getRecentTools());
      setQuery("");
    }
  }, [open ]);

  const results = React.useMemo(() => fuzzySearch(query), [query]);
  const searching = query.trim().length > 0;

  const go = (tool: ToolMetadata) => {
    pushRecentTool(tool.slug);
    setOpen(false);
    router.push(toolHref(tool));
  };

  const grouped = React.useMemo(() => {
    const map = new Map<Category, ToolMetadata[]>();
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
        placeholder="Search 31 calculators try “shingles”, “rebar”, “markup”…"
        value={query}
        onValueChange={setQuery}
        autoFocus
      />
      <CommandList>
        {!searching && recent.length > 0 && (
          <CommandGroup heading="Recent">
            {recent.map((t) => (
              <ToolRow key={t.id} tool={t} onSelect={() => go(t)} />
            ))}
          </CommandGroup>
        )}

        {!searching && (
          <CommandGroup heading="Browse all">
            {TOOL_CATEGORIES.map((c) => {
              const meta = getCategory(c);
              const Icon = toolIcon(meta.iconName);
              const count = TOOLS.filter((t) => t.category === c).length;
              return (
                <CommandItem
                  key={c}
                  value={`category ${meta.label}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/categories/${c}`);
                  }}
                  className="min-h-[48px]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-zinc-900">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="flex-1 truncate font-semibold">{meta.label}</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {count} tools
                  </Badge>
                  <CornerDownLeft className="h-3.5 w-3.5 text-zinc-600" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {searching &&
          grouped.map(({ category, tools }, gi) => (
            <React.Fragment key={category}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={getCategory(category).label}>
                {tools.map((t) => (
                  <ToolRow key={t.id} tool={t} onSelect={() => go(t)} />
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}

        <CommandEmpty>
          <div className="flex flex-col items-center gap-3 px-4 py-6">
            <SearchX className="h-8 w-8 text-zinc-600" />
            <p className="text-sm">
              No calculators match <span className="font-semibold text-zinc-300">“{query}”</span>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                <Sparkles className="h-3.5 w-3.5" /> Try:
              </span>
              {SUGGESTED_QUERIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-primary hover:text-primary min-h-[36px]"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
              <History className="h-3.5 w-3.5" />
              Tip: press <kbd className="rounded border border-border bg-zinc-900 px-1 font-mono">Esc</kbd> to close,
              <kbd className="rounded border border-border bg-zinc-900 px-1 font-mono">Enter</kbd> to open
            </p>
          </div>
        </CommandEmpty>
      </CommandList>
    </CommandDialog>
  );
}
