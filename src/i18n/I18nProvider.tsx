"use client";

/**
 * BuildCalc Pro i18n React context.
 *
 * The [locale] layout loads the dictionary server-side and provides it here.
 * Client components read strings via useTranslation(). The Dictionary type is
 * derived from en.json, so every locale file must keep the exact same shape.
 */
import * as React from "react";
import type { Locale } from "./config";

export type Dictionary = typeof import("@/locales/en.json");

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({ locale, t: dictionary }),
    [locale, dictionary],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx)
    throw new Error("useTranslation must be used within <I18nProvider>");
  return ctx;
}
