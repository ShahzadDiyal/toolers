import type { Metadata } from "next";
import { NotFoundRedirect } from "@/components/seo/NotFoundRedirect";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for does not exist. Browse BuildCalc Pro's free contractor estimating calculators instead.",
  robots: { index: false, follow: false },
};

/**
 * Smart 404: attempts to redirect the visitor to the closest matching
 * calculator / category / guide instead of showing a dead end.
 */
export default function NotFound() {
  return <NotFoundRedirect />;
}
