/**
 * BuildCalc Pro — Category hub: /categories/[category].
 *
 * Server shell (SEO metadata, static params) + client hub view with
 * ?trade= / ?search= URL-synced filtering. useSearchParams requires a
 * Suspense boundary for static prerendering.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/data/toolsRegistry";
import { CategoryHubView } from "@/components/category/CategoryHubView";
import { Skeleton } from "@/components/ui/skeleton";
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

function HubFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-11 w-full max-w-md" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-11 w-28 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID.has(category)) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Suspense fallback={<HubFallback />}>
        <CategoryHubView category={category as Category} />
      </Suspense>
    </div>
  );
}
