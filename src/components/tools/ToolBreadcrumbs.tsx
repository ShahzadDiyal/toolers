/**
 * BuildCalc Pro — Trade-aware breadcrumbs for tool pages (client).
 *
 * Reads ?trade= from the URL (set by category hubs) to render the full
 * trail: Home > Category > Sub-Trade > Tool. Falls back to
 * Home > Category > Tool when no trade is present.
 */
"use client";

import { useSearchParams } from "next/navigation";
import type { ToolMetadata } from "@/types/estimator";
import { getCategory, categoryHref } from "@/data/toolsRegistry";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export function ToolBreadcrumbs({ tool }: { tool: ToolMetadata }) {
  const searchParams = useSearchParams();
  const category = getCategory(tool.category);

  const rawTrade = searchParams.get("trade");
  const trade =
    rawTrade &&
    category.subtrades.some(
      (s) => s.toLowerCase() === decodeURIComponent(rawTrade).trim().toLowerCase(),
    )
      ? decodeURIComponent(rawTrade).trim()
      : null;

  return (
    <Breadcrumbs
      items={[
        { label: "Home", href: "/" },
        { label: category.label, href: categoryHref(tool.category) },
        ...(trade
          ? [
              {
                label: trade,
                href: `${categoryHref(tool.category)}?trade=${encodeURIComponent(trade)}`,
              },
            ]
          : []),
        { label: tool.title },
      ]}
    />
  );
}
