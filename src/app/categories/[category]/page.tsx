/**
 * BuildCalc Pro — Category hub: /categories/[category].
 * Filtered tool listing with sub-trade tabs.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  CATEGORIES,
  getCategory,
  toolsByCategory,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { Badge } from "@/components/ui/badge";
import { CategoryToolFilter } from "./CategoryToolFilter";
import type { Category } from "@/types/estimator";

const VALID = new Set<string>(CATEGORIES.map((c) => c.id));

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!VALID.has(category)) return {};
  const meta = getCategory(category as Category);
  return {
    title: `${meta.label} Calculators`,
    description: meta.blurb,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID.has(category)) notFound();
  const meta = getCategory(category as Category);
  const tools = toolsByCategory(meta.id);
  const live = tools.filter((t) => t.available).length;
  const Icon = toolIcon(meta.iconName);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500"
      >
        <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href="/categories"
          className="inline-flex min-h-[44px] items-center hover:text-primary"
        >
          Categories
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-300">{meta.label}</span>
      </nav>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
          <Icon className="h-8 w-8 text-primary" />
        </span>
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
              {meta.label}
            </h1>
          </div>
          <p className="mt-2 text-zinc-400">{meta.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono">
              {live}/{tools.length} live
            </Badge>
            <Badge variant="secondary">{meta.tagline}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CategoryToolFilter tools={tools} subtrades={meta.subtrades} />
      </div>
    </div>
  );
}
