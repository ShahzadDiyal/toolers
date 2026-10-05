/**
 * BuildCalc Pro dictionary loader (server-side).
 *
 * Explicit per-locale dynamic imports keep every language chunk-split:
 * only the active locale's JSON is ever sent to the client.
 */
import type { Locale } from "./config";
import type { Dictionary } from "./I18nProvider";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/locales/en.json").then((m) => m.default),
  ar: () => import("@/locales/ar.json").then((m) => m.default),
  es: () => import("@/locales/es.json").then((m) => m.default),
  fr: () => import("@/locales/fr.json").then((m) => m.default),
  de: () => import("@/locales/de.json").then((m) => m.default),
  it: () => import("@/locales/it.json").then((m) => m.default),
  pt: () => import("@/locales/pt.json").then((m) => m.default),
  tr: () => import("@/locales/tr.json").then((m) => m.default),
  nl: () => import("@/locales/nl.json").then((m) => m.default),
  pl: () => import("@/locales/pl.json").then((m) => m.default),
  ro: () => import("@/locales/ro.json").then((m) => m.default),
  ru: () => import("@/locales/ru.json").then((m) => m.default),
  hi: () => import("@/locales/hi.json").then((m) => m.default),
  ur: () => import("@/locales/ur.json").then((m) => m.default),
  fa: () => import("@/locales/fa.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
