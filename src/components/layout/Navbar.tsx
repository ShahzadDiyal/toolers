/**
 * BuildCalc Pro — Primary navigation.
 *
 * Desktop: brand logo, Tools mega-menu (categories × real tools), Services,
 * Blog, About, Contact, Custom Tool CTA. Mobile: slide-down panel with a
 * Tools accordion. Search (⌘K), Master Bid Cart, and the offline indicator
 * are preserved from the previous shell.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  ShieldCheck,
  WifiOff,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { useEstimateCount } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { useOnline } from "@/hooks/useOnline";
import {
  CATEGORIES,
  toolsByCategory,
  toolHref,
  categoryHref,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function OfflineIndicator() {
  const online = useOnline();
  return (
    <Badge
      variant={online ? "success" : "outline"}
      className="hidden shrink-0 whitespace-nowrap xl:inline-flex"
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
      className="relative min-h-[40px] gap-2 bg-[#14284A] hover:bg-[#0e1d38]"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Open Master Bid Cart, ${count} items`}
    >
      <ShoppingCart className="h-4 w-4" />
      <span className="hidden md:inline">Bid Cart</span>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ED7D22] px-1 text-[11px] font-extrabold tabular-nums text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

/* ---------------- Tools mega menu (desktop) ---------------- */

function ToolsMegaMenu() {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onFocus={enter}
        className={cn(
          "flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-[#14284A] transition-colors hover:bg-[#14284A]/5",
          open && "bg-[#14284A]/5",
        )}
      >
        <Wrench className="h-4 w-4 text-[#ED7D22]" aria-hidden />
        Tools
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div className="menu-in absolute left-1/2 top-full z-50 w-[min(92vw,880px)] -translate-x-1/2 pt-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_64px_-16px_rgb(11_27_51/0.25)]">
            <div className="grid gap-1 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => {
                const tools = toolsByCategory(c.id)
                  .filter((t) => t.available)
                  .slice(0, 4);
                const Icon = toolIcon(c.iconName);
                return (
                  <div key={c.id} className="rounded-xl p-3 transition-colors hover:bg-[#F1F5F9]">
                    <Link
                      href={categoryHref(c.id)}
                      className="flex items-center gap-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14284A]/8 text-[#14284A]">
                        <Icon className="h-4.5 w-4.5" aria-hidden />
                      </span>
                      <span className="text-sm font-extrabold text-[#14284A]">
                        {c.label}
                      </span>
                    </Link>
                    <ul className="mt-2 space-y-0.5 pl-[46px]">
                      {tools.map((t) => (
                        <li key={t.id}>
                          <Link
                            href={toolHref(t)}
                            onClick={() => setOpen(false)}
                            className="block truncate rounded px-1 py-1 text-[13px] font-medium text-[#5A6C85] transition-colors hover:text-[#ED7D22]"
                          >
                            {t.title}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={categoryHref(c.id)}
                          onClick={() => setOpen(false)}
                          className="mt-0.5 inline-flex items-center gap-1 px-1 py-1 text-[13px] font-bold text-[#2563EB] hover:underline"
                        >
                          All {c.label.split(",")[0]} tools
                          <ArrowRight className="h-3 w-3" aria-hidden />
                        </Link>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border bg-[#F8FAFD] px-5 py-3">
              <p className="text-[13px] font-medium text-[#5A6C85]">
                31 free calculators — no account, no fees.
              </p>
              <Link
                href="/tools"
                onClick={() => setOpen(false)}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#14284A] hover:text-[#ED7D22]"
              >
                Browse the full directory
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Mobile menu ---------------- */

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [toolsOpen, setToolsOpen] = React.useState(true);
  const pathname = usePathname();
  const prevPathname = React.useRef(pathname);

  // Close the menu when the route actually changes — but NOT on mount,
  // otherwise the menu shuts itself the instant it opens.
  React.useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  return (
    <div className="menu-in border-t border-border bg-white lg:hidden">
      <nav aria-label="Mobile" className="mx-auto max-h-[75vh] max-w-7xl overflow-y-auto px-4 py-3 sm:px-6">
        {/* Tools accordion */}
        <button
          type="button"
          aria-expanded={toolsOpen}
          onClick={() => setToolsOpen((o) => !o)}
          className="flex min-h-[48px] w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[15px] font-extrabold text-[#14284A]"
        >
          <span className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-[#ED7D22]" aria-hidden />
            Tools
          </span>
          <ChevronDown
            className={cn("h-4 w-4 text-zinc-500 transition-transform", toolsOpen && "rotate-180")}
            aria-hidden
          />
        </button>
        {toolsOpen && (
          <div className="space-y-1 pb-2">
            {CATEGORIES.map((c) => {
              const Icon = toolIcon(c.iconName);
              const count = toolsByCategory(c.id).filter((t) => t.available).length;
              return (
                <Link
                  key={c.id}
                  href={categoryHref(c.id)}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F1F5F9]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14284A]/8 text-[#14284A]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#14284A]">
                      {c.label}
                    </span>
                    <span className="block text-xs text-[#5A6C85]">
                      {count} free tools
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                </Link>
              );
            })}
            <Link
              href="/tools"
              className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg bg-[#14284A]/5 px-2 py-2 text-sm font-bold text-[#14284A]"
            >
              View all 31 tools <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}

        <div className="border-t border-border py-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-[48px] items-center rounded-lg px-2 py-2 text-[15px] font-bold text-[#14284A] transition-colors hover:bg-[#F1F5F9]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-border py-3">
          <Button asChild className="min-h-[52px] w-full bg-[#ED7D22] text-base hover:bg-[#d56f1c]">
            <Link href="/request-tool">Request a custom tool</Link>
          </Button>
          <p className="mt-2 text-center text-xs text-[#5A6C85]">
            Free forever · No account needed
          </p>
        </div>
      </nav>
    </div>
  );
}

/* ---------------- Navbar ---------------- */

export function Navbar() {
  const pathname = usePathname();
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when the mobile menu is open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/" aria-label="BuildCalc Pro — home" className="shrink-0 rounded-lg">
          <Logo size={34} wordmarkClassName="hidden min-[400px]:inline" />
        </Link>

        <nav className="ml-3 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          <ToolsMegaMenu />
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-bold text-[#14284A] transition-colors hover:bg-[#14284A]/5",
                pathname === l.href && "text-[#ED7D22]",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <OfflineIndicator />

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden h-10 items-center gap-2 rounded-lg border border-input bg-white px-3 text-sm text-[#5A6C85] transition-colors hover:border-[#2563EB] hover:text-[#14284A] lg:flex"
          aria-label="Search calculators (Command K)"
        >
          <Search className="h-4 w-4" aria-hidden />
          <span className="hidden xl:inline">Search tools…</span>
          <kbd className="hidden rounded border border-border bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[10px] text-[#5A6C85] xl:block">
            ⌘K
          </kbd>
        </button>

        <Button
          asChild
          className="hidden min-h-[40px] bg-[#ED7D22] hover:bg-[#d56f1c] lg:inline-flex"
          size="sm"
        >
          <Link href="/request-tool">Request a Tool</Link>
        </Button>

        <CartTrigger />

        <Button
          variant="outline"
          size="iconSm"
          className="min-h-[40px] min-w-[40px] lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  );
}
