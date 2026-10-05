/**
 * BuildCalc Pro Contractor Markup vs. Margin (Phase 4C).
 *
 * The pricing sanity check: margin ≠ markup. Live bid price, equivalent
 * conversions, overhead recovery, and net true profit. One click applies
 * the markup to the Master Bid session (estimate store markup %).
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { bidFromMargin, bidFromMarkup } from "@/lib/math/financial";
import { formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";
import { cn } from "@/lib/utils";

const SLUG = "contractor-markup-margin";

interface FinanceInputs extends Record<string, unknown> {
  materials: number;
  labor: number;
  subs: number;
  equipment: number;
  mode: "margin" | "markup";
  targetPct: number;
  overheadPct: number;
}

const DEFAULTS: FinanceInputs = {
  materials: 8500,
  labor: 6200,
  subs: 3000,
  equipment: 900,
  mode: "margin",
  targetPct: 25,
  overheadPct: 10,
};

/** Interactive slider + numeric stepper for the target percentage. */
function TargetPercent({
  value,
  onChange,
  mode,
}: {
  value: number;
  onChange: (v: number) => void;
  mode: "margin" | "markup";
}) {
  return (
    <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Target {mode === "margin" ? "profit margin" : "markup"}
        </p>
        <p className="font-mono text-2xl font-extrabold text-accent">
          {value}%
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={80}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full accent-accent"
        aria-label={`Target ${mode} percent`}
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-600">
        <span>0%</span>
        <span>20%</span>
        <span>40%</span>
        <span>60%</span>
        <span>80%</span>
      </div>
      <div className="mt-3">
        <PresetStepper
          id="fin-target"
          label="Exact percentage"
          value={value}
          onChange={onChange}
          unit="%"
          step={0.5}
          min={0}
          max={80}
          presets={[
            { label: "15%", value: 15 },
            { label: "20%", value: 20 },
            { label: "25%", value: 25 },
            { label: "30%", value: 30 },
          ]}
        />
      </div>
    </div>
  );
}

/** Side-by-side markup vs margin visual meter. */
function MarkupMarginMeter({
  markup,
  margin,
}: {
  markup: number;
  margin: number;
}) {
  const max = Math.max(markup, margin, 1);
  const gap = Math.abs(markup - margin);
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        Markup vs. margin the gap
      </p>
      <div className="mt-3 space-y-3">
        {[
          { label: "Your markup", pct: markup, bar: "bg-accent" },
          { label: "Actual margin", pct: margin, bar: "bg-sky-500" },
        ].map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-zinc-300">{r.label}</span>
              <span className="font-mono font-bold text-zinc-100">
                {r.pct.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={cn("h-full rounded-full transition-all", r.bar)}
                style={{ width: `${Math.min(100, (r.pct / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {gap >= 1 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          A {markup.toFixed(0)}% markup is only a {margin.toFixed(1)}% margin —
          {gap.toFixed(1)} points of profit you thought you had.
        </p>
      )}
    </div>
  );
}

export function ContractorMarkupMarginTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<FinanceInputs>(
    SLUG,
    DEFAULTS,
  );
  const setMarkup = useEstimateStore((s) => s.setMarkup);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Markup vs. Margin",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const inputs = {
    materials: v.materials,
    labor: v.labor,
    subs: v.subs,
    equipment: v.equipment,
    overheadPct: v.overheadPct,
  };
  const b =
    v.mode === "margin"
      ? bidFromMargin(inputs, v.targetPct)
      : bidFromMarkup(inputs, v.targetPct);
  const valid = b.directCost > 0;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    { label: "Materials", net: "—", waste: "—", order: formatMoney(v.materials) },
    { label: "Labor", net: "—", waste: "—", order: formatMoney(v.labor) },
    { label: "Subcontractors", net: "—", waste: "—", order: formatMoney(v.subs) },
    {
      label: "Equipment / permits",
      net: "—",
      waste: "—",
      order: formatMoney(v.equipment),
    },
    {
      label: "Total direct cost",
      net: "—",
      waste: "—",
      order: formatMoney(b.directCost),
      highlight: true,
    },
  ];

  const handleApply = () => {
    if (!valid) {
      toast.error("Enter your job costs first", {
        description: "Direct costs must be greater than zero.",
      });
      return;
    }
    // The estimate store prices markup-on-cost: apply the equivalent markup.
    setMarkup(b.equivalentMarkup);
    toast.success("Markup applied to Master Bid", {
      description: `${b.equivalentMarkup.toFixed(1)}% markup (= ${b.equivalentMargin.toFixed(1)}% margin) now prices your bid cart.`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  const formInputs = (
    <>
      <CostInput
        id="fin-mat"
        label="Materials cost"
        value={v.materials}
        onChange={(n) => set("materials", n)}
      />
      <CostInput
        id="fin-labor"
        label="Labor cost"
        value={v.labor}
        onChange={(n) => set("labor", n)}
      />
      <CostInput
        id="fin-subs"
        label="Subcontractor cost"
        value={v.subs}
        onChange={(n) => set("subs", n)}
      />
      <CostInput
        id="fin-equip"
        label="Equipment / permits"
        value={v.equipment}
        onChange={(n) => set("equipment", n)}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Target profit margin", "Target markup"]}
          active={v.mode === "margin" ? "Target profit margin" : "Target markup"}
          onChange={(l) => set("mode", l === "Target profit margin" ? "margin" : "markup")}
        />
      </div>

      <TargetPercent
        value={v.targetPct}
        onChange={(n) => set("targetPct", n)}
        mode={v.mode}
      />

      <PresetStepper
        id="fin-oh"
        label="Overhead allocation"
        value={v.overheadPct}
        onChange={(n) => set("overheadPct", n)}
        unit="%"
        step={1}
        min={0}
        max={60}
        hint="Share of company overhead this job must carry."
      />
    </>
  );

  const results = (
    <div className="space-y-4">
      <MarkupMarginMeter markup={b.equivalentMarkup} margin={b.equivalentMargin} />
      <ResultsCard
        primaryMetric={{
          value: formatMoney(b.bidPrice),
          unit: "BID PRICE",
          label: `At ${v.targetPct}% ${v.mode}`,
        }}
        wastePercent={0}
        materials={materials}
        materialCosts={[
          {
            label: `Gross profit (${b.equivalentMargin.toFixed(1)}% margin)`,
            amount: b.grossProfit,
          },
          {
            label: `Less: overhead recovery (${v.overheadPct}%)`,
            amount: -b.overheadRecovery,
          },
        ]}
        total={b.netProfit}
        onAddToEstimate={handleApply}
        onReset={resetToDefaults}
      shareValues={v}
        addLabel="Apply markup to Master Bid"
      />
      <p className="-mt-1 px-1 text-[11px] text-zinc-600">
        “Total” above is your net true profit after overhead the number that
        actually hits the bottom line.
      </p>
    </div>
  );

  return (
    <ToolShell
      inputs={formInputs}
      results={results}
      summary={{
        value: formatMoney(b.bidPrice),
        unit: "bid",
        label: `Net profit ${formatMoney(b.netProfit)}`,
      }}
    />
  );
}
