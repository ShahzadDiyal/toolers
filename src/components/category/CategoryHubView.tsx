/**
 * BuildCalc Pro Category hub view (client).
 *
 * Instant client-side filtering with URL query synchronization:
 *   ?trade=<sub-trade>&search=<term>
 * `router.replace` updates the URL without a page reload; the server shell
 * never refetches. Tool links carry the active trade so tool-page
 * breadcrumbs can show Home > Category > Trade > Tool.
 */
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Pin, Search } from "lucide-react";
import type { Category, ToolMetadata } from "@/types/estimator";
import { getCategory, toolsByCategory, toolHref } from "@/data/toolsRegistry";
import { useTranslation } from "@/i18n/I18nProvider";
import { toolIcon } from "@/lib/tool-icons";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { ToolCardGrid } from "@/components/category/ToolCardGrid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function normalizeTrade(value: string | null, subtrades: string[]): string {
  if (!value) return "All";
  const decoded = decodeURIComponent(value).trim().toLowerCase();
  if (decoded === "all") return "All";
  const match = subtrades.find((s) => s.toLowerCase() === decoded);
  return match ?? "All";
}

export function CategoryHubView({ category }: { category: Category }) {
  const { locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const meta = getCategory(category);
  const tools = React.useMemo(() => toolsByCategory(category), [category]);
  const Icon = toolIcon(meta.iconName);

  const trade = normalizeTrade(searchParams.get("trade"), meta.subtrades);
  const search = searchParams.get("search") ?? "";

  const setQuery = React.useCallback(
    (patch: { trade?: string; search?: string }) => {
      const next = new URLSearchParams(searchParams.toString());
      if (patch.trade !== undefined) {
        if (patch.trade === "All") next.delete("trade");
        else next.set("trade", patch.trade);
      }
      if (patch.search !== undefined) {
        if (patch.search.trim() === "") next.delete("search");
        else next.set("search", patch.search);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return tools.filter((t) => {
      if (trade !== "All" && t.subtrade !== trade) return false;
      if (!q) return true;
      return [t.title, t.shortDescription, t.subtrade, ...t.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tools, trade, search]);

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { All: tools.length };
    for (const s of meta.subtrades) {
      c[s] = tools.filter((t) => t.subtrade === s).length;
    }
    return c;
  }, [tools, meta.subtrades]);

  const live = tools.filter((t) => t.available).length;
  const tradeQuery = trade !== "All" ? `?trade=${encodeURIComponent(trade)}` : "";

  // Pinned tools in this category
  const pinnedSlugs = useCategoryStore((s) => s.pinnedSlugs);
  const pinned: ToolMetadata[] = React.useMemo(() => {
    const bySlug = new Map(tools.map((t) => [t.slug, t]));
    return pinnedSlugs
      .map((s) => bySlug.get(s))
      .filter((t): t is ToolMetadata => t !== undefined);
  }, [pinnedSlugs, tools]);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    ...(trade !== "All" ? [{ label: trade }] : []),
    { label: meta.label },
  ];

  return (
    <div>
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
          <Icon className="h-8 w-8 text-primary" />
        </span>
        <div className="max-w-2xl flex-1">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
            {meta.label}
          </h1>
          <p className="mt-2 text-zinc-400">{meta.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="default" className="font-mono">
              {tools.length} calculators
            </Badge>
            <Badge variant="success">{live} live</Badge>
            <Badge variant="secondary">{meta.tagline}</Badge>
          </div>
        </div>
      </div>

      {/* Quick-filter search */}
      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder={`Filter ${meta.label.split(",")[0].toLowerCase()} tools…`}
          value={search}
          onChange={(e) => setQuery({ search: e.target.value })}
          className="h-11 pl-11"
          aria-label={`Filter ${meta.label} tools`}
        />
      </div>

      {/* Pinned quick access */}
      {pinned.length > 0 && (
        <section aria-label="Pinned tools" className="mt-6">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent/90">
            <Pin className="h-3.5 w-3.5" />
            Pinned for quick access
          </p>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {pinned.map((t) => {
              const PIcon = toolIcon(t.iconName);
              return (
                <Link
                  key={t.id}
                  href={`${toolHref(t, locale)}${tradeQuery}`}
                  className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 py-2 pl-2 pr-4 text-sm font-semibold text-zinc-100 transition-colors hover:border-primary"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900">
                    <PIcon className="h-4 w-4 text-primary" />
                  </span>
                  {t.title}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Sub-trade tabs */}
      <div className="mt-6">
        <TradeFilterTabs
          subtrades={meta.subtrades}
          active={trade}
          onChange={(t) => setQuery({ trade: t })}
          counts={counts}
        />
      </div>

      {/* Grid */}
      <div className="mt-6">
        <ToolCardGrid
          tools={filtered}
          querySuffix={tradeQuery || undefined}
          onClearFilters={() => setQuery({ trade: "All", search: "" })}
          emptyHint={
            trade !== "All" || search
              ? `No ${meta.label.split(",")[0].toLowerCase()} tools match${trade !== "All" ? ` “${trade}”` : ""}${search ? ` for “${search}”` : ""}.`
              : undefined
          }
        />
      </div>
    </div>
  );
}
