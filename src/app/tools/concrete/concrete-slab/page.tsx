/**
 * BuildCalc Pro — Demo tool page: Concrete Slab Calculator.
 * Reference route shape for Phase 2: /tools/[category]/[slug].
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ConcreteSlab } from "@/components/calculators/ConcreteSlab";
import { getTool, toolsByCategory, toolHref } from "@/lib/tools-registry";
import { CATEGORY_META } from "@/types/estimator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toolIcon } from "@/lib/tool-icons";

const TOOL = getTool("concrete", "concrete-slab");

export const metadata: Metadata = {
  title: "Concrete Slab Calculator — Cubic Yards, Bags & Cost",
  description:
    "Free concrete slab calculator: cubic yards, 80/60-lb bags, waste allowance, and instant cost estimate. No login, works offline.",
};

export default function ConcreteSlabPage() {
  if (!TOOL) return null;
  const related = toolsByCategory("concrete").filter((t) => t.slug !== TOOL.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tools" className="hover:text-primary">Calculators</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tools#concrete" className="hover:text-primary">
          {CATEGORY_META.concrete.label}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-300">{TOOL.title}</span>
      </nav>

      <div className="max-w-5xl">
        <ConcreteSlab />
      </div>

      {/* Formula explainer (SEO + trust) */}
      <Card className="mt-8 max-w-5xl">
        <CardHeader>
          <CardTitle className="text-lg">How the math works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <p>
            <strong className="text-zinc-200">Volume.</strong> Length × width ×
            (thickness ÷ 12) gives cubic feet; divide by 27 for cubic yards —
            the unit ready-mix is sold in.
          </p>
          <p>
            <strong className="text-zinc-200">Waste.</strong> Order quantity =
            net yards × (1 + waste%). The 10–15% default covers spillage,
            over-excavation, and uneven subgrade.
          </p>
          <p>
            <strong className="text-zinc-200">Bags.</strong> An 80-lb bag yields
            ≈ 0.6 cu ft, so one cubic yard needs about 45 bags (60 for 60-lb
            bags). Counts round <em>up</em> — suppliers don&apos;t split bags.
          </p>
        </CardContent>
      </Card>

      {/* Related tools */}
      {related.length > 0 && (
        <div className="mt-8 max-w-5xl">
          <h2 className="font-display text-xl font-extrabold uppercase tracking-wide">
            More concrete tools
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((t) => {
              const Icon = toolIcon(t.iconName);
              return (
                <Card key={t.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
                        <Icon className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <CardTitle className="text-base">{t.title}</CardTitle>
                        <p className="text-xs text-zinc-500">Coming in Phase 2</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
