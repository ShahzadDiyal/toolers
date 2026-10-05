/**
 * BuildCalc Pro — Category index (/categories).
 *
 * Master overview: 7 interactive hero tiles, each listing its sub-tools as
 * clickable chips (jump straight to a tool without opening the hub), plus
 * a real-time global search across every tool in every category.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Search, LayoutGrid } from "lucide-react";
import {
  CATEGORIES,
  TOOLS,
  toolsByCategory,
  toolHref,
  categoryHref,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolCardGrid } from "@/components/category/ToolCardGrid";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

function CategoryTile({ categoryId }: { categoryId: string }) {
  const meta = CATEGORIES.find((c) => c.id === categoryId)!;
  const Icon = toolIcon(meta.iconName);
  const tools = toolsByCategory(meta.id);
  const live = tools.filter((t) => t.available).length;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={categoryHref(meta.id)}
            className="flex min-h-[44px] items-center gap-3"
            aria-label={`${meta.label} — open hub`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
              <Icon className="h-6 w-6 text-primary" />
            </span>
            <CardTitle className="text-xl leading-tight hover:text-primary">
              {meta.label}
            </CardTitle>
          </Link>
          <Badge variant="outline" className="shrink-0 font-mono">
            {live}/{tools.length}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{meta.blurb}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {/* Direct tool chips — jump without opening the hub */}
        <div className="flex flex-1 flex-wrap content-start gap-1.5" aria-label={`${meta.label} tools`}>
          {tools.map((t) => (
            <Link
              key={t.id}
              href={toolHref(t)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-xs font-semibold text-zinc-300 transition-colors hover:border-primary hover:text-primary"
            >
              {t.title
                .replace(" Calculator", "")
                .replace(" Estimator", "")}
              {!t.available && (
                <span className="text-[9px] uppercase tracking-wide text-zinc-600">
                  soon
                </span>
              )}
            </Link>
          ))}
        </div>
        <Link
          href={categoryHref(meta.id)}
          className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          Open {meta.label.split(",")[0]} hub <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const results = React.useMemo(() => {
    if (!searching) return [];
    return TOOLS.filter((t) =>
      [
        t.title,
        t.shortDescription,
        t.subtrade,
        CATEGORIES.find((c) => c.id === t.category)?.label ?? "",
        ...t.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [q, searching]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

      <div className="mt-6 max-w-2xl">
        <h1 className="flex items-center gap-3 font-display text-4xl font-extrabold uppercase tracking-wide sm:text-5xl">
          <LayoutGrid className="h-9 w-9 text-primary" />
          Browse by <span className="text-primary">trade</span>
        </h1>
        <p className="mt-3 text-zinc-400">
          Seven hubs of precision estimators. Tap any chip to jump straight
          into a calculator — or search everything at once.
        </p>
        <div className="relative mt-5 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search all tools — “rebar”, “shingles”, “margin”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-11 text-base"
            aria-label="Search all tools across categories"
          />
        </div>
      </div>

      {searching ? (
        <div className="mt-8">
          <p className="mb-4 text-sm text-zinc-400">
            <span className="font-mono font-bold text-primary">{results.length}</span>{" "}
            result{results.length === 1 ? "" : "s"} across all categories for{" "}
            <span className="font-semibold text-zinc-200">“{query.trim()}”</span>
          </p>
          <ToolCardGrid
            tools={results}
            showCategory
            onClearFilters={() => setQuery("")}
            emptyTitle={`No tools match “${query.trim()}”`}
            emptyHint="Try “concrete”, “roof”, “paint”, or press ⌘K for the smart search."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.id} categoryId={c.id} />
          ))}
        </div>
      )}
    </div>
  );
}
