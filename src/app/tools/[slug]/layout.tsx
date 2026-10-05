/**
 * BuildCalc Pro — Reusable tool wrapper layout.
 *
 * Provides for every /tools/[slug] page:
 *   - Breadcrumbs (Home > Category > Tool)
 *   - Quick-action bar: Reset Inputs · Save JSON Draft · Open Master Cart
 *   - Related tools sidebar for one-click switching between estimators
 */
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getToolBySlug,
  getCategory,
  relatedTools,
  toolHref,
  categoryHref,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { ToolActionBar } from "@/components/tools/ToolActionBar";
import { ToolBreadcrumbs } from "@/components/tools/ToolBreadcrumbs";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ToolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  const category = getCategory(tool.category);
  const related = relatedTools(tool, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-5 w-72" />}>
          <ToolBreadcrumbs tool={tool} />
        </Suspense>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <ToolActionBar />
          {children}
        </div>

        <aside aria-label="Related tools" className="lg:sticky lg:top-32 lg:self-start">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-zinc-400">
            Related tools
          </h2>
          <div className="mt-3 space-y-2">
            {related.map((t) => {
              const Icon = toolIcon(t.iconName);
              const isActive = t.slug === tool.slug;
              return (
                <Link
                  key={t.id}
                  href={toolHref(t)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors min-h-[64px] " +
                    (isActive
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-card hover:border-primary/40")
                  }
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-zinc-900">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {t.title}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {t.estimatedTime ?? "< 1 min"}
                      {!t.available && " · Soon"}
                    </span>
                  </span>
                  {isActive && (
                    <Badge variant="default" className="shrink-0 text-[10px]">
                      Open
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          <Card className="mt-4">
            <CardHeader className="p-4">
              <CardTitle className="text-sm">More in {category.label.split(",")[0]}</CardTitle>
              <Link
                href={categoryHref(tool.category)}
                className="mt-1 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary hover:underline"
              >
                Open category hub →
              </Link>
            </CardHeader>
          </Card>
        </aside>
      </div>
    </div>
  );
}
