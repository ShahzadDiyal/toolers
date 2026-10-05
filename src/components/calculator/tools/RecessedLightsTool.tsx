/**
 * BuildCalc Pro — Recessed Light Layout (Batch 4H).
 *
 * Even fixture grid: cols = round(L ÷ spacing), rows = round(W ÷ spacing).
 * Real-time math, auto-saved inputs, universal ResultsCard,
 * master-estimate dispatch.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { recessedLightLayout } from "@/lib/math/finalBatch";
import { roundTo } from "@/lib/math/units";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "recessed-lights";

interface RecessedInputs extends Record<string, unknown> {
  roomLengthFt: number;
  roomWidthFt: number;
  spacingFt: number;
  fixtureCost: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: RecessedInputs = {
  roomLengthFt: 16,
  roomWidthFt: 12,
  spacingFt: 5,
  fixtureCost: 28,
  laborHours: 0,
  laborRate: 65,
};

export function RecessedLightsTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<RecessedInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Recessed Light Layout",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = recessedLightLayout({
    roomLengthFt: v.roomLengthFt,
    roomWidthFt: v.roomWidthFt,
    spacingFt: v.spacingFt,
  });
  const valid = t.fixtures > 0;
  const materialCost = roundTo(t.fixtures * v.fixtureCost, 2);
  const laborTotal = roundTo(v.laborHours * v.laborRate, 2);
  const total = roundTo(materialCost + laborTotal, 2);

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Recessed fixtures",
      net: `${t.cols} cols × ${t.rows} rows`,
      waste: "—",
      order: `${formatNumber(t.fixtures)} fixtures`,
      note: `${formatNumber(t.actualSpacingL)} ft × ${formatNumber(t.actualSpacingW)} ft actual grid`,
      highlight: true,
    },
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Room dimensions must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Recessed Lights — ${t.cols}×${t.rows} grid (${t.fixtures} fixtures)`,
      category: "mep",
      quantity: t.fixtures,
      unit: "fixtures",
      unitCost: v.fixtureCost,
      wastePercent: 0,
      notes: `${v.roomLengthFt}×${v.roomWidthFt} ft room · ${formatNumber(t.edgeOffsetFt)} ft from walls.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${t.fixtures} fixtures · ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="r-length"
        label="Room length"
        valueFeet={v.roomLengthFt}
        onChange={(f) => set("roomLengthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="r-width"
        label="Room width"
        valueFeet={v.roomWidthFt}
        onChange={(f) => set("roomWidthFt", f)}
        minFeet={0}
      />
      <PresetStepper
        id="r-spacing"
        label="Target spacing"
        value={v.spacingFt}
        onChange={(n) => set("spacingFt", n)}
        unit="ft"
        step={0.5}
        min={2}
        max={12}
        presets={[
          { label: "4'", value: 4 },
          { label: "5'", value: 5 },
          { label: "6'", value: 6 },
        ]}
        hint="Rule of thumb: half the ceiling height."
      />
      <CostInput
        id="r-fixture"
        label="Fixture price"
        value={v.fixtureCost}
        onChange={(n) => set("fixtureCost", n)}
        perUnit="$/fixture"
        hint="Can, trim, and bulb."
      />
      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="r-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="r-rate"
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
        value: formatNumber(t.fixtures),
        unit: "FIXTURES",
        label: "Fixture count",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        {
          label: `${t.fixtures} fixtures × ${formatMoney(v.fixtureCost)}`,
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
        value: formatNumber(t.fixtures),
        unit: "fixtures",
        label: "Fixture count",
      }}
    />
  );
}
