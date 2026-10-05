/**
 * BuildCalc Pro Reusable breadcrumb navigation.
 *
 * - Accessible: <nav aria-label="Breadcrumb"> + ordered list.
 * - Schema.org BreadcrumbList microdata for SEO.
 * - Mobile (<640px): collapses to a single compact back link
 *   ("← Back to {parent}") thumb-friendly on the job site.
 * - Slug normalization helper for dynamic routes.
 */
"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { getCategory } from "@/data/toolsRegistry";
import type { Category } from "@/types/estimator";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Omitted for the current page. */
  href?: string;
}

const KNOWN_CATEGORIES = new Set<string>([
  "concrete",
  "framing-roofing",
  "finishes",
  "site-exterior",
  "mep",
  "financial-business",
  "utilities",
]);

/**
 * Normalize a route segment into a display label.
 * Category slugs resolve via the registry; anything else is de-slugified
 * ("roof-pitch-shingles" → "Roof Pitch Shingles").
 */
export function labelForSegment(segment: string): string {
  if (KNOWN_CATEGORIES.has(segment)) {
    return getCategory(segment as Category).label;
  }
  return segment
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  const parent = items.length > 1 ? items[items.length - 2] : null;
  const current = items[items.length - 1];

  return (
    <nav aria-label="Breadcrumb">
      {/* Desktop / tablet: full trail with schema.org microdata */}
      <ol className="hidden flex-wrap items-center gap-1.5 text-sm text-zinc-500 sm:flex">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={`${item.label}-${i}`}
              className="flex items-center gap-1.5"
              itemScope
              itemProp="itemListElement"
              itemType="https://schema.org/ListItem"
            >
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" aria-hidden />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="rounded px-1 py-1 transition-colors hover:text-primary"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  itemProp="name"
                  aria-current={isLast ? "page" : undefined}
                  className={cn(isLast && "text-zinc-200")}
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(i + 1)} />
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact back link */}
      <div className="sm:hidden">
        {parent?.href ? (
          <Link
            href={parent.href}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            Back to {parent.label}
          </Link>
        ) : (
          <span className="text-sm font-semibold text-zinc-300">{current.label}</span>
        )}
      </div>
    </nav>
  );
}
