/**
 * BuildCalc Pro Aggregate & Stone Tonnage Calculator (Batch 4D).
 *
 * Area x thickness -> compacted cubic yards -> delivered tons for
 * gravel, crusher run, sand, and decomposed granite. Dispatches 1 line.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  aggregateTakeoff,
  AGGREGATE_MATERIALS,
  type AggregateMaterial,
} from "@/lib/math/earthwork";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "aggregate-stone-tonnage";

interface AggregateInputs extends Record<string, unknown> {
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  thicknessIn: number;
  material: AggregateMaterial;
  compactionPct: number;
  costPerTon: number;
}

const DEFAULTS: AggregateInputs = {
  areaMode: "dims",
  lengthFt: 24,
  widthFt: 12,
  netSqft: 288,
  thicknessIn: 4,
  material: "gravel57",
  compactionPct: AGGREGATE_MATERIALS.gravel57.defaultCompactionPct,
  costPerTon: 48,
};

const MATERIALS = Object.entries(AGGREGATE_MATERIALS) as [
  AggregateMaterial,
  { label: string; tonsPerCuYd: number; defaultCompactionPct: number },
][];

export function AggregateStoneTonnageTool() {
  const { values: v, set, setValues, resetToDefaults } =
    useToolAutoSave<AggregateInputs>(SLUG, DEFAULTS);
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Aggregate & Stone Tonnage Calculator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const areaSqft = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = aggregateTakeoff({
    areaSqft,
    thicknessIn: v.thicknessIn,
    material: v.material,
    compactionPct: v.compactionPct,
  });
  const valid = areaSqft > 0 && v.thicknessIn > 0;
  const mat = AGGREGATE_MATERIALS[v.material];

  const materialCost = t.tons * v.costPerTon;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: mat.label,
      net: `${formatNumber(t.looseCuYd)} cu yd loose`,
      waste: `+${v.compactionPct}%`,
      order: `${formatNumber(t.tons)} tons`,
      note: `${mat.tonsPerCuYd} tons/cu yd · ${formatNumber(t.compactedCuYd)} cu yd compacted`,
      highlight: true,
    },
    {
      label: "Coverage check",
      net: `${formatNumber(t.areaSqft)} sq ft × ${formatNumber(v.thicknessIn)}″`,
      waste: "—",
      order: `${formatNumber(t.compactedCuYd)} cu yd`,
      note: "Compacted volume what the tonnage above covers",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.tons <= 0) {
      toast.error("Check your inputs", {
        description: "Area and thickness must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Aggregate Delivery ${mat.label}`,
      category: "site-exterior",
      quantity: t.tons,
      unit: "tons",
      unitCost: v.costPerTon,
      wastePercent: 0,
      notes: `${formatNumber(t.areaSqft)} sq ft × ${formatNumber(v.thicknessIn)}″ · ${formatNumber(t.compactedCuYd)} cu yd compacted · ${v.compactionPct}% compaction allowance.`,
    });
    toast.success("1 line added to Master Bid Cart", {
      description: `${formatNumber(t.tons)} tons · ${formatMoney(materialCost)} delivered`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["L × W dims", "Total sq ft"]}
          active={v.areaMode === "dims" ? "L × W dims" : "Total sq ft"}
          onChange={(l) => set("areaMode", l === "L × W dims" ? "dims" : "sqft")}
        />
      </div>

      {v.areaMode === "dims" ? (
        <>
          <DimensionInput
            id="ag-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="ag-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="ag-sqft"
          label="Total area"
          value={v.netSqft}
          onChange={(n) => set("netSqft", n)}
          unit="sq ft"
          step={10}
          min={0}
        />
      )}

      <PresetStepper
        id="ag-thick"
        label="Layer thickness"
        value={v.thicknessIn}
        onChange={(n) => set("thicknessIn", n)}
        unit="in"
        step={1}
        min={0}
        max={36}
        presets={[
          { label: '2"', value: 2 },
          { label: '4"', value: 4 },
          { label: '6"', value: 6 },
          { label: '8"', value: 8 },
        ]}
      />
      <PresetStepper
        id="ag-comp"
        label="Compaction allowance"
        value={v.compactionPct}
        onChange={(n) => set("compactionPct", n)}
        unit="%"
        step={1}
        min={0}
        max={40}
        presets={[
          { label: "10% gravel", value: 10 },
          { label: "15% base", value: 15 },
          { label: "20% fines", value: 20 },
        ]}
      />

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Material
          <span className="ml-2 font-mono normal-case tracking-normal text-accent">
            {mat.tonsPerCuYd} tons/cu yd
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Aggregate material">
          {MATERIALS.map(([key, m]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setValues({ material: key, compactionPct: m.defaultCompactionPct })
              }
              aria-pressed={v.material === key}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.material === key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <CostInput
        id="ag-costton"
        label="Delivered price"
        value={v.costPerTon}
        onChange={(n) => set("costPerTon", n)}
        perUnit="$/ton"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.tons),
        unit: "TONS",
        label: "Aggregate to order",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `${mat.label} ${formatNumber(t.tons)} × ${formatMoney(v.costPerTon)}/ton`, amount: Math.round(materialCost * 100) / 100 },
      ]}
      total={Math.round(materialCost * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add aggregate line to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.tons),
        unit: "tons",
        label: `Total · ${formatMoney(Math.round(materialCost * 100) / 100)}`,
      }}
    />
  );
}
