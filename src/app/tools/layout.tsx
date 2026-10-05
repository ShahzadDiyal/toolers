import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Calculators",
  description:
    "Browse every BuildCalc Pro calculator: concrete, framing, roofing, stairs, rebar, tile, paint, flooring, electrical and bid math. Free, no account.",
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: {
    title: "All Calculators · BuildCalc Pro",
    description:
      "Every construction calculator in one directory — free, offline-capable, no account.",
    url: `${SITE_URL}/tools`,
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
