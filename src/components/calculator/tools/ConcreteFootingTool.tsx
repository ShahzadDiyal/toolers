/**
 * BuildCalc Pro — Footing Concrete Estimator (Batch 4H).
 *
 * Strip footings: V = L × W × D ÷ 27 per run, times run count.
 * Real-time math, auto-saved inputs, universal ResultsCard,
 * master-estimate dispatch.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { footingTakeoff } from "@/lib/math/finalBatch";
import { roundTo, BAGS_80LB_PER_CUYD, BAGS_60LB_PER_CUYD } from "@/lib/math/units";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "concrete-footing";

interface FootingInputs extends Record<string, unknown> {
  lengthFt: number;
  widthIn: number;
  depthIn: number;
  runs: number;
  wastePercent: number;
  costPerYard: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: FootingInputs = {
  lengthFt: 40,
  widthIn: 16,
  depthIn: 8,
  runs: 1,
  wastePercent: 10,
  costPerYard: 165,
  laborHours: 0,
  laborRate: 65,
};

export function ConcreteFootingTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<FootingInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Footing Concrete Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = footingTakeoff({
    lengthFt: v.lengthFt,
    widthIn: v.widthIn,
    depthIn: v.depthIn,
    runs: v.runs,
    wastePercent: v.wastePercent,
  });
  const valid = t.netYards > 0;
  const bags80 = Math.ceil(t.grossYards * BAGS_80LB_PER_CUYD);
  const bags60 = Math.ceil(t.grossYards * BAGS_60LB_PER_CUYD);
  const materialCost = roundTo(t.grossYards * v.costPerYard, 2);
  const laborTotal = roundTo(v.laborHours * v.laborRate, 2);
  const total = roundTo(materialCost + laborTotal, 2);

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Ready-mix concrete",
      net: `${formatNumber(t.netYards)} cu yd`,
      waste: `+${formatNumber(t.wasteYards)} cu yd`,
      order: `${formatNumber(t.grossYards)} cu yd`,
      note:
        t.truckloads > 0
          ? `${t.truckloads} truckload${t.truckloads === 1 ? "" : "s"}${t.shortLoad ? " — short-load fee likely" : ""}`
          : undefined,
      highlight: true,
    },
    {
      label: "80-lb bags (alt.)",
      net: `${formatNumber(Math.round(t.netYards * BAGS_80LB_PER_CUYD))} bags`,
      waste: `+${v.wastePercent}%`,
      order: `${formatNumber(bags80)} bags`,
    },
    {
      label: "60-lb bags (alt.)",
      net: `${formatNumber(Math.round(t.netYards * BAGS_60LB_PER_CUYD))} bags`,
      waste: `+${v.wastePercent}%`,
      order: `${formatNumber(bags60)} bags`,
    },
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Footing dimensions must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Strip Footing Concrete (${v.runs} run${v.runs === 1 ? "" : "s"})`,
      category: "concrete",
      quantity: t.grossYards,
      unit: "cu yd",
      unitCost: v.costPerYard,
      wastePercent: v.wastePercent,
      notes: `Net ${formatNumber(t.netYards)} cu yd + ${v.wastePercent}% waste. ${v.lengthFt} ft × ${v.widthIn} in × ${v.depthIn} in per run.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${formatNumber(t.grossYards)} cu yd · ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="f-length"
        label="Run length"
        valueFeet={v.lengthFt}
        onChange={(f) => set("lengthFt", f)}
        minFeet={0}
        hint="Length of one footing run."
      />
      <PresetStepper
        id="f-runs"
        label="Runs"
        value={v.runs}
        onChange={(n) => set("runs", n)}
        unit="ea"
        step={1}
        min={1}
        hint="Identical footing runs."
      />
      <PresetStepper
        id="f-width"
        label="Footing width"
        value={v.widthIn}
        onChange={(n) => set("widthIn", n)}
        unit="in"
        step={1}
        min={0}
        presets={[
          { label: '12"', value: 12 },
          { label: '16"', value: 16 },
          { label: '20"', value: 20 },
          { label: '24"', value: 24 },
        ]}
      />
      <PresetStepper
        id="f-depth"
        label="Footing depth"
        value={v.depthIn}
        onChange={(n) => set("depthIn", n)}
        unit="in"
        step={1}
        min={0}
        presets={[
          { label: '8"', value: 8 },
          { label: '10"', value: 10 },
          { label: '12"', value: 12 },
        ]}
      />
      <PresetStepper
        id="f-waste"
        label="Waste factor"
        value={v.wastePercent}
        onChange={(n) => set("wastePercent", n)}
        unit="%"
        step={1}
        min={0}
        max={50}
        presets={[
          { label: "5%", value: 5 },
          { label: "10%", value: 10 },
          { label: "15%", value: 15 },
        ]}
      />
      <CostInput
        id="f-yard"
        label="Ready-mix price"
        value={v.costPerYard}
        onChange={(n) => set("costPerYard", n)}
        perUnit="$/cu yd"
      />
      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="f-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="f-rate"
            label="Labor rate"
            value={v.laborRate}
            onChange={(n) => set("laborRate", n)}
            perUnit="$/hr"
          />
        </div>
      </div>
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.grossYards),
        unit: "CU YDS",
        label: "Order quantity",
      }}
      wastePercent={v.wastePercent}
      materials={materials}
      materialCosts={[
        {
          label: `Ready-mix ${formatNumber(t.grossYards)} cu yd × ${formatMoney(v.costPerYard)}`,
          amount: materialCost,
        },
      ]}
      labor={v.laborHours > 0 ? { hours: v.laborHours, rate: v.laborRate } : null}
      total={total}
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
        value: formatNumber(t.grossYards),
        unit: "cu yd",
        label: "Order quantity",
      }}
    />
  );
}
