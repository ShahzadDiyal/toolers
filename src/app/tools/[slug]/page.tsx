/**
 * BuildCalc Pro — Tool page: /tools/[slug] (Phase 4A universal shell).
 *
 * Validates the slug against the registry (notFound on miss), renders the
 * tool header (title, trade badge, 1-sentence guide), then the registered
 * calculator component — each built on useToolAutoSave + ToolShell +
 * ResultsCard. Planned tools render a "coming soon" card.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Hammer, ArrowRight } from "lucide-react";
import {
  TOOLS,
  getToolBySlug,
  getCategory,
  categoryHref,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { ConcreteSlabTool } from "@/components/calculator/tools/ConcreteSlabTool";
import { RoofPitchShinglesTool } from "@/components/calculator/tools/RoofPitchShinglesTool";
import { TrackRecentTool } from "@/components/tools/TrackRecentTool";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.title} — Free Calculator`,
    description: tool.shortDescription,
  };
}

/** Registry of implemented calculator components (Phase 4+ adds entries). */
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "concrete-slab": ConcreteSlabTool,
  "roof-pitch-shingles": RoofPitchShinglesTool,
};

function ToolHeader({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  const Icon = toolIcon(tool.iconName);
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
        <Icon className="h-7 w-7 text-primary" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {tool.badge && <Badge variant="accent">{tool.badge}</Badge>}
          <Badge variant="secondary">{tool.subtrade}</Badge>
          {tool.estimatedTime && (
            <Badge variant="outline" className="font-mono">
              {tool.estimatedTime}
            </Badge>
          )}
        </div>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
          {tool.title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
          {tool.howTo ?? tool.shortDescription}
        </p>
      </div>
    </div>
  );
}

function ComingSoon({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  const Icon = toolIcon(tool.iconName);
  const category = getCategory(tool.category);
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-zinc-950/60 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
            <Icon className="h-7 w-7 text-primary" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Coming soon</Badge>
              {tool.badge && <Badge variant="secondary">{tool.badge}</Badge>}
              {tool.estimatedTime && (
                <Badge variant="outline" className="font-mono">
                  {tool.estimatedTime}
                </Badge>
              )}
            </div>
            <CardTitle className="mt-2 text-2xl">{tool.title}</CardTitle>
            <CardDescription className="mt-1.5 text-base">
              {tool.shortDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-zinc-900">
            <Hammer className="h-8 w-8 text-zinc-600" />
          </span>
          <div className="max-w-md">
            <p className="font-display text-lg font-bold uppercase tracking-wide">
              On the build bench
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              This calculator is being built on the universal shell — auto-saved
              inputs, real-time math, bill of materials, and one-tap bid lines.
            </p>
          </div>
          <div className="w-full max-w-md rounded-xl border border-border bg-zinc-950 p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              What you&apos;ll get
            </p>
            <ul className="mt-2 space-y-1.5">
              {tool.outputs.map((o) => (
                <li key={o} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {o}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-xs text-zinc-500">
              Formula: {tool.formulaSummary}
            </p>
          </div>
          <Button asChild size="lg" className="min-h-[48px]">
            <Link href={categoryHref(tool.category)}>
              Browse {category.label.split(",")[0]} tools
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const ToolComponent = TOOL_COMPONENTS[slug];

  return (
    <>
      <TrackRecentTool slug={slug} />
      {ToolComponent ? (
        <>
          <ToolHeader slug={slug} />
          <ToolComponent />
          {tool.details && tool.details.length > 0 && (
            <Card className="no-print mt-8">
              <CardHeader>
                <CardTitle className="text-lg">How the math works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-zinc-400">
                {tool.details.map((d, i) => (
                  <p key={i}>{d}</p>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <ComingSoon slug={slug} />
      )}
    </>
  );
}
