import type { Metadata } from "next";
import { PageHero, CrumbNav } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { formatBlogDate } from "@/data/blog";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms of use for BuildCalc Pro, a free construction calculator platform.",
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

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        lede={`The rules for using BuildCalc Pro. Last updated ${formatBlogDate(UPDATED)}.`}
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "Terms of Use" }]}
          />
        </div>
      </PageHero>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Reveal className="space-y-8">
          <Section h2="1. The service">
            <p>
              BuildCalc Pro (“the platform”) is a free, browser-based set of
              construction calculators and estimating tools. You may use every
              tool without creating an account, paying a fee, or providing
              personal information.
            </p>
          </Section>
          <Section h2="2. Calculations are planning aids">
            <p>
              Results are estimates produced by standard industry formulas.
              They are planning aids not engineering advice, not a bid
              guarantee, and not a substitute for licensed professionals or
              your local building code. See the{" "}
              <a
                href="/disclaimer"
                className="font-bold text-[#2563EB] hover:underline"
              >
                disclaimer
              </a>{" "}
              for details.
            </p>
          </Section>
          <Section h2="3. Acceptable use">
            <p>
              You agree not to misuse the platform: no attempts to disrupt,
              reverse-engineer for harmful purposes, or scrape at a rate that
              degrades the service for others. The tools are for your own
              estimating work; automated bulk extraction of site content is
              not permitted without written permission.
            </p>
          </Section>
          <Section h2="4. Your data stays yours">
            <p>
              The platform has no database and no accounts. Estimates you
              create are stored only in your browser's local storage, on your
              device. We cannot see, recover, or delete them for you clear
              your browser data and they are gone. Exported files (JSON
              estimates, proposal PDFs) are generated on your device and
              belong to you.
            </p>
          </Section>
          <Section h2="5. Intellectual property">
            <p>
              The platform's design, code, guides, and calculator
              implementations are owned by BuildCalc Pro. You may use the
              tools and share links to them freely; you may not copy the
              site wholesale, rebrand it, or resell access to it.
            </p>
          </Section>
          <Section h2="6. No warranty">
            <p>
              The platform is provided “as is,” without warranties of any
              kind. We work hard to keep the math correct and we fix
              verified errors but we cannot guarantee every result suits
              your project. You are responsible for verifying quantities,
              prices, and code compliance before you build or bid.
            </p>
          </Section>
          <Section h2="7. Limitation of liability">
            <p>
              To the fullest extent permitted by law, BuildCalc Pro is not
              liable for losses arising from use of the platform, including
              but not limited to material over- or under-orders, bid errors,
              project delays, or code-compliance issues. Verify critical
              numbers independently.
            </p>
          </Section>
          <Section h2="8. Changes">
            <p>
              We may update these terms as the platform grows. Continued use
              after an update means you accept the new terms. Major changes
              will be noted with a new “last updated” date above.
            </p>
          </Section>
        </Reveal>
      </main>
    </>
  );
}
