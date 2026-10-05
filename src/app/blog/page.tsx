import type { Metadata } from "next";
import { PageHero, CrumbNav } from "@/components/ui/PageHero";
import { BlogIndex } from "./BlogIndex";

export const metadata: Metadata = {
  title: "Blog — Construction Estimating Guides",
  description:
    "Practical guides to construction estimating: concrete takeoffs, masonry quantities, roof pitch math, stair layout, and contractor pricing.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Learn"
        title="Construction Estimating Guides"
        lede="Short, practical explainers grounded in the same math our calculators use — so you understand the numbers, not just the results."
      >
        <div className="mt-6">
          <CrumbNav
            items={[
              { label: "Home", href: "/" },
              { label: "Blog" },
            ]}
          />
        </div>
      </PageHero>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <BlogIndex />
      </main>
    </>
  );
}
