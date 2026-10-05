/**
 * BuildCalc Pro locale middleware (Edge).
 *
 * - Paths already carrying a valid locale (/ar/tools/...) pass through.
 * - Everything else redirects to /{preferredLocale}{pathname}, preserving
 *   query strings. Old unlocalized bookmarks keep working.
 * - Preferred locale: NEXT_LOCALE cookie -> Accept-Language -> "en".
 * - Static assets, API routes, and SEO files bypass untouched.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isValidLocale,
  matchLocale,
  LOCALE_COOKIE,
} from "./i18n/config";

function preferredLocale(request: NextRequest) {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isValidLocale(cookie)) return cookie;
  return matchLocale(request.headers.get("accept-language"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already localized? Ensure the preference cookie exists, then continue.
  const first = pathname.split("/")[1];
  if (isValidLocale(first)) {
    const res = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== first) {
      res.cookies.set(LOCALE_COOKIE, first, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return res;
  }

  // Redirect to the preferred locale, keeping the rest of the URL intact.
  const locale = preferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: [
    // Skip API, Next internals, and files served from /public or SEO routes.
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|llms.txt|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
};
