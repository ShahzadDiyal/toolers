/**
 * BuildCalc Pro — Category hubs index (/categories).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, toolsByCategory, categoryHref } from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Calculator Categories",
  description:
    "Browse BuildCalc Pro calculators by trade: concrete, framing, finishes, site work, MEP, financials, and field converters.",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide sm:text-5xl">
          Browse by <span className="text-primary">trade</span>
        </h1>
        <p className="mt-3 text-zinc-400">
          Seven hubs of precision estimators — pick your trade and get to the
          math in one tap.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = toolIcon(c.iconName);
          const tools = toolsByCategory(c.id);
          const live = tools.filter((t) => t.available).length;
          const top = tools.filter((t) => t.badge).slice(0, 2);
          return (
            <Link key={c.id} href={categoryHref(c.id)} className="group min-h-[44px]">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                      <Icon className="h-6 w-6 text-primary" />
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {live}/{tools.length} live
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-xl">{c.label}</CardTitle>
                  <CardDescription>{c.blurb}</CardDescription>
                </CardHeader>
                <CardContent>
                  {top.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {top.map((t) => (
                        <Badge key={t.id} variant="secondary" className="text-[10px]">
                          {t.badge}: {t.title.split(" ").slice(0, 2).join(" ")}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    Open hub
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
