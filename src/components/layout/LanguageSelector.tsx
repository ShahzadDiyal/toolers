"use client";

/**
 * BuildCalc Pro language switcher.
 *
 * Dropdown listing all 15 locales in their native scripts. Switching
 * preserves the current route: /en/tools/concrete-slab -> /ar/tools/concrete-slab.
 * The choice is saved to the NEXT_LOCALE cookie so middleware remembers it.
 */
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  locales,
  localeNames,
  isValidLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/i18n/config";
import { useTranslation } from "@/i18n/I18nProvider";

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const switchTo = (next: Locale) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    setLocaleCookie(next);
    // Preserve the current route: swap only the leading locale segment.
    const segments = (pathname ?? "/").split("/");
    if (isValidLocale(segments[1])) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    setOpen(false);
    router.push(segments.join("/") || "/");
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t.nav.language}
        title={t.nav.language}
        className={cn(
          "flex min-h-[40px] items-center gap-1.5 rounded-lg border border-input bg-white px-2.5 text-sm font-bold text-[#14284A] transition-colors hover:border-[#2563EB]",
          compact ? "min-w-[40px] justify-center" : "min-w-[40px]",
        )}
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden />
        {!compact && (
          <span className="hidden max-w-[72px] truncate md:inline">
            {localeNames[locale]}
          </span>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t.nav.language}
          className="absolute end-0 top-full z-50 mt-2 max-h-[320px] w-44 overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-[0_24px_64px_-16px_rgb(11_27_51/0.25)]"
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={l === locale}
              onClick={() => switchTo(l)}
              className={cn(
                "flex min-h-[40px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-[#F1F5F9]",
                l === locale
                  ? "font-extrabold text-[#14284A]"
                  : "font-medium text-[#5A6C85]",
              )}
            >
              <span className="truncate">{localeNames[l]}</span>
              {l === locale && (
                <Check className="h-4 w-4 shrink-0 text-[#ED7D22]" aria-hidden />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
