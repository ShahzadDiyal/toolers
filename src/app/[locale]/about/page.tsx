import type { Metadata } from "next";
import Link from "next/link";
import {
  Calculator,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import { PageHero, SectionHeading, CrumbNav } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { localePath } from "@/i18n/config";

export const metadata: Metadata = {
  title: "About Free Construction Calculators",
  description:
    "BuildCalc Pro is a free, browser-based construction calculator platform: 31 tools across 7 trades, no account, no database.",
};

const FACTS = [
  {
    icon: Calculator,
    title: "31 free calculators",
    body: "Concrete, masonry, framing, roofing, finishes, excavation, MEP, and bid math every tool free to use, with no feature locked behind a paywall.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "There is no database, no account, and no login. Your estimates live only in your browser's local storage, on your device, under your control.",
  },
  {
    icon: Zap,
    title: "Instant results",
    body: "Every calculation runs 100% in your browser. Type your dimensions and the results update live no waiting on a server, no page reloads.",
  },
  {
    icon: Users,
    title: "Built for the field",
    body: "For contractors, builders, estimators, tradespeople, and homeowners anyone who needs practical construction math without the subscription.",
  },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Professional construction tools. Free for everyone."
        lede="BuildCalc Pro is a free construction calculator platform 31 tools across 7 trades, running entirely in your browser."
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "About" }]}
          />
        </div>
      </PageHero>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="What it is"
            title="A calculator platform, not a sales funnel"
            lede="BuildCalc Pro started from a simple observation: contractors do the same construction math every day concrete yards, block counts, rafter lengths, bid margins and most of the tools for it are either expensive, ad-choked, or wrong. We built the tool we'd want on the jobsite."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {FACTS.map((f, i) => (
              <div
                key={f.title}
                className="reveal flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
                style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#14284A]">
                  <f.icon className="h-6 w-6 text-[#ED7D22]" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-xl font-extrabold text-[#0B1B33]">
                  {f.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5A6C85]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <div className="reveal grid gap-8 rounded-2xl bg-[#14284A] p-8 sm:p-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
                Honest about what it isn't
              </h2>
              <p className="mt-3 leading-relaxed text-white/75">
                BuildCalc Pro is a planning aid, not an engineering firm. Our
                calculators use standard industry formulas and clearly stated
                assumptions but they don't replace a licensed engineer,
                your local building code, or your own judgment. See the{" "}
                <Link
                  href={localePath("/disclaimer", locale)}
                  className="font-bold text-[#ED7D22] hover:underline"
                >
                  disclaimer
                </Link>{" "}
                for the full picture.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <Link
                href={localePath("/tools", locale)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#ED7D22] px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#d06f1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore the 31 tools{" "}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={localePath("/blog", locale)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Read the estimating guides
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
    </>
  );
}
