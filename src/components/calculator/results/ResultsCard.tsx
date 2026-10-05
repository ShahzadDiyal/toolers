/**
 * BuildCalc Pro — Universal ResultsCard (Phase 4A).
 *
 * Every calculator's results render here:
 *   Primary Metric Callout → Itemized Materials Schedule (net / waste / order)
 *   → Cost Projection (materials + labor) → Action Bar
 *   (Add to Master Estimate · Print/Export Slip · Reset Form)
 */
"use client";

import * as React from "react";
import { Check, Plus, Printer, RotateCcw, Link2 } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/utils";
import { buildShareUrl } from "@/lib/share";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface MaterialRow {
  /** e.g. "Ready-mix concrete" */
  label: string;
  /** Net quantity display, e.g. "8.89 cu yd" */
  net: string;
  /** Waste display, e.g. "+0.89 cu yd (10%)" */
  waste: string;
  /** Order quantity display, e.g. "9.78 cu yd" */
  order: string;
  /** Optional flag, e.g. "Rounded up", "Short-load risk" */
  note?: string;
  /** Highlight the order cell (primary material). */
  highlight?: boolean;
}

export interface CostLine {
  label: string;
  amount: number;
}

interface ResultsCardProps {
  /** The headline number, e.g. { value: "18.5", unit: "CU YDS", label: "Order quantity" } */
  primaryMetric: { value: string; unit: string; label: string };
  wastePercent: number;
  materials: MaterialRow[];
  /** Itemized material costs. */
  materialCosts: CostLine[];
  /** Optional labor estimate. */
  labor?: { hours: number; rate: number } | null;
  /** Grand total (materials + labor). */
  total: number;
  /** Called when "Add to Master Estimate" is pressed. */
  onAddToEstimate: () => void;
  onReset: () => void;
  addLabel?: string;
  /** When provided, a "Copy share link" button encodes these values into the URL. */
  shareValues?: Record<string, unknown>;
}

export function ResultsCard({
  primaryMetric,
  wastePercent,
  materials,
  materialCosts,
  labor,
  total,
  onAddToEstimate,
  onReset,
  addLabel = "Add to Master Estimate",
  shareValues,
}: ResultsCardProps) {
  const [added, setAdded] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleShare = async () => {
    if (!shareValues) return;
    const url = buildShareUrl(shareValues);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied", {
        description: "Anyone opening it sees this exact calculation.",
      });
    } catch {
      // Clipboard API unavailable (permissions) — show the URL to copy manually.
      toast.info("Copy this link manually", { description: url });
    }
  };

  const handleAdd = () => {
    onAddToEstimate();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2200);
  };

  const laborTotal = labor ? labor.hours * labor.rate : 0;

  return (
    <div className="print-slip overflow-hidden rounded-xl border border-border bg-zinc-950">
      {/* Primary metric callout */}
      <div className="border-b border-border bg-gradient-to-b from-accent/10 to-transparent px-5 pb-4 pt-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          {primaryMetric.label}
        </p>
        <p className="mt-1 font-mono text-5xl font-extrabold tabular-nums text-accent">
          {primaryMetric.value}
        </p>
        <p className="mt-1 font-display text-sm font-bold uppercase tracking-[0.2em] text-accent/80">
          {primaryMetric.unit}
        </p>
      </div>

      {/* Materials schedule */}
      <div className="px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Bill of materials
          <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
            +{wastePercent}% waste
          </span>
        </p>
        <div className="mt-2 overflow-hidden rounded-lg border border-zinc-800">
          <div className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <span>Material</span>
            <span className="hidden text-right sm:block">Net</span>
            <span className="hidden text-right sm:block">Waste</span>
            <span className="text-right">Order</span>
          </div>
          {materials.map((m, i) => (
            <div
              key={m.label}
              className={cn(
                "grid grid-cols-[1fr_auto] items-center gap-x-3 px-3 py-2.5",
                i % 2 === 1 && "bg-zinc-900/40",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-200">{m.label}</p>
                {m.note && (
                  <p className="text-[11px] font-semibold text-accent/90">{m.note}</p>
                )}
                <p className="mt-0.5 text-[11px] text-zinc-500 sm:hidden">
                  Net {m.net} · Waste {m.waste}
                </p>
              </div>
              <span className="hidden text-right font-mono text-xs tabular-nums text-zinc-400 sm:block">
                {m.net}
              </span>
              <span className="hidden text-right font-mono text-xs tabular-nums text-zinc-500 sm:block">
                {m.waste}
              </span>
              <span
                className={cn(
                  "text-right font-mono text-sm font-bold tabular-nums",
                  m.highlight ? "text-accent" : "text-zinc-100",
                )}
              >
                {m.order}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Cost projection */}
      <div className="px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Cost projection
        </p>
        <div className="mt-2 space-y-1.5 text-sm">
          {materialCosts.map((c) => (
            <div key={c.label} className="flex justify-between gap-3">
              <span className="text-zinc-400">{c.label}</span>
              <span className="font-mono tabular-nums text-zinc-100">
                {formatMoney(c.amount)}
              </span>
            </div>
          ))}
          {labor && labor.hours > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-zinc-400">
                Labor — {labor.hours}h × {formatMoney(labor.rate)}/h
              </span>
              <span className="font-mono tabular-nums text-zinc-100">
                {formatMoney(laborTotal)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
          <span className="font-display text-sm font-bold uppercase tracking-widest text-accent">
            Total
          </span>
          <span className="font-mono text-3xl font-extrabold tabular-nums text-accent">
            {formatMoney(total)}
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div className="no-print space-y-2 border-t border-border bg-card px-5 py-4">
        <Button
          variant="accent"
          size="lg"
          className={cn("w-full transition-all", added && "bg-green-600 hover:bg-green-600")}
          onClick={handleAdd}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added to estimate
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" /> {addLabel}
            </>
          )}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => window.print()} className="min-h-[44px]">
            <Printer className="h-4 w-4" />
            Print / Export slip
          </Button>
          {shareValues ? (
            <Button variant="outline" onClick={handleShare} className="min-h-[44px]">
              <Link2 className="h-4 w-4" />
              Copy share link
            </Button>
          ) : (
            <Button variant="ghost" onClick={onReset} className="min-h-[44px]">
              <RotateCcw className="h-4 w-4" />
              Reset form
            </Button>
          )}
        </div>
        {shareValues && (
          <Button variant="ghost" onClick={onReset} className="min-h-[44px] w-full">
            <RotateCcw className="h-4 w-4" />
            Reset form
          </Button>
        )}
        <p className="text-center text-[11px] text-zinc-600">
          Saved on this device · No account · No cloud
        </p>
      </div>
    </div>
  );
}
