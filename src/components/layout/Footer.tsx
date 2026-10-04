/**
 * BuildCalc Pro — Footer.
 */
import Link from "next/link";
import { HardHat, ShieldCheck, DatabaseZap } from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";
import { CATEGORY_META } from "@/types/estimator";

export function Footer() {
  return (
    <footer className="border-t border-border bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-extrabold uppercase tracking-wide">
              Build<span className="text-primary">Calc</span>
              <span className="text-zinc-500"> Pro</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
            The zero-database contractor estimating suite. Instant, free,
            client-side calculators and bid proposals — no logins, no monthly
            SaaS fees, no cloud servers.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              100% private — your numbers never leave this device
            </span>
            <span className="inline-flex items-center gap-2">
              <DatabaseZap className="h-4 w-4 text-primary" />
              Zero database · works fully offline on the job site
            </span>
          </div>
        </div>

        <nav aria-label="Calculator categories">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
            Categories
          </h3>
          <ul className="mt-4 space-y-2.5">
            {TOOL_CATEGORIES.map((c) => (
              <li key={c}>
                <Link
                  href={`/tools#${c}`}
                  className="text-sm text-zinc-400 transition-colors hover:text-primary"
                >
                  {CATEGORY_META[c].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Platform">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
            Platform
          </h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/tools" className="text-sm text-zinc-400 transition-colors hover:text-primary">
                All calculators
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm text-zinc-400 transition-colors hover:text-primary">
                Privacy — nothing to track
              </Link>
            </li>
            <li>
              <span className="text-sm text-zinc-600">
                Bid proposals · JSON export · Print-ready
              </span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-zinc-600 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} BuildCalc Pro. Built for the trades.</span>
          <span className="font-mono">v0.1.0 · phase 1 foundation</span>
        </div>
      </div>
    </footer>
  );
}
