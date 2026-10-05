/**
 * BuildCalc Pro — Business Break-Even Calculator (Batch 4H).
 *
 * Revenue break-even: BE = fixed costs ÷ gross margin %. Distinct from
 * the jobsite tool (daily overhead rate) — this is monthly/annual revenue
 * planning. Real-time math, auto-saved inputs, universal ResultsCard.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { businessBreakeven } from "@/lib/math/finalBatch";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "break-even";

interface BreakEvenInputs extends Record<string, unknown> {
  monthlyFixedCosts: number;
  grossMarginPct: number;
  avgJobValue: number;
}

const DEFAULTS: BreakEvenInputs = {
  monthlyFixedCosts: 12000,
  grossMarginPct: 35,
  avgJobValue: 8500,
};

export function BreakEvenTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<BreakEvenInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Business Break-Even Calculator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = businessBreakeven({
    monthlyFixedCosts: v.monthlyFixedCosts,
    grossMarginPct: v.grossMarginPct,
    avgJobValue: v.avgJobValue,
  });

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Monthly break-even revenue",
      net: `${formatMoney(v.monthlyFixedCosts)} ÷ ${formatNumber(v.grossMarginPct)}% margin`,
      waste: "—",
      order: formatMoney(t.monthlyBreakeven),
      note: "zero-profit floor",
      highlight: true,
    },
    {
      label: "Annual break-even revenue",
      net: "monthly × 12",
      waste: "—",
      order: formatMoney(t.annualBreakeven),
    },
    {
      label: "Jobs needed",
      net: `at ${formatMoney(v.avgJobValue)} avg job`,
      waste: "—",
      order: `${formatNumber(t.jobsPerMonth)}/mo`,
      note: `${formatNumber(t.jobsPerYear)} per year`,
    },
  ];

  const handleAdd = () => {
    if (!t.valid) {
      toast.error("Check your inputs", {
        description: "Fixed costs and margin must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Monthly Break-Even Revenue Target`,
      category: "financial-business",
      quantity: 1,
      unit: "mo",
      unitCost: t.monthlyBreakeven,
      wastePercent: 0,
      notes: `${formatMoney(t.monthlyBreakeven)}/mo at ${formatNumber(v.grossMarginPct)}% margin · ${formatNumber(t.jobsPerMonth)} jobs/mo at ${formatMoney(v.avgJobValue)} avg.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${formatMoney(t.monthlyBreakeven)}/mo target`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <CostInput
        id="b-fixed"
        label="Monthly fixed costs"
        value={v.monthlyFixedCosts}
        onChange={(n) => set("monthlyFixedCosts", n)}
        perUnit="$/mo"
        hint="Rent, insurance, salaries, trucks, office — everything that doesn't move with job volume."
      />
      <PresetStepper
        id="b-margin"
        label="Gross margin"
        value={v.grossMarginPct}
        onChange={(n) => set("grossMarginPct", n)}
        unit="%"
        step={1}
        min={1}
        max={95}
        presets={[
          { label: "25%", value: 25 },
          { label: "35%", value: 35 },
          { label: "50%", value: 50 },
        ]}
        hint="Gross profit ÷ revenue, as a percent."
      />
      <CostInput
        id="b-job"
        label="Average job value"
        value={v.avgJobValue}
        onChange={(n) => set("avgJobValue", n)}
        perUnit="$/job"
        hint="Your typical contract size."
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatMoney(t.monthlyBreakeven),
        unit: "$ / MO",
        label: "Break-even revenue",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[]}
      labor={null}
      total={t.monthlyBreakeven}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatMoney(t.monthlyBreakeven),
        unit: "/mo",
        label: "Break-even revenue",
      }}
    />
  );
}
