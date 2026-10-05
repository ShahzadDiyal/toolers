import type { MetadataRoute } from "next";
import { CATEGORIES, TOOLS, toolHref, categoryHref } from "@/data/toolsRegistry";
import { SITE_URL } from "@/lib/site";

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
  ];
}
