import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Nothing to Track",
  description:
    "BuildCalc Pro has no database, no accounts, and no analytics servers. Your estimates live only in your browser.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-600/15 border border-green-600/30">
          <ShieldCheck className="h-5 w-5 text-green-500" />
        </span>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide">
          Privacy: <span className="text-green-500">nothing to track</span>
        </h1>
      </div>

      <div className="mt-8 space-y-5 text-zinc-400 leading-relaxed">
        <p>
          BuildCalc Pro is a <strong className="text-zinc-200">zero-database</strong> application.
          There is no server that stores your estimates, no user accounts, and no login
          that could leak.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-zinc-200">Your estimates live in your browser&apos;s local storage</strong> —
            on your device, under your control. Clear your browser data and they&apos;re gone.
          </li>
          <li>
            <strong className="text-zinc-200">Calculations happen client-side.</strong> Dimensions you
            type are never sent anywhere; there is no API to receive them.
          </li>
          <li>
            <strong className="text-zinc-200">Export is a file you own.</strong> The JSON export
            downloads to your device. Share it, back it up, or delete it your call.
          </li>
          <li>
            <strong className="text-zinc-200">No advertising trackers</strong> are embedded in
            the calculator pages.
          </li>
        </ul>
        <p>
          The only network requests the app makes are the ones your browser needs to load
          the page itself (and font files, if enabled). If you want your estimate on
          another device, use Export → Import. That&apos;s the entire data model.
        </p>
      </div>
    </div>
  );
}
