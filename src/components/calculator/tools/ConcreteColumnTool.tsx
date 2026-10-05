/**
 * BuildCalc Pro — Sonotube & Pier Calculator (Batch 4H).
 *
 * Round piers: V = π r² h ÷ 27 per pier, times pier count.
 * Real-time math, auto-saved inputs, universal ResultsCard,
 * master-estimate dispatch.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { pierTakeoff } from "@/lib/math/finalBatch";
import { roundTo, BAGS_80LB_PER_CUYD, BAGS_60LB_PER_CUYD } from "@/lib/math/units";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "concrete-column";

interface PierInputs extends Record<string, unknown> {
  diameterIn: number;
  depthFt: number;
  pierCount: number;
  wastePercent: number;
  costPerYard: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: PierInputs = {
  diameterIn: 12,
  depthFt: 4,
  pierCount: 6,
  wastePercent: 10,
  costPerYard: 165,
  laborHours: 0,
  laborRate: 65,
};

export function ConcreteColumnTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<PierInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Sonotube & Pier Calculator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = pierTakeoff({
    diameterIn: v.diameterIn,
    depthFt: v.depthFt,
    pierCount: v.pierCount,
    wastePercent: v.wastePercent,
  });
  const valid = t.netYards > 0;
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
      note: `${formatNumber(t.cuFtPerPier)} cu ft per pier`,
      highlight: true,
    },
    {
      label: "80-lb bags (alt.)",
      net: `${formatNumber(Math.round(t.netYards * BAGS_80LB_PER_CUYD))} bags`,
      waste: `+${v.wastePercent}%`,
      order: `${formatNumber(t.bags80)} bags`,
      note: `≈ ${formatNumber(t.bagsPerPier)} bags per pier`,
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
        description: "Pier dimensions must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Sonotube Piers (${v.pierCount} × ${v.diameterIn}" dia)`,
      category: "concrete",
      quantity: t.grossYards,
      unit: "cu yd",
      unitCost: v.costPerYard,
      wastePercent: v.wastePercent,
      notes: `Net ${formatNumber(t.netYards)} cu yd + ${v.wastePercent}% waste. ${v.depthFt} ft deep per pier.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${formatNumber(t.grossYards)} cu yd · ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <PresetStepper
        id="p-dia"
        label="Tube diameter"
        value={v.diameterIn}
        onChange={(n) => set("diameterIn", n)}
        unit="in"
        step={1}
        min={0}
        presets={[
          { label: '8"', value: 8 },
          { label: '10"', value: 10 },
          { label: '12"', value: 12 },
          { label: '18"', value: 18 },
        ]}
        hint="Standard Sonotube sizes."
      />
      <PresetStepper
        id="p-depth"
        label="Pier depth"
        value={v.depthFt}
        onChange={(n) => set("depthFt", n)}
        unit="ft"
        step={0.5}
        min={0}
        hint="Below frost line + above grade."
      />
      <PresetStepper
        id="p-count"
        label="Pier count"
        value={v.pierCount}
        onChange={(n) => set("pierCount", n)}
        unit="ea"
        step={1}
        min={1}
      />
      <PresetStepper
        id="p-waste"
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
        id="p-yard"
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
            id="p-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="p-rate"
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
