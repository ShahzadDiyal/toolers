import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ShieldCheck,
  WifiOff,
  FileDown,
  MousePointerClick,
  ListChecks,
  BadgeDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TOOLS, TOOL_CATEGORIES, toolHref } from "@/lib/tools-registry";
import { CATEGORY_META } from "@/types/estimator";
import { toolIcon } from "@/lib/tool-icons";

const CATEGORY_CARD_ICON: Record<string, string> = {
  concrete: "Layers",
  "framing-roofing": "House",
  finishes: "Paintbrush",
  "site-exterior": "Shovel",
  mep: "Zap",
  "financial-business": "Percent",
  utilities: "Sigma",
};

function Hero() {
  return (
    <section className="bg-blueprint relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <Badge variant="outline" className="mb-5 border-primary/40 text-primary">
          <ShieldCheck className="h-3 w-3" />
          Zero database · No login · No monthly fee
        </Badge>
        <h1 className="max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-wide sm:text-7xl">
          Estimate like a pro.
          <br />
          <span className="text-primary">Pay $0/month.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-400">
          Instant construction calculators and bid proposals that run entirely
          on your device. Concrete, framing, roofing, finishes, MEP and more —
          with waste math, bill of materials, and a master bid cart built for
          the job site.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/tools">
              <Calculator className="h-5 w-5" />
              Browse calculators
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/tools/concrete/concrete-slab">
              Try the concrete demo
            </Link>
          </Button>
        </div>

        <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-4">
          {[
            ["15+", "Calculators planned"],
            ["0", "Accounts required"],
            ["100%", "Private & offline"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-xl border border-border bg-card/80 p-4">
              <dt className="order-2 mt-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {l}
              </dt>
              <dd className="font-mono text-3xl font-extrabold text-primary tabular-nums">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-label="Calculator categories">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
            Built for every trade
          </h2>
          <p className="mt-2 max-w-xl text-zinc-400">
            Seven categories of precision calculators, each with unit-aware
            inputs, waste allowances, and one-tap bid lines.
          </p>
        </div>
        <Button variant="outline" asChild className="hidden sm:inline-flex">
          <Link href="/tools">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_CATEGORIES.map((c) => {
          const Icon = toolIcon(CATEGORY_CARD_ICON[c]);
          const count = TOOLS.filter((t) => t.category === c).length;
          const live = TOOLS.filter((t) => t.category === c && t.available).length;
          return (
            <Link key={c} href={`/tools#${c}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {live}/{count} live
                    </Badge>
                  </div>
                  <CardTitle className="mt-3">{CATEGORY_META[c].label}</CardTitle>
                  <CardDescription>{CATEGORY_META[c].blurb}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Open category
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: MousePointerClick,
      title: "1 · Run the math",
      text: "Punch in dimensions with fraction-friendly inputs, preset chips, and steppers sized for work gloves.",
    },
    {
      icon: ListChecks,
      title: "2 · Review the BOM",
      text: "Every result shows net quantity, waste allowance, and a bill of materials — nothing hidden.",
    },
    {
      icon: BadgeDollarSign,
      title: "3 · Price the bid",
      text: "Add lines to the Master Bid Cart. Markup, contingency, and tax price themselves in real time.",
    },
  ];
  return (
    <section className="border-y border-border bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
          From tape measure to bid in 60 seconds
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 border border-accent/30">
                  <s.icon className="h-5 w-5 text-accent" />
                </span>
                <CardTitle className="mt-3 text-lg">{s.title}</CardTitle>
                <CardDescription>{s.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const faqs = [
    {
      q: "Is it really free? What's the catch?",
      a: "No catch. Everything runs in your browser with no servers, so there is nothing to pay for. Your estimates are stored in your browser's local storage — export them as JSON anytime.",
    },
    {
      q: "Does it work without internet on the job site?",
      a: "Yes. After the first load, every calculator works fully offline. Your data never leaves the device, so a dead zone can't lock you out of your own numbers.",
    },
    {
      q: "How is this different from Buildertrend or PlanSwift?",
      a: "Those are powerful — and expensive, login-gated, cloud-dependent suites. BuildCalc Pro is the opposite: instant, free, private calculators for the 80% of estimating that doesn't need a takeoff engine.",
    },
    {
      q: "Can I send the bid to a client?",
      a: "Phase 1 gives you a live-priced Master Bid Cart with JSON export. Print-ready and PDF bid proposals arrive in Phase 3.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6" aria-label="FAQ">
      <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
        Questions, answered
      </h2>
      <Accordion type="single" collapsible className="mt-6">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="bg-blueprint relative overflow-hidden rounded-2xl border border-primary/30 bg-zinc-950 p-8 sm:p-12">
        <div className="relative">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
            Your next bid starts <span className="text-primary">here.</span>
          </h2>
          <p className="mt-3 max-w-xl text-zinc-400">
            No signup. No credit card. No “free trial” that expires on Friday.
            Just math you can trust, priced and ready to send.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/tools">
                <Calculator className="h-5 w-5" />
                Start calculating
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tools/concrete/concrete-slab">
                <FileDown className="h-5 w-5" />
                See a sample estimate
              </Link>
            </Button>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-500">
            <WifiOff className="h-3.5 w-3.5" />
            Works offline · Your data stays on your device
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <HowItWorks />
      <Faq />
      <FinalCta />
    </>
  );
}
