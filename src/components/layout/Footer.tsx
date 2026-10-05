/**
 * BuildCalc Pro — Site footer.
 *
 * Full platform navigation: brand block, Platform / Resources / Company /
 * Legal columns, tool-category strip, and an honest disclaimer line.
 * Every link points at a real route.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, categoryHref } from "@/data/toolsRegistry";

const COLUMNS: {
  heading: string;
  links: { label: string; href: string }[];
}[] = [
  {
    heading: "Platform",
    links: [
      { label: "All tools", href: "/tools" },
      { label: "Categories", href: "/categories" },
      { label: "Services", href: "/services" },
      { label: "Blog", href: "/blog" },
      { label: "Request a custom tool", href: "/request-tool" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "How it works", href: "/about" },
      { label: "Estimating guides", href: "/blog" },
      { label: "Master Proposal Builder", href: "/tools/master-proposal-builder" },
      { label: "Bid cart", href: "/estimate-builder" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#0B1B33]/10 bg-[#14284A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          {/* Brand block */}
          <div>
            <Link href="/" aria-label="BuildCalc Pro — home" className="inline-block rounded-lg">
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
                  <span className="ml-1.5 rounded bg-[#ED7D22] px-1.5 py-0.5 align-middle text-[11px] font-extrabold tracking-widest text-white">
                    PRO
                  </span>
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Free construction calculators for contractors, builders,
              estimators, and homeowners. Every tool runs in your browser —
              no account, no subscription, your numbers never leave your device.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-[#ED7D22]" aria-hidden />
              31 tools · Free forever
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.heading} aria-label={`Footer — ${col.heading}`}>
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
        <nav aria-label="Footer — tool categories" className="mt-10 border-t border-white/10 pt-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={categoryHref(c.id)}
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/60 transition-colors hover:text-white"
                >
                  {c.label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BuildCalc Pro. Free construction tools for everyone.</p>
          <p className="max-w-md sm:text-right">
            Estimates are planning aids — verify quantities against your local
            codes and supplier quotes.
          </p>
        </div>
      </div>
    </footer>
  );
}
