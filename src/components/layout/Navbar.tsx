/**
 * BuildCalc Pro Primary navigation.
 *
 * Localized UI shell: all labels come from the locale dictionary.
 * Desktop: brand logo, Tools mega-menu (categories × real tools), Services,
 * Blog, About, Contact, Custom Tool CTA. Mobile: slide-down panel with a
 * Tools accordion. Search (⌘K), Master Bid Cart, language switcher, and the
 * offline indicator are preserved from the previous shell.
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
  TOOLS,
  toolsByCategory,
  toolHref,
  categoryHref,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { useTranslation } from "@/i18n/I18nProvider";
import { localePath } from "@/i18n/config";
import { LanguageSelector } from "./LanguageSelector";

const AVAILABLE_COUNT = TOOLS.filter((t) => t.available).length;

function OfflineIndicator() {
  const { t } = useTranslation();
  const online = useOnline();
  return (
    <Badge
      variant={online ? "success" : "outline"}
      className="hidden shrink-0 whitespace-nowrap xl:inline-flex"
      title={online ? t.nav.onlineTitle : t.nav.offlineTitle}
    >
      {online ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          {t.nav.online}
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          {t.nav.offline}
        </>
      )}
    </Badge>
  );
}

function CartTrigger() {
  const { t } = useTranslation();
  const count = useEstimateCount();
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);
  return (
    <Button
      variant="default"
      size="sm"
      className="relative min-h-[40px] gap-2 bg-[#14284A] hover:bg-[#0e1d38]"
      onClick={() => setDrawerOpen(true)}
      aria-label={t.nav.bidCartAria.replace("{count}", String(count))}
    >
      <ShoppingCart className="h-4 w-4" />
      <span className="hidden md:inline">{t.nav.bidCart}</span>
      {count > 0 && (
        <span className="absolute -end-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ED7D22] px-1 text-[11px] font-extrabold tabular-nums text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

/* ---------------- Tools mega menu (desktop) ---------------- */

