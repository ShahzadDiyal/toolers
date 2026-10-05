/**
 * BuildCalc Pro Tool page wrapper layout.
 *
 * Provides the quick-action bar (Reset inputs · Save JSON draft ·
 * Open Master Cart) above every /tools/[slug] calculator. The page
 * itself renders its own breadcrumbs, header, calculator, and
 * content sections no sidebar.
 */
import { ToolActionBar } from "@/components/tools/ToolActionBar";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="min-w-0">
        <ToolActionBar />
        {children}
      </div>
    </div>
  );
}
