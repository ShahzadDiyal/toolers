/**
 * BuildCalc Pro Tool page: /tools/[slug].
 *
 * Professional tool page: breadcrumb, branded tool header, the registered
 * calculator component (unchanged), then SEO content sections derived ONLY
 * from registry data (About / How to use / How the math works / Formula /
 * FAQs / Related tools). Planned tools render a restyled "coming soon" card.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Hammer, ArrowRight, ArrowLeft, Clock3, CheckCircle2 } from "lucide-react";
import {
  TOOLS,
  getToolBySlug,
  getCategory,
  relatedTools,
  categoryHref,
  toolHref,
} from "@/data/toolsRegistry";
import { SITE_URL } from "@/lib/site";
import {
  JsonLd,
  toolSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/components/seo/JsonLd";
import { toolIcon } from "@/lib/tool-icons";
import { ConcreteSlabTool } from "@/components/calculator/tools/ConcreteSlabTool";
import { ConcreteFootingTool } from "@/components/calculator/tools/ConcreteFootingTool";
import { ConcreteColumnTool } from "@/components/calculator/tools/ConcreteColumnTool";
import { StudWallTool } from "@/components/calculator/tools/StudWallTool";
import { BoardFeetTool } from "@/components/calculator/tools/BoardFeetTool";
import { RecessedLightsTool } from "@/components/calculator/tools/RecessedLightsTool";
import { BreakEvenTool } from "@/components/calculator/tools/BreakEvenTool";
import { ChangeOrderTool } from "@/components/calculator/tools/ChangeOrderTool";
import { RightTriangleTool } from "@/components/calculator/tools/RightTriangleTool";
import { RoofPitchShinglesTool } from "@/components/calculator/tools/RoofPitchShinglesTool";
import { FramingDrywallPackTool } from "@/components/calculator/tools/FramingDrywallPackTool";
import { StairStringerLayoutTool } from "@/components/calculator/tools/StairStringerLayoutTool";
import { RebarMeshEstimatorTool } from "@/components/calculator/tools/RebarMeshEstimatorTool";
import { TileGroutCalculatorTool } from "@/components/calculator/tools/TileGroutCalculatorTool";
import { PaintPrimerCoverageTool } from "@/components/calculator/tools/PaintPrimerCoverageTool";
import { FlooringTrimEstimatorTool } from "@/components/calculator/tools/FlooringTrimEstimatorTool";
import { ContractorMarkupMarginTool } from "@/components/calculator/tools/ContractorMarkupMarginTool";
import { ConduitFillVoltageDropTool } from "@/components/calculator/tools/ConduitFillVoltageDropTool";
import { CmuBlockMortarTool } from "@/components/calculator/tools/CmuBlockMortarTool";
import { ExcavationDirtHaulTool } from "@/components/calculator/tools/ExcavationDirtHaulTool";
import { RetainingWallBlockTool } from "@/components/calculator/tools/RetainingWallBlockTool";
import { AggregateStoneTonnageTool } from "@/components/calculator/tools/AggregateStoneTonnageTool";
import { AsphaltPavingTool } from "@/components/calculator/tools/AsphaltPavingTool";
import { DeckJoistPostTool } from "@/components/calculator/tools/DeckJoistPostTool";
import { FenceGateEstimatorTool } from "@/components/calculator/tools/FenceGateEstimatorTool";
import { PaverPatioSandTool } from "@/components/calculator/tools/PaverPatioSandTool";
import { SidingHousewrapTool } from "@/components/calculator/tools/SidingHousewrapTool";
import { RafterTrussCutsTool } from "@/components/calculator/tools/RafterTrussCutsTool";
import { HvacBtuTonnageTool } from "@/components/calculator/tools/HvacBtuTonnageTool";
import { InsulationBattRollTool } from "@/components/calculator/tools/InsulationBattRollTool";
import { PexPipePlumbingTool } from "@/components/calculator/tools/PexPipePlumbingTool";
import { BaseboardCrownMoldingTool } from "@/components/calculator/tools/BaseboardCrownMoldingTool";
import { CeilingTextureDrywallTool } from "@/components/calculator/tools/CeilingTextureDrywallTool";
import { LaborBurdenHourlyTool } from "@/components/calculator/tools/LaborBurdenHourlyTool";
import { SubPieceRateTool } from "@/components/calculator/tools/SubPieceRateTool";
import { JobsiteBreakevenTool } from "@/components/calculator/tools/JobsiteBreakevenTool";
import { FeetInchFractionTool } from "@/components/calculator/tools/FeetInchFractionTool";
import { UnitConverterProTool } from "@/components/calculator/tools/UnitConverterProTool";
import { MasterProposalBuilderTool } from "@/components/calculator/tools/MasterProposalBuilderTool";
import { TrackRecentTool } from "@/components/tools/TrackRecentTool";
import { CrumbNav, SectionHeading } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary } from "@/i18n/getDictionary";
import { localePath, type Locale } from "@/i18n/config";

export async function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const url = `${SITE_URL}${toolHref(tool, locale)}`;
  const seoTitle = tool.seoTitle ?? tool.title;
  const title = `${seoTitle} (Free)`;
  return {
    title,
    description: tool.shortDescription,
    keywords: [...tool.tags, tool.subtrade, "calculator", "estimator"],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${title} · BuildCalc Pro`,
      description: tool.howTo ?? tool.shortDescription,
      url,
    },
    twitter: {
      card: "summary",
      title: `${title} · BuildCalc Pro`,
      description: tool.howTo ?? tool.shortDescription,
    },
  };
}

/** Registry of implemented calculator components (Phase 4+ adds entries). */
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "concrete-slab": ConcreteSlabTool,
  "concrete-footing": ConcreteFootingTool,
  "concrete-column": ConcreteColumnTool,
  "stud-wall": StudWallTool,
  "board-feet": BoardFeetTool,
  "recessed-lights": RecessedLightsTool,
  "break-even": BreakEvenTool,
  "change-order": ChangeOrderTool,
  "right-triangle": RightTriangleTool,
  "roof-pitch-shingles": RoofPitchShinglesTool,
  "framing-drywall-pack": FramingDrywallPackTool,
  "stair-stringer-layout": StairStringerLayoutTool,
  "rebar-mesh-estimator": RebarMeshEstimatorTool,
  "tile-grout-calculator": TileGroutCalculatorTool,
  "paint-primer-coverage": PaintPrimerCoverageTool,
  "flooring-trim-estimator": FlooringTrimEstimatorTool,
  "contractor-markup-margin": ContractorMarkupMarginTool,
  "conduit-fill-voltage-drop": ConduitFillVoltageDropTool,
  "cmu-block-mortar": CmuBlockMortarTool,
  "excavation-dirt-haul": ExcavationDirtHaulTool,
  "retaining-wall-block": RetainingWallBlockTool,
  "aggregate-stone-tonnage": AggregateStoneTonnageTool,
  "asphalt-paving": AsphaltPavingTool,
  "deck-joist-post": DeckJoistPostTool,
  "fence-gate-estimator": FenceGateEstimatorTool,
  "paver-patio-sand": PaverPatioSandTool,
  "siding-housewrap": SidingHousewrapTool,
  "rafter-truss-cuts": RafterTrussCutsTool,
  "hvac-btu-tonnage": HvacBtuTonnageTool,
  "insulation-batt-roll": InsulationBattRollTool,
  "pex-pipe-plumbing": PexPipePlumbingTool,
  "baseboard-crown-molding": BaseboardCrownMoldingTool,
  "ceiling-texture-drywall": CeilingTextureDrywallTool,
  "labor-burden-hourly": LaborBurdenHourlyTool,
  "sub-piece-rate": SubPieceRateTool,
  "jobsite-breakeven": JobsiteBreakevenTool,
  "feet-inch-fraction": FeetInchFractionTool,
  "unit-converter-pro": UnitConverterProTool,
  "master-proposal-builder": MasterProposalBuilderTool,
};

