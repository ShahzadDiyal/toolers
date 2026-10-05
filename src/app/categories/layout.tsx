import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Browse by Trade",
  description:
    "Seven trade hubs of free construction calculators: concrete, framing & roofing, finishes, site work, MEP, business math and field converters.",
  alternates: { canonical: `${SITE_URL}/categories` },
  openGraph: {
    title: "Browse by Trade · BuildCalc Pro",
    description:
      "Seven trade hubs of free construction calculators jump straight to any tool.",
    url: `${SITE_URL}/categories`,
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
