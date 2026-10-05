/**
 * BuildCalc Pro Shared tool card.
 *
 * Used by the category hubs, the /tools directory, and the categories index
 * search results. Shows: icon + title, trade tag badge, inputs → outputs
 * summary, pin toggle (localStorage), and a "Launch Calculator →" action.
 */
"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, Clock3, Lock } from "lucide-react";
import type { ToolMetadata } from "@/types/estimator";
import { getCategory, toolHref } from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function PinToggle({ slug, title }: { slug: string; title: string }) {
  const togglePinTool = useCategoryStore((s) => s.togglePinTool);
  const isPinned = useCategoryStore((s) => s.isPinned(slug));
  const pinned = isPinned;
  return (
    <button
      type="button"
      onClick={() => togglePinTool(slug)}
      aria-pressed={pinned}
      aria-label={pinned ? `Unpin ${title}` : `Pin ${title} for quick access`}
      title={pinned ? "Pinned tap to unpin" : "Pin for quick access"}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors",
        pinned
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-zinc-900 text-zinc-500 hover:border-primary hover:text-primary",
      )}
    >
      {pinned ? (
        <BookmarkCheck className="h-5 w-5" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </button>
  );
}

export function ToolCard({
  tool,
  showCategory = false,
  querySuffix,
}: {
  tool: ToolMetadata;
  showCategory?: boolean;
  /** Appended to tool links, e.g. "?trade=Flatwork" (breadcrumb continuity). */
  querySuffix?: string;
}) {
  const Icon = toolIcon(tool.iconName);
  const href = toolHref(tool) + (querySuffix ?? "");

  return (
    <Card className="flex h-full flex-col transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_30px_-8px_rgb(245_158_11/0.25)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={href}
            className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-lg"
            aria-label={`${tool.title} open calculator`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
              <Icon className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="min-w-0 text-lg leading-snug hover:text-primary">
              {tool.title}
            </CardTitle>
          </Link>
          <PinToggle slug={tool.slug} title={tool.title} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {tool.badge && (
            <Badge variant="accent" className="text-[10px]">
              {tool.badge}
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px]">
            {tool.subtrade}
          </Badge>
          {showCategory && (
            <Badge variant="outline" className="text-[10px]">
              {getCategory(tool.category).label.split(",")[0]}
            </Badge>
          )}
          {tool.available ? (
            <Badge variant="success" className="text-[10px]">
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              <Lock className="h-3 w-3" /> Soon
            </Badge>
          )}
          {tool.estimatedTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
              <Clock3 className="h-3 w-3" />
              {tool.estimatedTime}
            </span>
          )}
        </div>

        <CardDescription className="mt-2 line-clamp-2">
          {tool.shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="rounded-lg border border-border bg-zinc-950 px-3 py-2.5 text-[13px] leading-relaxed">
          {tool.inputsSummary && (
            <p className="text-zinc-400">
              <span className="font-bold uppercase tracking-wide text-zinc-500 text-[10px]">
                Inputs{" "}
              </span>
              <span className="font-mono text-zinc-300">{tool.inputsSummary}</span>
            </p>
          )}
          <p className="mt-1 text-zinc-400">
            <span className="font-bold uppercase tracking-wide text-zinc-500 text-[10px]">
              Outputs{" "}
            </span>
            <span className="font-semibold text-accent/90">
              {tool.outputs.join(" · ")}
            </span>
          </p>
        </div>

        <Link
          href={href}
          className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-lg px-1 text-sm font-bold text-primary transition-colors hover:gap-2.5 hover:underline"
          aria-label={`Launch ${tool.title}`}
        >
          Launch calculator <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
