/**
 * BuildCalc Pro Category index (/[locale]/categories).
 *
 * Seven rich category cards with translated trade titles and descriptions:
 * icon, label, blurb, subtrade chips, tool count, and a "Use tool" CTA
 * into each hub.
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
import { getDictionary } from "@/i18n/getDictionary";
import { localePath, type Locale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Browse Construction Tools by Trade",
  description:
    "Seven trade hubs of free construction calculators concrete, framing, finishes, site work, MEP, bidding, and field converters.",
};

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(locale as Locale);

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
            items={[
              { label: t.nav.home, href: localePath("/", locale) },
              { label: t.footer.categories },
            ]}
          />
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal as="section" aria-label="All categories">
          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES.map((meta, i) => {
              const tools = toolsByCategory(meta.id);
              const live = tools.filter((tool) => tool.available).length;
              const Icon = toolIcon(meta.iconName);
              return (
                <Link
                  key={meta.id}
                  href={categoryHref(meta.id, locale)}
                  className="reveal lift group flex min-h-[44px] flex-col rounded-2xl border border-zinc-200 bg-white p-6"
                  style={{ "--reveal-delay": `${(i % 4) * 60}ms` } as React.CSSProperties}
                  aria-label={`${t.categories[meta.id].title} open hub`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14284A]">
                      <Icon className="h-6 w-6 text-[#ED7D22]" aria-hidden />
                    </span>
                    <span className="inline-flex min-h-[28px] items-center rounded-full border border-zinc-200 px-3 font-mono text-xs font-bold text-[#5A6C85]">
                      {t.nav.freeTools.replace("{count}", String(live))}
                    </span>
                  </div>
                  <span className="mt-4 font-display text-xl font-extrabold tracking-tight text-[#0B1B33] group-hover:text-[#2563EB]">
                    {t.categories[meta.id].title}
                  </span>
                  <span className="mt-1.5 text-[15px] leading-relaxed text-[#5A6C85]">
                    {t.categories[meta.id].description}
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
                    {t.common.useTool}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
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
            href={localePath("/tools", locale)}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#14284A] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0e1d38]"
          >
            {t.nav.browseDirectory}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </div>
    </>
  );
}
