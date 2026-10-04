/**
 * BuildCalc Pro — Tool page: /tools/[slug].
 *
 * Resolves the slug against the registry. Live tools render their
 * calculator; planned tools render a "coming soon" card with the outputs
 * preview so every registry entry is a valid, linkable page (Phase 3/4).
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
import { ConcreteSlab } from "@/components/calculators/ConcreteSlab";
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

/** Registry of implemented calculator components (Phase 3/4 add entries). */
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "concrete-slab": ConcreteSlab,
};

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
              This calculator is being built with the same precision shell as
              every live tool — net quantities, waste math, bill of materials,
              and one-tap bid lines.
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
          <div className="max-w-5xl">
            <ToolComponent />
          </div>
          {tool.details && tool.details.length > 0 && (
            <Card className="mt-8 max-w-5xl">
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
        <div className="max-w-5xl">
          <ComingSoon slug={slug} />
        </div>
      )}
    </>
  );
}
