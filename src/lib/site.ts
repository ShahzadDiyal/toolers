/**
 * BuildCalc Pro — canonical site URL configuration.
 *
 * Set NEXT_PUBLIC_SITE_URL at deploy time (e.g. https://calc.example.com).
 * Until then, sitemap/robots/canonical fall back to the placeholder below —
 * tell Boni your real domain and it gets swapped in one place.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://buildcalc.pro"
).replace(/\/$/, "");

export const SITE_NAME = "BuildCalc Pro";
export const SITE_TAGLINE =
  "Free contractor estimating calculators — concrete, framing, roofing, finishes, MEP & bid math.";
