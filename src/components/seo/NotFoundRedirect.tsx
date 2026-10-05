"use client";

/**
 * Smart 404 handler: instead of a dead-end "not found" page, this reads the
 * attempted URL, fuzzy-matches it against the real tool registry, categories
 * and guides, and redirects the visitor to the closest match automatically.
 * Weak matches fall back to a suggestion list + normal navigation.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HardHat,
  Home,
  LayoutGrid,
  ArrowRight,
  Search,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import {
  TOOLS,
  CATEGORIES,
  toolHref,
  categoryHref,
} from "@/data/toolsRegistry";
import { BLOG_POSTS } from "@/data/blog";

interface Suggestion {
  href: string;
  label: string;
  kind: string;
  score: number;
}

/** Confidence at or above this auto-redirects instead of just suggesting. */
const AUTO_REDIRECT_SCORE = 70;
const REDIRECT_DELAY_MS = 2200;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const cur = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = cur;
    }
  }
  return dp[n];
}

/** Score 0–100 for how well a normalized query matches candidate strings. */
function scoreCandidate(query: string, candidates: string[]): number {
  const q = normalize(query);
  if (q.length < 2) return 0;
  const qCompact = q.replace(/ /g, "");
  const qWords = q.split(" ").filter((w) => w.length > 2);
  let best = 0;

  for (const raw of candidates) {
    const c = normalize(raw);
    if (!c) continue;
    const cCompact = c.replace(/ /g, "");
    const cWords = c.split(" ");

    if (c === q || cCompact === qCompact) return 100;
    if (c.startsWith(q) || q.startsWith(c)) best = Math.max(best, 85);
    if (c.includes(q) || q.includes(c)) best = Math.max(best, 70);

    // Typo tolerance: "concret-slab" -> "concrete-slab" is a strong signal.
    if (qCompact.length > 3 && cCompact.length > 3) {
      const d = levenshtein(qCompact, cCompact);
      if (d <= 2) best = Math.max(best, 95 - d * 10);
    }

    // Word overlap (e.g. "concrete estimator" vs "Concrete Slab Calculator").
    const cWordSet = new Set(cWords);
    const overlap = qWords.filter((w) => cWordSet.has(w)).length;
    if (overlap > 0) best = Math.max(best, 40 + overlap * 12);

    // Word-prefix match (e.g. "tilecalc" -> "tile", "roofing" -> "roof").
    for (const qw of qWords) {
      for (const cw of cWords) {
        if (
          (qw.length >= 4 && cw.length >= 3 && qw.startsWith(cw)) ||
          (cw.length >= 4 && qw.length >= 3 && cw.startsWith(qw))
        ) {
          best = Math.max(best, 55);
        }
      }
    }
  }
  return best;
}

function findSuggestions(pathname: string): Suggestion[] {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  const q = normalize(segment);
  if (q.length < 2) return [];

  const out: Suggestion[] = [];

  for (const t of TOOLS) {
    const s = Math.max(
      scoreCandidate(q, [t.slug, t.title]),
      scoreCandidate(q, t.tags ?? []) * 0.9,
    );
    if (s > 0)
      out.push({ href: toolHref(t), label: t.title, kind: "Calculator", score: s });
  }
  for (const c of CATEGORIES) {
    const s = scoreCandidate(q, [c.id, c.label]);
    if (s > 0)
      out.push({
        href: categoryHref(c.id),
        label: `${c.label}`,
        kind: "Category",
        score: s * 0.95,
      });
  }
  for (const p of BLOG_POSTS) {
    const s = scoreCandidate(q, [p.slug, p.title]);
    if (s > 0)
      out.push({
        href: `/blog/${p.slug}`,
        label: p.title,
        kind: "Guide",
        score: s * 0.85,
      });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 4);
}

