import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, ListChecks, Rocket } from "lucide-react";
import { PageHero, SectionHeading, CrumbNav } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { RequestForm } from "./RequestForm";

export const metadata: Metadata = {
  title: "Request a Custom Tool",
  description:
    "Can't find the tool you need? Tell us what it should calculate and we'll consider adding it to BuildCalc Pro.",
};

export default function RequestToolPage() {
  return (
    <>
      <PageHero
        eyebrow="Custom tool request"
        title="Can't find the tool you need?"
        lede="Tell us what you need and we'll consider adding it to the platform. The best ideas come from the field."
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "Request a Tool" }]}
          />
        </div>
      </PageHero>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Reveal className="grid gap-10 lg:grid-cols-5">
          <div className="reveal lg:col-span-2">
            <SectionHeading
              eyebrow="How it works"
              title="From your jobsite to the platform"
            />
            <div className="mt-6 space-y-4">
              {[
                {
                  icon: Lightbulb,
                  title: "1. You describe it",
                  body: "Name the tool, what it should calculate, and the inputs and outputs you need.",
                },
                {
                  icon: ListChecks,
                  title: "2. We review it",
                  body: "We check the math, the methodology, and how many contractors it would help.",
                },
                {
                  icon: Rocket,
                  title: "3. We build it",
                  body: "The most-requested tools get built, tested, and added to the free platform.",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#14284A]">
                    <s.icon
                      className="h-5 w-5 text-[#ED7D22]"
                      aria-hidden
                    />
                  </span>
                  <div>
                    <h2 className="font-extrabold text-[#0B1B33]">{s.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#5A6C85]">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-[#5A6C85]">
              Just have a quick question instead? Use the{" "}
              <Link
                href="/contact"
                className="font-bold text-[#2563EB] hover:underline"
              >
                contact form
              </Link>
              .
            </p>
          </div>
          <div className="reveal rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:col-span-3">
            <RequestForm />
          </div>
        </Reveal>
      </main>
    </>
  );
}
