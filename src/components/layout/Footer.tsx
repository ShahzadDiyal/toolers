/**
 * BuildCalc Pro Site footer.
 *
 * Localized UI shell: headings, labels, and legal lines come from the
 * locale dictionary. Full platform navigation: brand block, Platform /
 * Resources / Company / Legal columns, tool-category strip, disclaimer.
 */
"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, categoryHref, toolHref, getToolBySlug } from "@/data/toolsRegistry";
import { useTranslation } from "@/i18n/I18nProvider";
import { localePath } from "@/i18n/config";

export function Footer() {
  const { locale, t } = useTranslation();
  const proposalTool = getToolBySlug("master-proposal-builder");

  const COLUMNS: {
    heading: string;
    links: { label: string; href: string }[];
  }[] = [
    {
      heading: t.footer.platform,
      links: [
        { label: t.footer.allTools, href: localePath("/tools", locale) },
        { label: t.footer.categories, href: localePath("/categories", locale) },
        { label: t.nav.services, href: localePath("/services", locale) },
        { label: t.nav.blog, href: localePath("/blog", locale) },
        { label: t.nav.requestCustomTool, href: localePath("/request-tool", locale) },
        { label: t.nav.contact, href: localePath("/contact", locale) },
      ],
    },
    {
      heading: t.footer.resources,
      links: [
        { label: t.footer.howItWorks, href: localePath("/about", locale) },
        { label: t.footer.estimatingGuides, href: localePath("/blog", locale) },
        { label: proposalTool?.title ?? "Master Proposal Builder", href: toolHref({ slug: "master-proposal-builder" }, locale) },
        { label: t.nav.bidCart, href: localePath("/estimate-builder", locale) },
      ],
    },
    {
      heading: t.footer.company,
      links: [
        { label: t.nav.about, href: localePath("/about", locale) },
        { label: t.nav.services, href: localePath("/services", locale) },
        { label: t.nav.contact, href: localePath("/contact", locale) },
      ],
    },
    {
      heading: t.footer.legal,
      links: [
        { label: t.footer.privacy, href: localePath("/privacy", locale) },
        { label: t.footer.termsOfUse, href: localePath("/terms", locale) },
        { label: t.footer.disclaimer, href: localePath("/disclaimer", locale) },
      ],
    },
  ];

  return (
    <footer className="border-t border-[#0B1B33]/10 bg-[#14284A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          {/* Brand block */}
          <div>
            <Link href={localePath("/", locale)} aria-label="BuildCalc Pro home" className="inline-block rounded-lg">
              <span className="inline-flex items-center gap-2.5">
                <svg width="38" height="38" viewBox="0 0 64 64" role="img" aria-label="BuildCalc Pro">
                  <rect x="2" y="2" width="60" height="60" rx="15" fill="#FFFFFF" opacity="0.12" />
                  <rect x="15" y="34" width="9" height="13" rx="2" fill="#ED7D22" />
                  <rect x="27.5" y="26" width="9" height="21" rx="2" fill="#ED7D22" />
                  <rect x="40" y="18" width="9" height="29" rx="2" fill="#ED7D22" />
                  <rect x="13" y="50" width="38" height="4.5" rx="2.25" fill="#FFFFFF" />
                  <rect x="17" y="42" width="3" height="6" rx="1.5" fill="#FFFFFF" opacity="0.85" />
                  <rect x="29.5" y="42" width="3" height="6" rx="1.5" fill="#FFFFFF" opacity="0.85" />
                  <rect x="42" y="42" width="3" height="6" rx="1.5" fill="#FFFFFF" opacity="0.85" />
                </svg>
                <span className="font-display text-xl font-extrabold uppercase tracking-wide text-white">
                  BuildCalc
                  <span className="ms-1.5 rounded bg-[#ED7D22] px-1.5 py-0.5 align-middle text-[11px] font-extrabold tracking-widest text-white">
                    PRO
                  </span>
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {t.footer.tagline}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-[#ED7D22]" aria-hidden />
              {t.footer.toolsCount.replace("{count}", "39")}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.heading} aria-label={`Footer ${col.heading}`}>
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/50">
                  {col.heading}
                </h2>
                <ul className="mt-3 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className="inline-flex min-h-[32px] items-center gap-1 rounded py-1 text-sm font-medium text-white/80 transition-colors hover:text-[#ED7D22]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Tool categories strip */}
        <nav aria-label="Footer tool categories" className="mt-10 border-t border-white/10 pt-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={categoryHref(c.id, locale)}
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/60 transition-colors hover:text-white"
                >
                  {t.categories[c.id].title}
                  <ArrowUpRight className="h-3 w-3 rtl:-scale-x-100" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.rights.replace("{year}", String(new Date().getFullYear()))}</p>
          <p className="max-w-md sm:text-end">
            {t.footer.disclaimerLine}
          </p>
        </div>
      </div>
    </footer>
  );
}