const FALLBACK_POPULAR: Suggestion[] = [
  { href: "/tools/concrete-slab", label: "Concrete Slab Calculator", kind: "Calculator", score: 0 },
  { href: "/tools/roof-pitch-shingles", label: "Roof Pitch & Shingle Calculator", kind: "Calculator", score: 0 },
  { href: "/tools/stair-stringer-layout", label: "Stair Stringer Layout", kind: "Calculator", score: 0 },
  { href: "/tools/estimate-builder", label: "Master Estimate Builder", kind: "Calculator", score: 0 },
];

export function NotFoundRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const [redirectingTo, setRedirectingTo] = useState<Suggestion | null>(null);

  const suggestions = useMemo(
    () => findSuggestions(pathname ?? ""),
    [pathname],
  );

  useEffect(() => {
    const top = suggestions[0];
    if (top && top.score >= AUTO_REDIRECT_SCORE) {
      setRedirectingTo(top);
      const t = setTimeout(() => router.replace(top.href), REDIRECT_DELAY_MS);
      return () => clearTimeout(t);
    }
    setRedirectingTo(null);
  }, [suggestions, router]);

  // Strong match: show a brief "taking you there" state, then redirect.
  if (redirectingTo) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14284A]">
          <Loader2
            className="h-8 w-8 animate-spin text-[#ED7D22]"
            aria-hidden
          />
        </span>
        <p className="mt-6 font-mono text-sm font-bold uppercase tracking-[0.3em] text-[#ED7D22]">
          Redirecting
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#0B1B33] sm:text-4xl">
          That page moved — taking you to the right one.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5A6C85]">
          We couldn&apos;t find{" "}
          <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-sm text-[#14284A]">
            {pathname}
          </code>
          , but this looks like what you wanted:
        </p>
        <Link
          href={redirectingTo.href}
          className="group mt-6 inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[#14284A] px-6 text-sm font-bold text-white transition hover:bg-[#0e1e38]"
        >
          <CornerDownRight className="h-4 w-4 text-[#ED7D22]" aria-hidden />
          {redirectingTo.label}
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
            {redirectingTo.kind}
          </span>
        </Link>
        <p className="mt-4 text-sm text-[#5A6C85]">
          Not right?{" "}
          <Link href="/tools" className="font-bold text-[#2563EB] hover:underline">
            Browse all calculators
          </Link>
        </p>
      </div>
    );
  }

  // No confident match: show closest suggestions + normal navigation.
  const list = suggestions.length > 0 ? suggestions : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14284A]">
        <HardHat className="h-8 w-8 text-[#ED7D22]" aria-hidden />
      </span>

      <p className="mt-6 font-mono text-sm font-bold uppercase tracking-[0.3em] text-[#ED7D22]">
        Error 404
      </p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-[#0B1B33] sm:text-5xl">
        This page is off the plans.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5A6C85]">
        We couldn&apos;t find{" "}
        <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-sm text-[#14284A]">
          {pathname}
        </code>{" "}
        — it may have been moved or renamed. Here&apos;s the closest match:
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#14284A] px-6 text-sm font-bold text-white transition hover:bg-[#0e1e38]"
        >
          <Home className="h-4 w-4" aria-hidden />
          Back to Home
        </Link>
        <Link
          href="/tools"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#14284A]/20 bg-white px-6 text-sm font-bold text-[#14284A] transition hover:border-[#14284A]/40"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden />
          Browse All Calculators
        </Link>
      </div>

      <div className="mt-12 w-full rounded-2xl border border-border bg-white p-6 text-left sm:p-8">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#5A6C85]">
          <Search className="h-4 w-4 text-[#ED7D22]" aria-hidden />
          {list ? "Did you mean" : "Popular calculators"}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(list ?? FALLBACK_POPULAR).map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-[#F1F5F9] px-4 py-3 text-sm font-semibold text-[#14284A] transition hover:border-[#ED7D22]/60 hover:bg-[#ED7D22]/5"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-[#14284A]/10 px-2 py-0.5 text-xs font-bold text-[#14284A]">
                    {t.kind}
                  </span>
                  {t.label}
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[#ED7D22] transition group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
