/**
 * BuildCalc Pro — Calculation card shell.
 *
 * Every calculator on the platform renders inside this shell so results are
 * always presented the same way on a dusty job-site screen:
 *
 *   NET QUANTITY  →  WASTE ALLOWANCE  →  ORDER QUANTITY  →  BILL OF MATERIALS
 *   →  UNIT COST  →  ESTIMATED TOTAL  →  [ADD TO MASTER ESTIMATE]
 */
"use client";

import * as React from "react";
import { Plus, Sigma } from "lucide-react";
import { toast } from "sonner";
import type { ToolMetadata } from "@/types/estimator";
import { toolIcon } from "@/lib/tool-icons";
import { formatMoney } from "@/lib/utils";
import { roundTo } from "@/lib/math/units";
import { useEstimateStore, type NewLineItem } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { NumericInput } from "@/components/calculators/NumericInput";
import { cn } from "@/lib/utils";

export interface ResultRow {
  label: string;
  value: string;
  unit?: string;
}

export interface BomRow {
  item: string;
  qty: string;
  unit: string;
}

/** Standard waste presets offered on every calculator (default 10). */
export const WASTE_PRESETS = [0, 5, 10, 12, 15, 20];

interface CalculationCardProps {
  tool: ToolMetadata;
  /** Input controls rendered in the left column. */
  children: React.ReactNode;
  /** Raw net quantities (before waste). */
  net: ResultRow[];
  /** Waste percent — controlled by the card's slider + chips. */
  wastePercent: number;
  onWastePercentChange: (pct: number) => void;
  /** Order quantities (waste included), highlighted in amber. */
  gross: ResultRow[];
  /** Bill of materials rows. */
  bom: BomRow[];
  /** Unit-cost label + editable unit cost. */
  unitCostLabel: string;
  unitCost: number;
  onUnitCostChange: (cost: number) => void;
  /** Big readout: order quantity × unit cost. */
  estimatedTotal: number;
  /**
   * Build the EstimateLineItem for "Add to Master Estimate".
   * Return null when inputs are invalid (card shows an error toast).
   */
  buildLineItem: () => NewLineItem | null;
}

function ReadoutRow({
  row,
  tone = "zinc",
}: {
  row: ResultRow;
  tone?: "zinc" | "amber" | "orange";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span
        className={cn(
          "text-sm",
          tone === "zinc" && "text-zinc-400",
          tone === "amber" && "font-semibold text-amber-300",
          tone === "orange" && "font-bold text-orange-400",
        )}
      >
        {row.label}
      </span>
      <span
        className={cn(
          "font-mono font-bold tabular-nums text-right",
          tone === "zinc" && "text-zinc-100 text-base",
          tone === "amber" && "text-amber-300 text-lg",
          tone === "orange" && "text-orange-400 text-lg",
        )}
      >
        {row.value}
        {row.unit && (
          <span className="ml-1 text-xs font-semibold text-zinc-500">
            {row.unit}
          </span>
        )}
      </span>
    </div>
  );
}

export function CalculationCard({
  tool,
  children,
  net,
  wastePercent,
  onWastePercentChange,
  gross,
  bom,
  unitCostLabel,
  unitCost,
  onUnitCostChange,
  estimatedTotal,
  buildLineItem,
}: CalculationCardProps) {
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);
  const Icon = toolIcon(tool.iconName);

  const handleAdd = () => {
    const item = buildLineItem();
    if (!item) {
      toast.error("Check your inputs", {
        description: "One or more dimensions are missing or invalid.",
      });
      return;
    }
    // totalCost is optional on the builder payload — resolve it once here so
    // the toast and the store agree on the exact number.
    const line: NewLineItem = {
      ...item,
      totalCost: item.totalCost ?? roundTo(item.quantity * item.unitCost, 2),
    };
    addItem(line);
    toast.success("Added to Master Bid Cart", {
      description: `${line.title} — ${formatMoney(line.totalCost ?? 0)}`,
      action: {
        label: "View cart",
        onClick: () => setDrawerOpen(true),
      },
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-zinc-950/60">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle>{tool.title}</CardTitle>
            <CardDescription className="mt-1.5">
              {tool.shortDescription}
            </CardDescription>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            <Sigma className="h-3 w-3" />
            {tool.formulaSummary}
          </Badge>
          <Badge variant="success">100% client-side</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_400px]">
          {/* -------- Inputs -------- */}
          <div className="p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
          </div>

          {/* -------- Summary & Bill of Materials -------- */}
          <aside
            className="border-t border-border bg-zinc-950 p-5 sm:p-6 lg:border-l lg:border-t-0"
            aria-label="Summary and bill of materials"
          >
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-zinc-300">
              Summary &amp; Bill of Materials
            </h3>

            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                Net quantity
              </p>
              <div className="mt-1 divide-y divide-zinc-900">
                {net.map((r) => (
                  <ReadoutRow key={r.label} row={r} />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Waste allowance
                </p>
                <span className="font-mono text-sm font-bold text-amber-300">
                  {wastePercent}%
                </span>
              </div>
              <Slider
                value={[wastePercent]}
                onValueChange={([v]) => onWastePercentChange(v ?? 0)}
                min={0}
                max={30}
                step={1}
                className="mt-3"
                aria-label="Waste allowance percent"
              />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {WASTE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onWastePercentChange(p)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 font-mono text-xs font-bold transition-colors",
                      wastePercent === p
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-primary hover:text-primary",
                    )}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/80">
                Order quantity (with waste)
              </p>
              <div className="mt-1 divide-y divide-amber-500/10">
                {gross.map((r) => (
                  <ReadoutRow key={r.label} row={r} tone="amber" />
                ))}
              </div>
            </div>

            {bom.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Bill of materials
                </p>
                <div className="mt-1.5 overflow-hidden rounded-lg border border-zinc-800">
                  {bom.map((b, i) => (
                    <div
                      key={b.item}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-2 text-sm",
                        i % 2 === 1 && "bg-zinc-900/60",
                      )}
                    >
                      <span className="text-zinc-300">{b.item}</span>
                      <span className="font-mono font-bold text-zinc-100 tabular-nums">
                        {b.qty}
                        <span className="ml-1 text-xs font-semibold text-zinc-500">
                          {b.unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <NumericInput
              id={`${tool.slug}-unit-cost`}
              label={unitCostLabel}
              value={unitCost}
              onChange={onUnitCostChange}
              unit="$"
              step={1}
              min={0}
              hint="Your local supplier rate. Stored with the estimate line."
            />

            <div className="mt-4 rounded-lg bg-accent/10 border border-accent/30 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-300/90">
                Estimated total
              </p>
              <p className="mt-1 font-mono text-3xl font-extrabold text-orange-400 tabular-nums">
                {formatMoney(estimatedTotal)}
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="mt-4 w-full"
              onClick={handleAdd}
            >
              <Plus className="h-5 w-5" />
              Add to Master Estimate
            </Button>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Saved on this device · No account · No cloud
            </p>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}
