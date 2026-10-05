import type { MetadataRoute } from "next";
import { CATEGORIES, TOOLS, toolHref, categoryHref } from "@/data/toolsRegistry";
import { BLOG_POSTS } from "@/data/blog";
import { SITE_URL } from "@/lib/site";
import { defaultLocale, localePath } from "@/i18n/config";

// Canonicals carry the default-locale prefix: /en/tools/..., /en/categories/...
// (Next's sitemap type has no hreflang field; localized alternates are
// discovered through the <html lang> pages and middleware redirects.)

const STATIC_PAGES = [
  { path: "/blog", priority: 0.8 },
  { path: "/services", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
  { path: "/request-tool", priority: 0.7 },
  { path: "/about", priority: 0.6 },
  { path: "/terms", priority: 0.3 },
  { path: "/disclaimer", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/${defaultLocale}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}${localePath("/tools", defaultLocale)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${localePath("/categories", defaultLocale)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}${categoryHref(c.id)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...TOOLS.map((t) => ({
      url: `${SITE_URL}${toolHref(t)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: t.available ? 0.7 : 0.4,
    })),
    ...STATIC_PAGES.map((p) => ({
      url: `${SITE_URL}${localePath(p.path, defaultLocale)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...BLOG_POSTS.map((p) => ({
      url: `${SITE_URL}${localePath(`/blog/${p.slug}`, defaultLocale)}`,
      lastModified: new Date(p.date + "T12:00:00"),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
