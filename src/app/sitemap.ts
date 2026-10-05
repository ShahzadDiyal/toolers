import type { MetadataRoute } from "next";
import { CATEGORIES, TOOLS, toolHref, categoryHref } from "@/data/toolsRegistry";
import { BLOG_POSTS } from "@/data/blog";
import { SITE_URL } from "@/lib/site";

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
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
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
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...BLOG_POSTS.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.date + "T12:00:00"),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
