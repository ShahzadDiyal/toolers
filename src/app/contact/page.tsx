import type { Metadata } from "next";
import { MailQuestion } from "lucide-react";
import { PageHero, SectionHeading, CrumbNav } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Get in Touch",
  description:
    "Have a question, suggestion, or tool request? Get in touch with the BuildCalc Pro team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        lede="Have a question, suggestion, or tool request? Get in touch we read every message."
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
          />
        </div>
      </PageHero>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Reveal className="grid gap-10 lg:grid-cols-5">
          <div className="reveal lg:col-span-2">
            <SectionHeading
              eyebrow="Contact"
              title="We'd like to hear from you"
              lede="Found a bug in a calculator? Want a tool we don't have yet? Spotted a number that looks off? This is the fastest way to reach us."
            />
            <div className="mt-6 flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#14284A]">
                <MailQuestion className="h-5 w-5 text-[#ED7D22]" aria-hidden />
              </span>
              <div>
                <h2 className="font-extrabold text-[#0B1B33]">
                  What to include
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[#5A6C85]">
                  For calculator issues, tell us which tool you were using
                  and the numbers you entered. For tool requests, describe
                  what it should calculate or use the{" "}
                  <a
                    href="/request-tool"
                    className="font-bold text-[#2563EB] hover:underline"
                  >
                    dedicated request form
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
          <div className="reveal rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:col-span-3">
            <ContactForm />
          </div>
        </Reveal>
      </main>
    </>
  );
}