function ToolsMegaMenu() {
  const { locale, t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const clearTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearTimer();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    clearTimer();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 220);
  };

  // Close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on click outside or Escape
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  React.useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(e) => {
          e.preventDefault();
          clearTimer();
          setOpen((prev) => !prev);
        }}
        className={cn(
          "flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-[#14284A] transition-colors hover:bg-[#14284A]/5",
          open && "bg-[#14284A]/5 text-[#ED7D22]",
        )}
      >
        <Wrench className="h-4 w-4 text-[#ED7D22]" aria-hidden />
        {t.nav.tools}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-zinc-500 transition-transform duration-200",
            open && "rotate-180 text-[#ED7D22]",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="menu-in absolute start-1/2 top-full z-50 w-[min(92vw,880px)] -translate-x-1/2 pt-2 rtl:translate-x-1/2">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_64px_-16px_rgb(11_27_51/0.25)]">
            <div className="grid gap-1 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => {
                const tools = toolsByCategory(c.id)
                  .filter((tool) => tool.available)
                  .slice(0, 4);
                const Icon = toolIcon(c.iconName);
                const catTitle = t.categories[c.id].title;
                return (
                  <div key={c.id} className="rounded-xl p-3 transition-colors hover:bg-[#F1F5F9]">
                    <Link
                      href={categoryHref(c.id, locale)}
                      className="flex items-center gap-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14284A]/8 text-[#14284A]">
                        <Icon className="h-4.5 w-4.5" aria-hidden />
                      </span>
                      <span className="text-sm font-extrabold text-[#14284A]">
                        {catTitle}
                      </span>
                    </Link>
                    <ul className="mt-2 space-y-0.5 ps-[46px]">
                      {tools.map((tool) => (
                        <li key={tool.id}>
                          <Link
                            href={toolHref(tool, locale)}
                            onClick={() => setOpen(false)}
                            className="block truncate rounded px-1 py-1 text-[13px] font-medium text-[#5A6C85] transition-colors hover:text-[#ED7D22]"
                          >
                            {tool.title}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={categoryHref(c.id, locale)}
                          onClick={() => setOpen(false)}
                          className="mt-0.5 inline-flex items-center gap-1 px-1 py-1 text-[13px] font-bold text-[#2563EB] hover:underline"
                        >
                          {t.nav.allCategoryTools.replace("{category}", catTitle)}
                          <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
                        </Link>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border bg-[#F8FAFD] px-5 py-3">
              <p className="text-[13px] font-medium text-[#5A6C85]">
                {t.nav.toolsTagline.replace("{count}", String(AVAILABLE_COUNT))}
              </p>
              <Link
                href={localePath("/tools", locale)}
                onClick={() => setOpen(false)}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#14284A] hover:text-[#ED7D22]"
              >
                {t.nav.browseDirectory}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
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
  const { locale, t } = useTranslation();
  const [toolsOpen, setToolsOpen] = React.useState(true);

  const NAV_LINKS = [
    { label: t.nav.services, href: localePath("/services", locale) },
    { label: t.nav.blog, href: localePath("/blog", locale) },
    { label: t.nav.about, href: localePath("/about", locale) },
    { label: t.nav.contact, href: localePath("/contact", locale) },
  ];

  return (
    <div className="menu-in border-t border-border bg-white shadow-xl lg:hidden">
      <nav aria-label="Mobile" className="mx-auto max-h-[calc(100vh-4.5rem)] max-w-7xl overflow-y-auto px-4 py-3 sm:px-6">
        {/* Tools accordion */}
        <button
          type="button"
          aria-expanded={toolsOpen}
          onClick={() => setToolsOpen((o) => !o)}
          className="flex min-h-[48px] w-full items-center justify-between rounded-lg px-2 py-2 text-start text-[15px] font-extrabold text-[#14284A] transition-colors hover:bg-[#F1F5F9]"
        >
          <span className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-[#ED7D22]" aria-hidden />
            {t.nav.tools}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 text-zinc-500 transition-transform duration-200", toolsOpen && "rotate-180")}
            aria-hidden
          />
        </button>
        {toolsOpen && (
          <div className="space-y-1 pb-2">
            {CATEGORIES.map((c) => {
              const Icon = toolIcon(c.iconName);
              const count = toolsByCategory(c.id).filter((tool) => tool.available).length;
              return (
                <Link
                  key={c.id}
                  href={categoryHref(c.id, locale)}
                  onClick={onClose}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F1F5F9]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14284A]/8 text-[#14284A]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#14284A]">
                      {t.categories[c.id].title}
                    </span>
                    <span className="block text-xs text-[#5A6C85]">
                      {t.nav.freeTools.replace("{count}", String(count))}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 rtl:rotate-180" aria-hidden />
                </Link>
              );
            })}
            <Link
              href={localePath("/tools", locale)}
              onClick={onClose}
              className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg bg-[#14284A]/5 px-2 py-2 text-sm font-bold text-[#14284A] hover:bg-[#14284A]/10"
            >
              {t.nav.viewAllTools.replace("{count}", String(AVAILABLE_COUNT))} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        )}

        <div className="border-t border-border py-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="flex min-h-[48px] items-center rounded-lg px-2 py-2 text-[15px] font-bold text-[#14284A] transition-colors hover:bg-[#F1F5F9]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-border py-3">
          <Button asChild className="min-h-[52px] w-full bg-[#ED7D22] text-base font-bold shadow-sm hover:bg-[#d56f1c]">
            <Link href={localePath("/request-tool", locale)} onClick={onClose}>
              {t.nav.requestCustomTool}
            </Link>
          </Button>
          <p className="mt-2 text-center text-xs text-[#5A6C85]">
            {t.nav.requestToolNote}
          </p>
        </div>
      </nav>
    </div>
  );
}

/* ---------------- Navbar ---------------- */

export function Navbar() {
  const { locale, t } = useTranslation();
  const pathname = usePathname();
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleCloseMobile = React.useCallback(() => {
    setMobileOpen(false);
  }, []);

  const NAV_LINKS = [
    { label: t.nav.services, href: localePath("/services", locale) },
    { label: t.nav.blog, href: localePath("/blog", locale) },
    { label: t.nav.about, href: localePath("/about", locale) },
    { label: t.nav.contact, href: localePath("/contact", locale) },
  ];

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when the mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href={localePath("/", locale)} aria-label="BuildCalc Pro home" className="shrink-0 rounded-lg">
          <Logo size={34} wordmarkClassName="hidden min-[400px]:inline" />
        </Link>

        <nav className="ms-3 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
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
          aria-label={t.nav.searchAriaLabel}
        >
          <Search className="h-4 w-4" aria-hidden />
          <span className="hidden xl:inline">{t.nav.searchPlaceholder}</span>
          <kbd className="hidden rounded border border-border bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[10px] text-[#5A6C85] xl:block">
            ⌘K
          </kbd>
        </button>

        <LanguageSelector />

        <Button
          asChild
          className="hidden min-h-[40px] bg-[#ED7D22] hover:bg-[#d56f1c] lg:inline-flex"
          size="sm"
        >
          <Link href={localePath("/request-tool", locale)}>{t.nav.requestTool}</Link>
        </Button>

        <CartTrigger />

        <Button
          variant="outline"
          size="iconSm"
          className="min-h-[40px] min-w-[40px] border-border text-[#14284A] hover:bg-[#F1F5F9] lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && <MobileMenu onClose={handleCloseMobile} />}
    </header>
  );
}
