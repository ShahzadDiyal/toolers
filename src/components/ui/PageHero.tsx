/**
 * BuildCalc Pro Shared page furniture.
 *
 * SectionHeading: consistent eyebrow + H2 + lede for every marketing section.
 * PageHero: consistent interior-page hero (breadcrumb slot, title, lede).
 */
import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "reveal max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ED7D22]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#0B1B33] sm:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-3 text-[15px] leading-relaxed text-[#5A6C85]">{lede}</p>
      )}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "bg-blueprint relative overflow-hidden border-b border-border",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
        {eyebrow && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ED7D22]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-[#0B1B33] sm:text-5xl">
          {title}
        </h1>
        {lede && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#5A6C85]">
            {lede}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function CrumbNav({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="no-print">
      <ol className="flex flex-wrap items-center gap-1 text-[13px]">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden />
            )}
            {c.href ? (
              <Link
                href={c.href}
                className="font-semibold text-[#2563EB] hover:underline"
              >
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-[#5A6C85]">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
