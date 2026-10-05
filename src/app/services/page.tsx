import type { Metadata } from "next";
import Link from "next/link";
import {
  Calculator,
  FileText,
  BookOpen,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { PageHero, SectionHeading, CrumbNav } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Services Free Construction Tools & Custom Calculators",
  description:
    "What BuildCalc Pro offers: free construction calculators, custom calculator development, bid workflows, and estimating guides.",
};

const SERVICES = [
  {
    icon: Calculator,
    title: "Free construction calculators",
    body: "31 trade calculators concrete, masonry, framing, roofing, finishes, excavation, MEP, and bid math free to use, no account required. Every tool runs entirely in your browser.",
    cta: { label: "Browse all tools", href: "/tools" },
  },
  {
    icon: Wrench,
    title: "Custom calculator development",
    body: "Need a calculator that doesn't exist yet? Tell us the inputs, the math, and the output you need. We review every request and build the ones that help the most contractors.",
    cta: { label: "Request a tool", href: "/request-tool" },
  },
  {
    icon: FileText,
    title: "Proposal & bid workflow",
    body: "Push any calculator's quantities straight into the Master Bid, apply markup or margin, set a payment schedule, and export a branded proposal PDF still free, still in your browser.",
    cta: { label: "Open the Proposal Builder", href: "/tools/master-proposal-builder" },
  },
  {
    icon: BookOpen,
    title: "Contractor estimating guides",
    body: "Short, practical explainers on the math behind the tools slab takeoffs, block and mortar quantities, roof pitch, stair layout, and markup vs. margin.",
    cta: { label: "Read the guides", href: "/blog" },
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What BuildCalc Pro offers"
        lede="One platform for construction math: free calculators, a bid workflow, custom tool requests, and guides that explain the numbers."
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "Services" }]}
          />
        </div>
      </PageHero>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="What we do"
            title="Built around the way contractors estimate"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((s, i) => (
              <div
                key={s.title}
                className="reveal flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#14284A]">
                  <s.icon className="h-6 w-6 text-[#ED7D22]" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-xl font-extrabold text-[#0B1B33]">
                  {s.title}
                </h2>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#5A6C85]">
                  {s.body}
                </p>
                <Link
                  href={s.cta.href}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 self-start text-sm font-bold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                >
                  {s.cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <div className="reveal rounded-2xl bg-[#14284A] p-8 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Everything is free. No subscriptions, no accounts.
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-white/75">
              BuildCalc Pro exists to make professional-grade construction
              math accessible to everyone contractors, estimators,
              tradespeople, and homeowners alike.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tools"
                className="inline-flex min-h-[44px] items-center rounded-lg bg-[#ED7D22] px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#d06f1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore the tools
              </Link>
              <Link
                href="/request-tool"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Request a custom tool
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
    </>
  );
}
