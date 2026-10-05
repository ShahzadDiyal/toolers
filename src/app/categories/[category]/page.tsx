/**
 * BuildCalc Pro Category hub: /categories/[category].
 *
 * Category hero (PageHero) + responsive grid of tool cards. Each card shows
 * the tool icon, title, description, subtrade badge, its primary output,
 * and a "Use Tool" link into /tools/[slug].
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  CATEGORIES,
  getCategory,
  toolsByCategory,
  toolHref,
  categoryHref,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { SITE_URL } from "@/lib/site";
import {
  JsonLd,
  collectionSchema,
  breadcrumbSchema,
} from "@/components/seo/JsonLd";
import { CrumbNav, PageHero, SectionHeading } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
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
  const url = `${SITE_URL}${categoryHref(meta.id)}`;
  const title = meta.seoTitle ?? `${meta.label} Calculators`;
  const description = meta.seoDescription ?? meta.blurb;
  return {
    title,
    description,
    keywords: [meta.label, ...meta.subtrades, "construction calculator"],
    alternates: { canonical: url },
    openGraph: { type: "website", title: `${title} · BuildCalc Pro`, description, url },
    twitter: {
      card: "summary",
      title: `${title} · BuildCalc Pro`,
      description,
    },
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
  const live = tools.filter((t) => t.available);
  const CatIcon = toolIcon(meta.iconName);

  return (
    <>
      <JsonLd
        data={[
          collectionSchema({
            path: categoryHref(meta.id),
            name: `${meta.label} Calculators`,
            description: meta.blurb,
          }),
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: meta.label },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Tool category"
        title={
          <>
            {meta.label} <span className="text-[#ED7D22]">calculators</span>
          </>
        }
        lede={`${meta.blurb} ${live.length} free calculator${live.length === 1 ? "" : "s"} below.`}
      >
        <div className="mt-6">
          <CrumbNav
            items={[
              { label: "Home", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: meta.label },
            ]}
          />
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="reveal flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#14284A]">
              <CatIcon className="h-7 w-7 text-[#ED7D22]" aria-hidden />
            </span>
            <SectionHeading
              title={`${live.length} calculators`}
              lede="Every tool below is free results update live as you type."
            />
          </div>
        </Reveal>

        <Reveal as="section" aria-label={`${meta.label} tools`}>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((t, i) => {
              const Icon = toolIcon(t.iconName);
              return (
                <Link
                  key={t.id}
                  href={toolHref(t)}
                  className="reveal lift group flex min-h-[44px] min-w-0 flex-col rounded-2xl border border-zinc-200 bg-white p-5"
                  style={{ "--reveal-delay": `${(i % 6) * 60}ms` } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14284A]">
                      <Icon className="h-5 w-5 text-[#ED7D22]" aria-hidden />
                    </span>
                    <span className="inline-flex min-h-[28px] items-center rounded-full border border-[#14284A]/20 bg-[#14284A]/5 px-3 text-xs font-bold text-[#14284A]">
                      {t.subtrade}
                    </span>
                  </div>
                  <span className="mt-3 font-bold text-[#0B1B33] group-hover:text-[#2563EB]">
                    {t.title}
                  </span>
                  <span className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#5A6C85]">
                    {t.shortDescription}
                  </span>
                  {t.outputs[0] && (
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#5A6C85]">
                      Calculates: {t.outputs[0]}
                    </span>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#2563EB]">
                    Use tool
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

        <nav
          aria-label="More categories"
          className="reveal mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href="/categories"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#2563EB] hover:underline"
          >
            ← All categories
          </Link>
          <Link
            href="/tools"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#2563EB] hover:underline"
          >
            Explore all tools
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
      </div>
    </>
  );
}
