/**
 * BuildCalc Pro — Homepage.
 *
 * Platform landing: hero with search, category directory, how-it-works,
 * trust strip, FAQ, and final CTA. Calculation logic lives in the tool
 * pages; this file is presentation only.
 */
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  KeyRound,
  ListChecks,
  MousePointerClick,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Logo } from "@/components/brand/Logo";
import {
  CATEGORIES,
  toolsByCategory,
  categoryHref,
  TOTAL_TOOLS,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { HeroSearch } from "@/components/home/HeroSearch";
import { RecentlyUsed } from "@/components/home/RecentlyUsed";
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/** Measurement-themed SVG: slab outline with ruler ticks and dimension arrows. */
function MeasureGraphic() {
  return (
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-label="Slab measurement illustration"
      className="h-auto w-full max-w-sm"
    >
      {/* slab outline */}
      <rect
        x="60"
        y="60"
        width="200"
        height="120"
        rx="4"
        fill="#FFFFFF"
        stroke="#14284A"
        strokeWidth="3"
      />
      {/* grid lines on slab */}
      <line x1="110" y1="60" x2="110" y2="180" stroke="#14284A" strokeOpacity="0.15" strokeWidth="2" />
      <line x1="160" y1="60" x2="160" y2="180" stroke="#14284A" strokeOpacity="0.15" strokeWidth="2" />
      <line x1="210" y1="60" x2="210" y2="180" stroke="#14284A" strokeOpacity="0.15" strokeWidth="2" />
      {/* ruler baseline with ticks */}
      <rect x="40" y="196" width="240" height="10" rx="2" fill="#14284A" />
      {Array.from({ length: 25 }).map((_, i) => (
        <rect
          key={i}
          x={46 + i * 9.6}
          y={i % 5 === 0 ? 186 : 190}
          width="2"
          height={i % 5 === 0 ? 10 : 6}
          fill="#14284A"
        />
      ))}
      {/* width dimension arrow */}
      <line x1="60" y1="36" x2="260" y2="36" stroke="#ED7D22" strokeWidth="2" />
      <polygon points="60,36 70,31 70,41" fill="#ED7D22" />
      <polygon points="260,36 250,31 250,41" fill="#ED7D22" />
      <text x="160" y="26" textAnchor="middle" fontSize="13" fontWeight="700" fill="#14284A">
        20′-0″
      </text>
      {/* height dimension arrow */}
      <line x1="284" y1="60" x2="284" y2="180" stroke="#ED7D22" strokeWidth="2" />
      <polygon points="284,60 279,70 289,70" fill="#ED7D22" />
      <polygon points="284,180 279,170 289,170" fill="#ED7D22" />
      <text x="300" y="124" textAnchor="middle" fontSize="13" fontWeight="700" fill="#14284A" transform="rotate(90 300 124)">
        12′-0″
      </text>
      {/* thickness callout */}
      <rect x="30" y="96" width="72" height="26" rx="6" fill="#ED7D22" />
      <text x="66" y="113" textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">
        4″ slab
      </text>
    </svg>
  );
}

function Hero() {
  return (
    <section className="bg-blueprint relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-10 sm:gap-10 sm:px-6 sm:pb-14 sm:pt-16 lg:grid-cols-[1.4fr_1fr] lg:pt-20">
        <div className="min-w-0">
          <Badge
            variant="outline"
            className="mb-4 max-w-full border-[#ED7D22]/50 text-[#14284A] sm:mb-5"
          >
            <ShieldCheck className="h-3 w-3 shrink-0 text-[#ED7D22]" />
            <span className="truncate">
              Free forever · No account · Works offline
            </span>
          </Badge>
          <h1 className="max-w-3xl font-display text-[32px] font-extrabold leading-[1.08] tracking-tight text-[#0B1B33] sm:text-5xl lg:text-6xl">
            Free Construction Calculators{" "}
            <span className="text-[#ED7D22]">&amp; Tools</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5A6C85] sm:mt-5 sm:text-lg">
            {TOTAL_TOOLS} professional calculators for contractors, builders,
            estimators, and homeowners — concrete, framing, roofing, MEP, and
            bid math that runs right in your browser. No sign-up, no fees.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
            <Button asChild className="min-h-[48px] w-full text-base sm:w-auto">
              <Link href="/tools">
                Explore Tools <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-[48px] w-full text-base sm:w-auto"
            >
              <Link href="/request-tool">Request a Tool</Link>
            </Button>
          </div>
          <div className="mt-6 max-w-2xl sm:mt-7">
            <HeroSearch />
          </div>
        </div>
        <div
          className="hidden min-w-0 justify-center lg:flex"
          aria-hidden="true"
        >
          <MeasureGraphic />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Category directory                                                  */
/* ------------------------------------------------------------------ */

function CategoryDirectory() {
  return (
    <section
      aria-label="Calculator categories"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <Reveal>
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Tool directory"
            title="Explore construction tools"
            lede="Seven trade categories, every calculator free. Pick a category to see exactly what each tool calculates."
          />
          <Link
            href="/tools"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[#2563EB] hover:underline"
          >
            View all {TOTAL_TOOLS} tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const Icon = toolIcon(c.iconName);
            const live = toolsByCategory(c.id).filter((t) => t.available).length;
            return (
              <li
                key={c.id}
                className="reveal min-w-0"
                style={{ "--reveal-delay": `${(i % 6) * 60}ms` } as React.CSSProperties}
              >
                <Link
                  href={categoryHref(c.id)}
                  className="lift group flex h-full min-h-[44px] flex-col rounded-xl border border-border bg-white p-5"
                  aria-label={`${c.label} — ${live} tools`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#14284A]">
                    <Icon className="h-5 w-5 text-white" aria-hidden />
                  </span>
                  <span className="mt-4 font-display text-lg font-extrabold tracking-tight text-[#0B1B33]">
                    {c.label}
                  </span>
                  <span className="mt-1.5 flex-1 text-sm leading-relaxed text-[#5A6C85]">
                    {c.blurb}
                  </span>
                  <span className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5A6C85]">
                      {live} tools
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#ED7D22] group-hover:underline">
                      View Tools <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Find your tool",
    text: "Browse the seven trade categories or hit ⌘K to search all 31 calculators by name, tag, or trade.",
  },
  {
    icon: ListChecks,
    title: "Run the math",
    text: "Enter dimensions with fraction-friendly inputs. Every result shows net quantity, waste, and a bill of materials.",
  },
  {
    icon: BadgeDollarSign,
    title: "Price the bid",
    text: "Add any result to the Master Bid Cart, apply markup and tax, and export a client-ready proposal PDF.",
  },
];

function HowItWorks() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Tape measure to bid in minutes"
            lede="A simple workflow that takes you from a jobsite measurement to a priced proposal."
            align="center"
            className="reveal"
          />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="reveal rounded-xl border border-border bg-background p-6"
                style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ED7D22]/15">
                  <s.icon className="h-5 w-5 text-[#ED7D22]" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold tracking-tight text-[#0B1B33]">
                  <span className="mr-2 font-mono text-sm font-bold text-[#ED7D22]">
                    {i + 1}
                  </span>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5A6C85]">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust strip                                                         */
/* ------------------------------------------------------------------ */

const TRUST = [
  {
    icon: BadgeCheck,
    title: "Free forever",
    text: "Every calculator is free — no trials, no paywalls, no feature gates.",
  },
  {
    icon: KeyRound,
    title: "No account",
    text: "No sign-up or login. Open a tool and start calculating immediately.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    text: "All math runs on your device. Your numbers are never uploaded anywhere.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    text: "After your first visit the app keeps working on the jobsite, no signal needed.",
  },
];

function TrustStrip() {
  return (
    <section
      aria-label="Why BuildCalc Pro is free and private"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Built on trust"
          title="Free tools, honest math"
          lede="No subscriptions, no data collection, no fine print — just calculators that respect your time and your privacy."
          className="reveal"
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t, i) => (
            <li
              key={t.title}
              className="reveal rounded-xl border border-border bg-white p-5"
              style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
            >
              <t.icon className="h-6 w-6 text-[#14284A]" aria-hidden />
              <h3 className="mt-3 font-display text-base font-extrabold tracking-tight text-[#0B1B33]">
                {t.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5A6C85]">{t.text}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ (verbatim)                                                       */
/* ------------------------------------------------------------------ */

const HOME_FAQS = [
  {
    q: "Is BuildCalc Pro really free?",
    a: "Yes — every calculator is free with no account, no trial, and no feature gates. Your estimates are stored in your own browser, not on our servers.",
  },
  {
    q: "Do I need an internet connection on the job site?",
    a: "Only for the first visit. After that the app is installable and works offline — all math runs 100% in your browser.",
  },
  {
    q: "How is this different from a phone calculator app?",
    a: "BuildCalc Pro speaks construction: feet-inches-fractions, waste factors, 16-inch on-center spacing, NEC and IRC code checks, and one-tap bill-of-materials lines that flow straight into a bid proposal.",
  },
  {
    q: "Will my estimate data be sold or uploaded?",
    a: "No. There is no database, no login, and no analytics beacon. Your numbers never leave your device unless you explicitly export them.",
  },
  {
    q: "Can I print a material list for the supplier?",
    a: "Yes — every calculator has a Print / Export slip button that produces a clean, ink-friendly material list with net quantities, waste, and order totals.",
  },
  {
    q: "Which calculators are available?",
    a: "All 31 are live: concrete (slabs, rebar), CMU block and mortar, framing and drywall, roof pitch and shingles, rafter cut lengths, stairs with IRC code checks, tile and grout, paint, flooring, drywall texture and mud, insulation, trim and molding, siding and housewrap, decks, fences, pavers, excavation and dirt haul, retaining walls, aggregate tonnage, asphalt paving, HVAC sizing, PEX plumbing, electrical conduit and voltage drop, true labor burden rates, subcontractor piece-work, daily overhead breakeven, markup-vs-margin bid math, a feet-inches-fraction keypad, a unit converter — plus the Master Proposal Builder that compiles everything into a client-ready PDF.",
  },
];

function HomeFaq() {
  return (
    <section
      aria-label="Frequently asked questions"
      className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <Reveal>
        <SectionHeading
          eyebrow="FAQ"
          title="Questions contractors ask"
          align="center"
          className="reveal"
        />
        <div className="mt-8 space-y-2">
          {HOME_FAQS.map((f) => (
            <details
              key={f.q}
              className="reveal group rounded-xl border border-border bg-white px-4 py-3"
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-sm font-bold text-[#0B1B33] marker:hidden [&::-webkit-details-marker]:hidden">
                <span
                  className="mr-2 inline-block shrink-0 text-[#ED7D22] transition-transform group-open:rotate-90"
                  aria-hidden
                >
                  ▸
                </span>
                {f.q}
              </summary>
              <p className="pb-1 pl-6 text-sm leading-relaxed text-[#5A6C85]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
      <Reveal>
        <div className="reveal relative overflow-hidden rounded-2xl bg-[#14284A] p-8 sm:p-12">
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Logo
                size={40}
                wordmarkClassName="text-white"
                className="[&_span]:text-white"
              />
              <h2 className="mt-4 max-w-xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your next bid starts here.
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-white/70">
                Free construction calculators for every trade — no account, no
                fees, works offline on the jobsite.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                className="min-h-[48px] bg-[#ED7D22] text-base font-bold text-white hover:bg-[#d56f1c]"
              >
                <Link href="/tools">
                  Explore Tools <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-[48px] border-white/30 bg-transparent text-base font-bold text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/request-tool">Request a Tool</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(HOME_FAQS)} />
      <Hero />
      <RecentlyUsed />
      <CategoryDirectory />
      <HowItWorks />
      <TrustStrip />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
