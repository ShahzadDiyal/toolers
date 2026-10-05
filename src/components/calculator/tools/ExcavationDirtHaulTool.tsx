/**
 * BuildCalc Pro — Trench, Excavation & Dirt Haul (Batch 4D).
 *
 * Bank vs. loose (swell) cubic yards and heaped dump-truck loads.
 * Dispatches 2 lines: machine dig + hauling/disposal.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  excavationTakeoff,
  SOIL_SWELL,
  type SoilType,
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

const SLUG = "excavation-dirt-haul";

interface ExcavationInputs extends Record<string, unknown> {
  lengthFt: number;
  widthFt: number;
  depthFt: number;
  soilType: SoilType;
  truckCapacityYd: number;
  digRatePerYd: number;
  haulFeePerLoad: number;
}

const DEFAULTS: ExcavationInputs = {
  lengthFt: 60,
  widthFt: 2,
  depthFt: 3,
  soilType: "common",
  truckCapacityYd: 10,
  digRatePerYd: 14,
  haulFeePerLoad: 350,
};

const TRUCKS = [
  { label: "10-yd tandem", value: 10 },
  { label: "14-yd tri-axle", value: 14 },
  { label: "18-yd end dump", value: 18 },
];

export function ExcavationDirtHaulTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<ExcavationInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Trench, Excavation & Dirt Haul",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = excavationTakeoff({
    lengthFt: v.lengthFt,
    widthFt: v.widthFt,
    depthFt: v.depthFt,
    soilType: v.soilType,
    truckCapacityYd: v.truckCapacityYd,
  });
  const valid = v.lengthFt > 0 && v.widthFt > 0 && v.depthFt > 0;

  const digCost = t.bankCuYd * v.digRatePerYd;
  const haulCost = t.truckLoads * v.haulFeePerLoad;
  const total = digCost + haulCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Bank volume (in-situ)",
      net: `${formatNumber(t.bankCuYd)} cu yd`,
      waste: "—",
      order: `${formatNumber(t.bankCuYd)} cu yd`,
      note: "L × W × D ÷ 27 — what you pay to dig",
      highlight: true,
    },
    {
      label: `Loose volume (+${t.swellPct}% swell)`,
      net: `${formatNumber(t.looseCuYd)} cu yd`,
      waste: `+${t.swellPct}%`,
      order: `${formatNumber(t.looseCuYd)} cu yd`,
      note: `${SOIL_SWELL[v.soilType].label} — what you pay to haul`,
      highlight: true,
    },
    {
      label: `Truckloads — ${v.truckCapacityYd}-yd trucks`,
      net: `${formatNumber(t.looseCuYd)} cu yd loose`,
      waste: "—",
      order: `${formatNumber(t.truckLoads)} loads`,
      note: "Heaped loads, rounded up",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.bankCuYd <= 0) {
      toast.error("Check your inputs", {
        description: "Length, width, and depth must be greater than zero.",
      });
      return;
    }
    const ctx = `${formatNumber(v.lengthFt)}×${formatNumber(v.widthFt)}×${formatNumber(v.depthFt)} ft · ${SOIL_SWELL[v.soilType].label}`;
    addItem({
      toolSlug: SLUG,
      title: "Site Excavation",
      category: "site-exterior",
      quantity: t.bankCuYd,
      unit: "cu yd",
      unitCost: v.digRatePerYd,
      wastePercent: 0,
      notes: `${ctx} · ${formatNumber(t.bankCuYd)} bank cu yd machine dig.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Dirt Hauling & Disposal",
      category: "site-exterior",
      quantity: t.truckLoads,
      unit: "loads",
      unitCost: v.haulFeePerLoad,
      wastePercent: 0,
      notes: `${ctx} · ${formatNumber(t.looseCuYd)} loose cu yd in ${v.truckCapacityYd}-yd trucks.`,
    });
    toast.success("2 lines added to Master Bid Cart", {
      description: `Dig ${formatMoney(digCost)} · Haul ${formatMoney(haulCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <p className="text-xs text-zinc-500">
          Rectangular-prism volume (L × W × D). For sloped-side digs such as
          ponds, enter average length and width.
        </p>
      </div>

      <DimensionInput
        id="ex-length"
        label="Length"
        valueFeet={v.lengthFt}
        onChange={(f) => set("lengthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="ex-width"
        label="Width"
        valueFeet={v.widthFt}
        onChange={(f) => set("widthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="ex-depth"
        label="Depth"
        valueFeet={v.depthFt}
        onChange={(f) => set("depthFt", f)}
        minFeet={0}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={(
            Object.entries(SOIL_SWELL) as [SoilType, { label: string; pct: number }][]
          ).map(([, s]) => `${s.label} · ${s.pct}%`)}
          active={`${SOIL_SWELL[v.soilType].label} · ${SOIL_SWELL[v.soilType].pct}%`}
          onChange={(l) => {
            const found = (Object.entries(SOIL_SWELL) as [SoilType, { label: string; pct: number }][]).find(
              ([, s]) => `${s.label} · ${s.pct}%` === l,
            );
            if (found) set("soilType", found[0]);
          }}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Swell = how much the soil expands once dug. Loose yards ÷ truck
          capacity = loads.
        </p>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Haul truck capacity
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Haul truck capacity">
          {TRUCKS.map((tr) => (
            <button
              key={tr.value}
              type="button"
              onClick={() => set("truckCapacityYd", tr.value)}
              aria-pressed={v.truckCapacityYd === tr.value}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.truckCapacityYd === tr.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      <CostInput
        id="ex-digrate"
        label="Dig rate"
        value={v.digRatePerYd}
        onChange={(n) => set("digRatePerYd", n)}
        perUnit="$/bank yd"
      />
      <CostInput
        id="ex-haulfee"
        label="Haul / disposal fee"
        value={v.haulFeePerLoad}
        onChange={(n) => set("haulFeePerLoad", n)}
        perUnit="$/load"
      />
      <PresetStepper
        id="ex-dummy"
        label="Depth quick-set"
        value={Math.round(v.depthFt * 12)}
        onChange={(n) => set("depthFt", n / 12)}
        unit="in"
        step={6}
        min={0}
        presets={[
          { label: '24"', value: 24 },
          { label: '36"', value: 36 },
          { label: '48"', value: 48 },
        ]}
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.truckLoads),
        unit: "LOADS",
        label: "Dump truck loads to haul",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `Dig — ${formatNumber(t.bankCuYd)} × ${formatMoney(v.digRatePerYd)}/yd`, amount: Math.round(digCost * 100) / 100 },
        { label: `Haul — ${formatNumber(t.truckLoads)} × ${formatMoney(v.haulFeePerLoad)}/load`, amount: Math.round(haulCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add dig + haul lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.truckLoads),
        unit: "loads",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
