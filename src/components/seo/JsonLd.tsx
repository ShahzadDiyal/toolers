/**
 * BuildCalc Pro — JSON-LD structured data helpers (SEO / AEO / GEO).
 *
 * Emits schema.org graphs: WebSite, SoftwareApplication, FAQPage,
 * BreadcrumbList, CollectionPage. Factual, concise markup helps search
 * engines, answer engines, and generative engines cite the tools.
 */
import { SITE_URL, SITE_NAME } from "@/lib/site";

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  const graph = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}

export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "Free contractor estimating calculators — concrete, framing, roofing, stairs, finishes, MEP and bid math. No account, no cloud.",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tools?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function appSchema(): Json {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}#app`,
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "31 free construction calculators with bill-of-materials takeoffs and a master bid cart. 100% client-side — data never leaves the device.",
  };
}

export function toolSchema(opts: {
  slug: string;
  title: string;
  description: string;
  categoryLabel: string;
}): Json {
  return {
    "@type": "SoftwareApplication",
    name: `${opts.title} — ${SITE_NAME}`,
    url: `${SITE_URL}/tools/${opts.slug}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: opts.description,
    applicationSubCategory: opts.categoryLabel,
    isPartOf: { "@id": `${SITE_URL}#app` },
  };
}

export function faqSchema(faqs: { q: string; a: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(
  items: { label: string; href?: string }[],
): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

export function collectionSchema(opts: {
  path: string;
  name: string;
  description: string;
}): Json {
  return {
    "@type": "CollectionPage",
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}#website` },
  };
}
