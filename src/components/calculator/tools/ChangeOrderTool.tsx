/**
 * BuildCalc Pro — Change Order Pricer (Batch 4H).
 *
 * Price extras right: CO price = cost × (1 + markup), with an achieved
 * margin check. Distinct from the generic markup tool — this is scoped
 * to change orders. Real-time math, auto-saved inputs, ResultsCard.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { changeOrderPrice } from "@/lib/math/finalBatch";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "change-order";

interface ChangeOrderInputs extends Record<string, unknown> {
  directCost: number;
  markupPct: number;
  targetMarginPct: number;
}

const DEFAULTS: ChangeOrderInputs = {
  directCost: 2500,
  markupPct: 30,
  targetMarginPct: 25,
};

export function ChangeOrderTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<ChangeOrderInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Change Order Pricer",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = changeOrderPrice({
    directCost: v.directCost,
    markupPct: v.markupPct,
  });
  const meetsTarget = t.marginPct >= v.targetMarginPct;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Change order price",
      net: `${formatMoney(v.directCost)} × (1 + ${formatNumber(v.markupPct)}%)`,
      waste: "—",
      order: formatMoney(t.price),
      note: `${formatMoney(t.profit)} profit`,
      highlight: true,
    },
    {
      label: "Achieved margin",
      net: `profit ÷ price`,
      waste: "—",
      order: `${formatNumber(t.marginPct)}%`,
      note: meetsTarget
        ? `meets ${formatNumber(v.targetMarginPct)}% target`
        : `below ${formatNumber(v.targetMarginPct)}% target — raise markup`,
    },
  ];

  const handleAdd = () => {
    if (!t.valid) {
      toast.error("Check your inputs", {
        description: "Direct cost must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Change Order — ${formatMoney(t.price)}`,
      category: "financial-business",
      quantity: 1,
      unit: "lot",
      unitCost: t.price,
      wastePercent: 0,
      notes: `Cost ${formatMoney(v.directCost)} + ${formatNumber(v.markupPct)}% markup · ${formatNumber(t.marginPct)}% margin.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${formatMoney(t.price)} at ${formatNumber(t.marginPct)}% margin`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <CostInput
        id="c-cost"
        label="Direct cost of extra work"
        value={v.directCost}
        onChange={(n) => set("directCost", n)}
        perUnit="$"
        hint="Labor + materials + subs for this change only."
      />
      <PresetStepper
        id="c-markup"
        label="Markup"
        value={v.markupPct}
        onChange={(n) => set("markupPct", n)}
        unit="%"
        step={1}
        min={0}
        max={200}
        presets={[
          { label: "20%", value: 20 },
          { label: "30%", value: 30 },
          { label: "50%", value: 50 },
        ]}
        hint="Change orders usually carry higher markup."
      />
      <PresetStepper
        id="c-target"
        label="Target margin"
        value={v.targetMarginPct}
        onChange={(n) => set("targetMarginPct", n)}
        unit="%"
        step={1}
        min={0}
        max={95}
        hint="Your minimum acceptable margin."
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatMoney(t.price),
        unit: "$ PRICE",
        label: "Change order price",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `Direct cost`, amount: v.directCost },
        { label: `Profit (${formatNumber(v.markupPct)}% markup)`, amount: t.profit },
      ]}
      labor={null}
      total={t.price}
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
        value: formatMoney(t.price),
        unit: "",
        label: "Change order price",
      }}
    />
  );
}
