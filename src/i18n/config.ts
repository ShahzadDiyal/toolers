/**
 * BuildCalc Pro i18n configuration.
 *
 * 15 locales, sub-path routing (/{locale}/...). Edge-safe: this module must
 * stay free of Node APIs and React so middleware can import it.
 */

export const locales = [
  "en",
  "ar",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "tr",
  "nl",
  "pl",
  "ro",
  "ru",
  "hi",
  "ur",
  "fa",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Right-to-left locales. Everything else is LTR. */
export const rtlLocales: readonly Locale[] = ["ar", "ur", "fa"];

export function isRtlLocale(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

/** Display name of each language in its own native script. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  tr: "Türkçe",
  nl: "Nederlands",
  pl: "Polski",
  ro: "Română",
  ru: "Русский",
  hi: "हिन्दी",
  ur: "اردو",
  fa: "فارسی",
};

/** Cookie that remembers the visitor's language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Prefix a root-absolute path with a locale: ("/tools", "ar") -> "/ar/tools".
 * Pass-through for already-localized paths and external URLs.
 */
export function localePath(path: string, locale: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const first = path.split("/")[1];
  if (isValidLocale(first)) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

/** Best-effort match of an Accept-Language header against supported locales. */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const prefs = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of prefs) {
    if (tag === "*") break;
    // Exact match first: "pt-br" -> "pt-br" (unsupported) then base "pt".
    if (isValidLocale(tag)) return tag;
    const base = tag.split("-")[0];
    if (isValidLocale(base)) return base;
  }
  return defaultLocale;
}
