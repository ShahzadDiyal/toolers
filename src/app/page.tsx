/**
 * BuildCalc Pro — Homepage dashboard (Phase 2).
 *
 * Hero with instant search, quick metrics bar, category grid with tool
 * shortcuts, and a recently-used quick-access rail (localStorage).
 */
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  MousePointerClick,
  ListChecks,
  BadgeDollarSign,
  ShieldCheck,
  WifiOff,
  Clock3,
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
  CATEGORIES,
  toolsByCategory,
  toolHref,
  categoryHref,
  TOTAL_TOOLS,
  LIVE_TOOLS,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { HeroSearch } from "@/components/home/HeroSearch";
import { RecentlyUsed } from "@/components/home/RecentlyUsed";

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="bg-blueprint relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
        <Badge variant="outline" className="mb-5 border-primary/40 text-primary">
          <ShieldCheck className="h-3 w-3" />
          100% Client-Side · No Login · No Database · Zero Fees
        </Badge>
        <h1 className="max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-wide sm:text-7xl">
          Estimate like a pro.
          <br />
          <span className="text-primary">Pay $0/month.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-400">
          Instant construction calculators and bid proposals that run entirely
          on your device. Search {TOTAL_TOOLS} trade tools below — concrete to
          closing docs.
        </p>

        <div className="mt-7 max-w-2xl">
          <HeroSearch />
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock3 className="h-3.5 w-3.5" />
            Average takeoff time: under a minute · Works offline on the job site
          </p>
        </div>

        {/* Quick metrics bar */}
        <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [`${TOTAL_TOOLS}+`, "Free pro tools"],
            [`${LIVE_TOOLS}`, "Live today"],
            ["100%", "Client-side secure"],
            ["$0", "Monthly fees"],
          ].map(([v, l]) => (
            <div
              key={l}
              className="rounded-xl border border-border bg-card/80 p-4"
            >
              <dd className="font-mono text-2xl font-extrabold tabular-nums text-primary sm:text-3xl">
                {v}
              </dd>
              <dt className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {l}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-label="Calculator categories">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
            Built for every trade
          </h2>
          <p className="mt-2 max-w-xl text-zinc-400">
            Jump straight into a calculator — the top shortcuts are one tap away.
          </p>
        </div>
        <Button variant="outline" asChild className="hidden min-h-[44px] sm:inline-flex">
          <Link href="/tools">
            All tools <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = toolIcon(c.iconName);
          const tools = toolsByCategory(c.id);
          const live = tools.filter((t) => t.available).length;
          const shortcuts = [...tools]
            .sort((a, b) => Number(b.available) - Number(a.available))
            .slice(0, 3);
          return (
            <Card key={c.id} className="flex h-full flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {live}/{tools.length} live
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg leading-snug">
                  <Link
                    href={categoryHref(c.id)}
                    className="transition-colors hover:text-primary"
                  >
                    {c.label}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">{c.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-1">
                  {shortcuts.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={toolHref(t)}
                        className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-primary"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                        <span className="truncate">{t.title}</span>
                        {!t.available && (
                          <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-zinc-600">
                            Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={categoryHref(c.id)}
                  className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  Open {c.label.split(",")[0]} hub
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
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
      title: "1 · Find it fast",
      text: "Hit ⌘K or the search bar — fuzzy search across every tool, tag, and trade. Glove-friendly tap targets throughout.",
    },
    {
      icon: ListChecks,
      title: "2 · Run the math",
      text: "Fraction-friendly inputs, preset chips, and steppers. Every result shows net quantity, waste, and a bill of materials.",
    },
    {
      icon: BadgeDollarSign,
      title: "3 · Price the bid",
      text: "One tap adds any result to the Master Bid Cart. Markup, contingency, and tax price themselves in real time.",
    },
  ];
  return (
    <section className="border-y border-border bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
          Tape measure to bid in 60 seconds
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/15">
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

function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="bg-blueprint relative overflow-hidden rounded-2xl border border-primary/30 bg-zinc-950 p-8 sm:p-12">
        <div className="relative">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
            Your next bid starts <span className="text-primary">here.</span>
          </h2>
          <p className="mt-3 max-w-xl text-zinc-400">
            No signup. No credit card. No trial that expires on Friday. Just
            math you can trust, priced and ready to send.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="min-h-[52px]">
              <Link href="/tools">
                <Calculator className="h-5 w-5" />
                Start calculating
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-h-[52px]">
              <Link href="/tools/concrete-slab">Try the concrete demo</Link>
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
      <RecentlyUsed />
      <CategoryGrid />
      <HowItWorks />
      <FinalCta />
    </>
  );
}
