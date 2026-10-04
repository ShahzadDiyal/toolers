/**
 * BuildCalc Pro — Category tool filter (client).
 * Sub-trade tabs + live search over one category's tools.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Lock, Search } from "lucide-react";
import type { ToolMetadata } from "@/types/estimator";
import { toolHref } from "@/data/toolsRegistry";
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
import { cn } from "@/lib/utils";

export function CategoryToolFilter({
  tools,
  subtrades,
}: {
  tools: ToolMetadata[];
  subtrades: string[];
}) {
  const [tab, setTab] = React.useState("All");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (tab !== "All" && t.subtrade !== tab) return false;
      if (!q) return true;
      return [t.title, t.shortDescription, t.subtrade, ...t.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tools, tab, query]);

  return (
    <div>
      {/* Sub-trade tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Filter by sub-trade"
      >
        {["All", ...subtrades].map((s) => {
          const count =
            s === "All" ? tools.length : tools.filter((t) => t.subtrade === s).length;
          const active = tab === s;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(s)}
              className={cn(
                "flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary",
              )}
            >
              {s}
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[11px]",
                  active ? "bg-primary/25 text-primary" : "bg-zinc-800 text-zinc-500",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mt-4 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder={`Search ${tools.length} tools…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 pl-11"
          aria-label="Search tools in this category"
        />
      </div>

      {/* Tool cards */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => {
            const Icon = toolIcon(t.iconName);
            return (
              <Link key={t.id} href={toolHref(t)} className="min-h-[44px]">
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
                        <Icon className="h-5 w-5 text-primary" />
                      </span>
                      <div className="flex flex-col items-end gap-1.5">
                        {t.available ? (
                          <Badge variant="success">Live</Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lock className="h-3 w-3" /> Soon
                          </Badge>
                        )}
                        {t.estimatedTime && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                            <Clock className="h-3 w-3" />
                            {t.estimatedTime}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="mt-3 w-fit text-[10px]">
                      {t.subtrade}
                    </Badge>
                    <CardTitle className="mt-1.5 text-lg">{t.title}</CardTitle>
                    <CardDescription>{t.shortDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                      Outputs
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">{t.outputs.join(" · ")}</p>
                    <span className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 font-bold text-primary">
                      Open calculator <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-700 p-10 text-center">
          <p className="font-semibold text-zinc-300">
            No tools match{tab !== "All" ? ` in “${tab}”` : ""}
            {query && ` for “${query}”`}.
          </p>
          <button
            onClick={() => {
              setTab("All");
              setQuery("");
            }}
            className="mt-3 min-h-[44px] rounded-lg border border-primary/50 px-4 text-sm font-bold text-primary hover:bg-primary/10"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
