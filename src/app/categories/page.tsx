/**
 * BuildCalc Pro Category index (/categories).
 *
 * Seven rich category cards: icon, label, blurb, subtrade chips, tool count,
 * and a "View tools" CTA into each hub.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CATEGORIES,
  toolsByCategory,
  categoryHref,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { CrumbNav, PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Browse Construction Tools by Trade",
  description:
    "Seven trade hubs of free construction calculators concrete, framing, finishes, site work, MEP, bidding, and field converters.",
};

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Tool directory"
        title={
          <>
            Browse by <span className="text-[#ED7D22]">trade</span>
          </>
        }
        lede="Seven hubs of precision estimators, organized the way contractors think. Every tool is free pick a trade and start calculating."
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "Categories" }]}
          />
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal as="section" aria-label="All categories">
          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES.map((meta, i) => {
              const tools = toolsByCategory(meta.id);
              const live = tools.filter((t) => t.available).length;
              const Icon = toolIcon(meta.iconName);
              return (
                <Link
                  key={meta.id}
                  href={categoryHref(meta.id)}
                  className="reveal lift group flex min-h-[44px] flex-col rounded-2xl border border-zinc-200 bg-white p-6"
                  style={{ "--reveal-delay": `${(i % 4) * 60}ms` } as React.CSSProperties}
                  aria-label={`${meta.label} open hub`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14284A]">
                      <Icon className="h-6 w-6 text-[#ED7D22]" aria-hidden />
                    </span>
                    <span className="inline-flex min-h-[28px] items-center rounded-full border border-zinc-200 px-3 font-mono text-xs font-bold text-[#5A6C85]">
                      {live} tool{live === 1 ? "" : "s"}
                    </span>
                  </div>
                  <span className="mt-4 font-display text-xl font-extrabold tracking-tight text-[#0B1B33] group-hover:text-[#2563EB]">
                    {meta.label}
                  </span>
                  <span className="mt-1.5 text-[15px] leading-relaxed text-[#5A6C85]">
                    {meta.blurb}
                  </span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {meta.subtrades.map((s) => (
                      <span
                        key={s}
                        className="inline-flex min-h-[28px] items-center rounded-full bg-[#14284A]/5 px-3 text-xs font-bold text-[#14284A]"
                      >
                        {s}
                      </span>
                    ))}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#2563EB]">
                    View tools
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </Reveal>

        <div className="reveal mt-10 flex justify-center">
          <Link
            href="/tools"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#14284A] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0e1d38]"
          >
            Search every tool instead
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </>
  );
}
