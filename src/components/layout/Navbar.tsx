/**
 * BuildCalc Pro — Top navigation.
 *
 * Logo + category links, Cmd+K command palette trigger, persistent
 * "Master Bid Cart" trigger with live badge counter, and the client-side
 * offline indicator (100% private, no database required).
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardHat,
  Search,
  ShoppingCart,
  ShieldCheck,
  WifiOff,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEstimateCount } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { useOnline } from "@/hooks/useOnline";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";
import { CATEGORY_META } from "@/types/estimator";

function OfflineIndicator() {
  const online = useOnline();
  return (
    <Badge
      variant={online ? "success" : "outline"}
      className="hidden sm:inline-flex"
      title={
        online
          ? "Runs entirely in your browser. No account, no cloud, no database."
          : "You're offline — every calculator still works. Data stays on this device."
      }
    >
      {online ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          Private · No cloud
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline · Still works
        </>
      )}
    </Badge>
  );
}

function CartTrigger() {
  const count = useEstimateCount();
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);
  return (
    <Button
      variant="default"
      size="sm"
      className="relative gap-2"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Open Master Bid Cart, ${count} items`}
    >
      <ShoppingCart className="h-4 w-4" />
      <span className="hidden md:inline">Master Bid Cart</span>
      {count > 0 && (
        <span
          className={cn(
            "absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1",
            "bg-accent text-[11px] font-extrabold text-white tabular-nums ring-2 ring-background",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="BuildCalc Pro home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold uppercase tracking-wide">
            Build<span className="text-primary">Calc</span>
            <span className="text-zinc-500"> Pro</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Primary">
          <Link
            href="/tools"
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-panel hover:text-zinc-50",
              pathname === "/tools" && "text-primary",
            )}
          >
            All calculators
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-panel hover:text-zinc-50"
                aria-label="Browse categories"
              >
                <LayoutGrid className="h-4 w-4" />
                Categories
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {TOOL_CATEGORIES.map((c) => (
                <DropdownMenuItem key={c} asChild>
                  <Link href={`/tools#${c}`} className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold">{CATEGORY_META[c].label}</span>
                    <span className="text-xs text-zinc-500">{CATEGORY_META[c].tagline}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex-1" />

        <OfflineIndicator />

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden h-9 items-center gap-2 rounded-lg border border-input bg-zinc-950 px-3 text-sm text-zinc-400 transition-colors hover:border-primary hover:text-zinc-200 md:flex"
          aria-label="Search calculators (Command K)"
        >
          <Search className="h-4 w-4" />
          <span>Search calculators…</span>
          <kbd className="rounded border border-border bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            ⌘K
          </kbd>
        </button>
        <Button
          variant="outline"
          size="iconSm"
          className="md:hidden"
          onClick={() => setPaletteOpen(true)}
          aria-label="Search calculators"
        >
          <Search className="h-4 w-4" />
        </Button>

        <CartTrigger />
      </div>

      {/* Category quick-links (desktop sub-nav) */}
      <nav
        className="hidden border-t border-border/50 md:block"
        aria-label="Categories"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-1.5">
          {TOOL_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/tools#${c}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-panel hover:text-primary"
            >
              {CATEGORY_META[c].label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
