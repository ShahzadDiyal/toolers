import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHero, CrumbNav } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { formatBlogDate } from "@/data/blog";

export const metadata: Metadata = {
  title: "Disclaimer Estimates Are Planning Aids",
  description:
    "BuildCalc Pro calculators are planning aids, not engineering advice. Always verify with licensed professionals and local codes.",
};

const UPDATED = "2026-10-05";

function Section({
  h2,
  children,
}: {
  h2: string;
  children: React.ReactNode;
}) {
  return (
    <section className="reveal">
      <h2 className="font-display text-xl font-extrabold tracking-tight text-[#0B1B33]">
        {h2}
      </h2>
      <div className="mt-2 space-y-3 leading-relaxed text-[#0B1B33]/85">
        {children}
      </div>
    </section>
  );
}

export default function DisclaimerPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Disclaimer"
        lede={`Our calculators are planning aids powerful ones but they don't replace professional judgment. Last updated ${formatBlogDate(UPDATED)}.`}
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "Disclaimer" }]}
          />
        </div>
      </PageHero>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Reveal>
          <div className="reveal flex items-start gap-4 rounded-xl border border-[#ED7D22]/40 bg-[#ED7D22]/10 p-5">
            <AlertTriangle
              className="mt-0.5 h-6 w-6 shrink-0 text-[#ED7D22]"
              aria-hidden
            />
            <p className="leading-relaxed text-[#0B1B33]">
              <strong>
                Estimates produced by BuildCalc Pro are for planning purposes
                only.
              </strong>{" "}
              Do not rely on them as the sole basis for structural design,
              safety-critical decisions, bids you cannot afford to lose, or
              code compliance.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-8 space-y-8">
          <Section h2="Not engineering advice">
            <p>
              BuildCalc Pro is not an engineering firm, and nothing on this
              site constitutes engineering, architectural, legal, or
              financial advice. Our calculators implement standard industry
              formulas with clearly stated assumptions but every project
              has site conditions, loads, soils, and code requirements that
              no general-purpose calculator can know about.
            </p>
          </Section>
          <Section h2="Verify with licensed professionals">
            <p>
              Before you build, buy, or bid based on our numbers, have them
              reviewed by the appropriate licensed professional a
              structural engineer for structural work, a licensed electrician
              for electrical sizing, and so on. Material quantities should be
              confirmed with your supplier; prices and availability change.
            </p>
          </Section>
          <Section h2="Follow your local building code">
            <p>
              Building codes vary by jurisdiction and change over time. Where
              our guides or calculators reference code provisions (for
              example, stair dimensions under the IRC), treat them as
              educational summaries always confirm the current, locally
              adopted code with your building department or inspector before
              construction.
            </p>
          </Section>
          <Section h2="Assumptions and limitations">
            <p>
              Every calculator documents its key assumptions default waste
              percentages, coverage rates, stock sizes, and unit conversions.
              Results are only as good as the inputs: measure twice, double
              check unusual dimensions, and sanity-check any result before
              ordering materials or signing a contract.
            </p>
          </Section>
          <Section h2="Reporting errors">
            <p>
              We take accuracy seriously and fix verified errors. If a result
              looks wrong, tell us which tool you used and what you entered
              via the{" "}
              <Link
                href="/contact"
                className="font-bold text-[#2563EB] hover:underline"
              >
                contact form
              </Link>{" "}
              so we can investigate.
            </p>
          </Section>
        </Reveal>
      </main>
    </>
  );
}