function ToolHeader({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  const Icon = toolIcon(tool.iconName);
  return (
    <header className="reveal">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#14284A] shadow-sm sm:h-16 sm:w-16">
          <Icon className="h-7 w-7 text-[#ED7D22] sm:h-8 sm:w-8" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {tool.badge && (
              <span className="inline-flex min-h-[28px] items-center rounded-full bg-[#ED7D22] px-3 text-xs font-bold uppercase tracking-wide text-white">
                {tool.badge}
              </span>
            )}
            <span className="inline-flex min-h-[28px] items-center rounded-full border border-[#14284A]/20 bg-[#14284A]/5 px-3 text-xs font-bold text-[#14284A]">
              {tool.subtrade}
            </span>
            {tool.estimatedTime && (
              <span className="inline-flex min-h-[28px] items-center gap-1 rounded-full border border-zinc-200 px-3 font-mono text-xs text-[#5A6C85]">
                <Clock3 className="h-3 w-3" aria-hidden />
                {tool.estimatedTime}
              </span>
            )}
            <span className="inline-flex min-h-[28px] items-center gap-1 rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              Free to use
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#0B1B33] sm:text-3xl md:text-4xl">
            {tool.seoTitle ?? tool.title}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#5A6C85] sm:text-base">
            {tool.howTo ?? tool.shortDescription}
          </p>
        </div>
      </div>
    </header>
  );
}

function ComingSoon({
  slug,
  locale,
  catTitle,
}: {
  slug: string;
  locale: string;
  catTitle: string;
}) {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  const Icon = toolIcon(tool.iconName);
  return (
    <div className="reveal overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-[#14284A] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Icon className="h-7 w-7 text-[#ED7D22]" aria-hidden />
          </span>
          <div>
            <span className="inline-flex min-h-[28px] items-center rounded-full border border-white/30 px-3 text-xs font-bold uppercase tracking-wide text-white">
              Coming soon
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {tool.title}
            </h1>
            <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-white/70">
              {tool.shortDescription}
            </p>
          </div>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14284A]/5">
            <Hammer className="h-8 w-8 text-[#14284A]/40" aria-hidden />
          </span>
          <div className="max-w-md">
            <p className="font-display text-lg font-extrabold uppercase tracking-wide text-[#0B1B33]">
              On the build bench
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#5A6C85]">
              This calculator is being built on the universal shell auto-saved
              inputs, real-time math, bill of materials, and one-tap bid lines.
            </p>
          </div>
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#5A6C85]">
              What you&apos;ll get
            </p>
            <ul className="mt-2 space-y-1.5">
              {tool.outputs.map((o) => (
                <li key={o} className="flex items-center gap-2 text-sm text-[#0B1B33]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ED7D22]" />
                  {o}
                </li>
              ))}
            </ul>
            <p dir="ltr" className="mt-3 font-mono text-xs text-[#5A6C85]">
              Formula: {tool.formulaSummary}
            </p>
          </div>
          <Link
            href={categoryHref(tool.category, locale)}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#ED7D22] px-6 text-sm font-bold text-white transition-colors hover:bg-[#d96f1a]"
          >
            All {catTitle} tools
            <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

const GENERIC_STEPS = [
  "Enter your measurements in the input fields above.",
  "Choose the units that match your tape and supplier.",
  "Review the results as they update live no calculate button needed.",
  "Add the bill of materials to your estimate with one tap.",
];

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  const t = await getDictionary(locale as Locale);
  const catTitle = t.categories[tool.category].title;

  const ToolComponent = TOOL_COMPONENTS[slug];
  const category = getCategory(tool.category);
  const crumbs = [
    { label: t.nav.home, href: localePath("/", locale) },
    { label: t.nav.tools, href: localePath("/tools", locale) },
    { label: catTitle, href: categoryHref(tool.category, locale) },
    { label: tool.title },
  ];
  const schemas = [
    toolSchema({
      slug: tool.slug,
      title: tool.seoTitle ?? tool.title,
      description: tool.shortDescription,
      categoryLabel: category.label,
    }),
    breadcrumbSchema(crumbs),
    ...(tool.faqs && tool.faqs.length > 0 ? [faqSchema(tool.faqs)] : []),
  ];

  const about = tool.details?.[0] ?? tool.shortDescription;
  const mathNotes = tool.details && tool.details.length > 1 ? tool.details.slice(1) : [];
  const related = relatedTools(tool, 4).filter((t) => t.available);

  return (
    <>
      <JsonLd data={schemas} />
      <TrackRecentTool slug={slug} />
      <div className="min-w-0">
        <CrumbNav items={crumbs} />
        <div className="mt-6">
          <ToolHeader slug={slug} />
        </div>

        {ToolComponent ? (
          <>
            {/* The calculator untouched */}
            <div className="reveal mt-8 overflow-x-clip">
              <ToolComponent />
            </div>

            {/* Registry-derived content, comfortable reading width */}
            <div className="mx-auto mt-12 max-w-3xl">
              <Reveal>
                <section aria-label="About this tool" className="reveal">
                  <SectionHeading title="About this tool" />
                  <p className="mt-3 text-[15px] leading-relaxed text-[#5A6C85]">
                    {about}
                  </p>
                </section>

                <section aria-label="How to use" className="reveal mt-10">
                  <SectionHeading title="How to use" />
                  {tool.howTo ? (
                    <p className="mt-3 text-[15px] leading-relaxed text-[#5A6C85]">
                      {tool.howTo}
                    </p>
                  ) : (
                    <ol className="mt-3 list-decimal space-y-2 ps-5 text-[15px] leading-relaxed text-[#5A6C85]">
                      {GENERIC_STEPS.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  )}
                </section>

                {mathNotes.length > 0 && (
                  <section aria-label="How the math works" className="reveal mt-10">
                    <SectionHeading title="How the math works" />
                    <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#5A6C85]">
                      {mathNotes.map((d, i) => (
                        <p key={i}>{d}</p>
                      ))}
                    </div>
                  </section>
                )}

                {tool.formulaSummary && (
                  <section aria-label="Formula" className="reveal mt-10">
                    <SectionHeading title="Formula" />
                    <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p dir="ltr" className="font-mono text-sm leading-relaxed text-[#0B1B33]">
                        {tool.formulaSummary}
                      </p>
                    </div>
                  </section>
                )}

                {tool.faqs && tool.faqs.length > 0 && (
                  <section
                    aria-label="Frequently asked questions"
                    className="reveal mt-10"
                  >
                    <SectionHeading title="Common questions" />
                    <div className="mt-4 space-y-2">
                      {tool.faqs.map((f) => (
                        <details
                          key={f.q}
                          className="group rounded-xl border border-zinc-200 bg-white px-4 py-3"
                        >
                          <summary className="min-h-[44px] cursor-pointer list-none text-sm font-bold text-[#0B1B33] marker:hidden [&::-webkit-details-marker]:hidden">
                            <span
                              className="me-2 inline-block text-[#ED7D22] transition-transform group-open:rotate-90 rtl:-scale-x-100"
                              aria-hidden
                            >
                              ▸
                            </span>
                            {f.q}
                          </summary>
                          <p className="mt-2 ps-6 text-sm leading-relaxed text-[#5A6C85]">
                            {f.a}
                          </p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}
              </Reveal>
            </div>

            {/* Related tools full width grid */}
            {related.length > 0 && (
              <section aria-label="Related tools" className="mt-14">
                <Reveal>
                  <div className="reveal">
                    <SectionHeading
                      eyebrow="Keep estimating"
                      title="Related tools"
                      lede={`More ${category.label.split(",")[0].toLowerCase()} calculators for this job.`}
                    />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {related.map((r, i) => {
                      const RIcon = toolIcon(r.iconName);
                      return (
                        <Link
                          key={r.id}
                          href={toolHref(r, locale)}
                          className="reveal lift group flex min-h-[44px] flex-col rounded-2xl border border-zinc-200 bg-white p-5"
                          style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14284A]">
                            <RIcon className="h-5 w-5 text-[#ED7D22]" aria-hidden />
                          </span>
                          <span className="mt-3 font-bold text-[#0B1B33] group-hover:text-[#2563EB]">
                            {r.title}
                          </span>
                          <span className="mt-1 line-clamp-2 text-sm text-[#5A6C85]">
                            {r.shortDescription}
                          </span>
                          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#2563EB]">
                            {t.common.useTool}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </Reveal>
              </section>
            )}

            {/* Journey links */}
            <nav
              aria-label="More tools"
              className="reveal mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={categoryHref(tool.category, locale)}
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#2563EB] hover:underline"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
                {t.common.back} · {catTitle}
              </Link>
              <Link
                href={localePath("/tools", locale)}
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#2563EB] hover:underline"
              >
                {t.nav.browseDirectory}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            </nav>
          </>
        ) : (
          <div className="mt-6">
            <ComingSoon slug={slug} locale={locale} catTitle={catTitle} />
          </div>
        )}
      </div>
    </>
  );
}
