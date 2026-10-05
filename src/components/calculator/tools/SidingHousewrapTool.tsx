/**
 * BuildCalc Pro Exterior Siding & Housewrap Estimator (Batch 4E).
 *
 * Cladding squares, housewrap rolls, starter strips, and corner posts
 * from perimeter, height, gables, and opening deductions.
 * Dispatches 3 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  sidingTakeoff,
  SIDING_MATERIALS,
  type SidingMaterial,
} from "@/lib/math/exteriorFraming";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "siding-housewrap";

interface SidingInputs extends Record<string, unknown> {
  perimeterFt: number;
  wallHeightFt: number;
  gableCount: number;
  gableBaseFt: number;
  gablePeakFt: number;
  windowsCount: number;
  garageDoorsCount: number;
  entryDoorsCount: number;
  sidingMaterial: SidingMaterial;
  outsideCornerCount: number;
  wastePct: number;
  costPerSquare: number;
  costPerStarterStrip: number;
  costPerHousewrapRoll: number;
  costPerCornerPc: number;
}

const DEFAULTS: SidingInputs = {
  perimeterFt: 160,
  wallHeightFt: 9,
  gableCount: 2,
  gableBaseFt: 24,
  gablePeakFt: 6,
  windowsCount: 10,
  garageDoorsCount: 1,
  entryDoorsCount: 2,
  sidingMaterial: "fiberCement",
  outsideCornerCount: 4,
  wastePct: 10,
  costPerSquare: 285,
  costPerStarterStrip: 12,
  costPerHousewrapRoll: 145,
  costPerCornerPc: 18,
};

const MATERIALS = Object.entries(SIDING_MATERIALS) as [
  SidingMaterial,
  { label: string },
][];

export function SidingHousewrapTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<SidingInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Exterior Siding & Housewrap Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = sidingTakeoff({
    perimeterFt: v.perimeterFt,
    wallHeightFt: v.wallHeightFt,
    gableCount: v.gableCount,
    gableBaseFt: v.gableBaseFt,
    gablePeakFt: v.gablePeakFt,
    windowsCount: v.windowsCount,
    garageDoorsCount: v.garageDoorsCount,
    entryDoorsCount: v.entryDoorsCount,
    sidingMaterial: v.sidingMaterial,
    outsideCornerCount: v.outsideCornerCount,
    wastePct: v.wastePct,
  });
  const valid = v.perimeterFt > 0 && v.wallHeightFt > 0;
  const matLabel = SIDING_MATERIALS[v.sidingMaterial].label;

  const sidingCost = t.squares * v.costPerSquare;
  const wrapCost = t.housewrapRolls * v.costPerHousewrapRoll;
  const trimQty = t.starterStrips + t.cornerPcs;
  const trimCost =
    t.starterStrips * v.costPerStarterStrip + t.cornerPcs * v.costPerCornerPc;
  const total = sidingCost + wrapCost + trimCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `Siding ${matLabel}`,
      net: `${formatNumber(t.netAreaSqft)} sq ft net`,
      waste: `+${v.wastePct}%`,
      order: `${formatNumber(t.squares)} squares`,
      note: `100 sq ft/square · −${formatNumber(t.deductionsSqft)} sq ft openings`,
      highlight: true,
    },
    {
      label: "Housewrap 9×100 ft rolls",
      net: `${formatNumber(t.netAreaSqft)} sq ft`,
      waste: "+15%",
      order: `${formatNumber(t.housewrapRolls)} rolls`,
      note: "6″ overlaps · 900 sq ft/roll",
      highlight: true,
    },
    {
      label: "Starter strips 10 ft",
      net: `${formatNumber(v.perimeterFt)} lin ft`,
      waste: "—",
      order: `${formatNumber(t.starterStrips)} strips`,
      note: "Full perimeter course",
    },
    {
      label: "Corner posts 10 ft pcs",
      net: `${v.outsideCornerCount} outside corners`,
      waste: "—",
      order: `${formatNumber(t.cornerPcs)} pcs`,
      note: "Stacked to wall height",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.squares <= 0) {
      toast.error("Check your inputs", {
        description: "Perimeter and wall height must be greater than zero.",
      });
      return;
    }
    const ctx = `${matLabel} · ${formatNumber(v.perimeterFt)} ft perimeter × ${formatNumber(v.wallHeightFt)} ft · ${formatNumber(t.netAreaSqft)} sq ft net`;
    addItem({
      toolSlug: SLUG,
      title: `Exterior Siding Cladding ${matLabel}`,
      category: "site-exterior",
      quantity: t.squares,
      unit: "squares",
      unitCost: v.costPerSquare,
      wastePercent: v.wastePct,
      notes: `${ctx}.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Weather-Resistive Barrier Housewrap Rolls",
      category: "site-exterior",
      quantity: t.housewrapRolls,
      unit: "ea",
      unitCost: v.costPerHousewrapRoll,
      wastePercent: 0,
      notes: `${ctx} · 9×100 ft rolls, 6″ overlaps.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Starter Strips & Corner Posts",
      category: "site-exterior",
      quantity: trimQty,
      unit: "ea",
      unitCost:
        trimQty > 0
          ? Math.round((trimCost / trimQty) * 100) / 100
          : 0,
      wastePercent: 0,
      notes: `${ctx} · ${t.starterStrips} starter strips + ${t.cornerPcs} corner pcs.`,
    });
    toast.success("3 lines added to Master Bid Cart", {
      description: `Siding ${formatMoney(sidingCost)} · Wrap ${formatMoney(wrapCost)} · Trim ${formatMoney(trimCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="sd-perim"
        label="Wall perimeter"
        valueFeet={v.perimeterFt}
        onChange={(f) => set("perimeterFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="sd-height"
        label="Wall height"
        valueFeet={v.wallHeightFt}
        onChange={(f) => set("wallHeightFt", f)}
        minFeet={0}
      />

      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Gable ends
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PresetStepper
            id="sd-gables"
            label="Gables"
            value={v.gableCount}
            onChange={(n) => set("gableCount", Math.round(n))}
            unit="gables"
            step={1}
            min={0}
            max={8}
          />
          <DimensionInput
            id="sd-gbase"
            label="Gable base width"
            valueFeet={v.gableBaseFt}
            onChange={(f) => set("gableBaseFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="sd-gpeak"
            label="Gable peak height"
            valueFeet={v.gablePeakFt}
            onChange={(f) => set("gablePeakFt", f)}
            minFeet={0}
          />
        </div>
      </div>

      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Opening deductions
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PresetStepper
            id="sd-win"
            label="Windows"
            value={v.windowsCount}
            onChange={(n) => set("windowsCount", Math.round(n))}
            unit="× 15 sq ft"
            step={1}
            min={0}
          />
          <PresetStepper
            id="sd-gar"
            label="Garage doors"
            value={v.garageDoorsCount}
            onChange={(n) => set("garageDoorsCount", Math.round(n))}
            unit="× 120 sq ft"
            step={1}
            min={0}
          />
          <PresetStepper
            id="sd-entry"
            label="Entry doors"
            value={v.entryDoorsCount}
            onChange={(n) => set("entryDoorsCount", Math.round(n))}
            unit="× 21 sq ft"
            step={1}
            min={0}
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Siding material
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Siding material">
          {MATERIALS.map(([key, m]) => (
            <button
              key={key}
              type="button"
              onClick={() => set("sidingMaterial", key)}
              aria-pressed={v.sidingMaterial === key}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.sidingMaterial === key
                  ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                  : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]")
              }
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <PresetStepper
        id="sd-corners"
        label="Outside corners"
        value={v.outsideCornerCount}
        onChange={(n) => set("outsideCornerCount", Math.round(n))}
        unit="corners"
        step={1}
        min={0}
        max={16}
      />
      <PresetStepper
        id="sd-waste"
        label="Waste allowance"
        value={v.wastePct}
        onChange={(n) => set("wastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={30}
        presets={[
          { label: "10%", value: 10 },
          { label: "15% complex", value: 15 },
        ]}
      />

      <CostInput
        id="sd-costsq"
        label="Siding cost"
        value={v.costPerSquare}
        onChange={(n) => set("costPerSquare", n)}
        perUnit="$/square"
      />
      <CostInput
        id="sd-costwrap"
        label="Housewrap roll"
        value={v.costPerHousewrapRoll}
        onChange={(n) => set("costPerHousewrapRoll", n)}
        perUnit="$/9×100 ft"
      />
      <CostInput
        id="sd-coststart"
        label="Starter strip"
        value={v.costPerStarterStrip}
        onChange={(n) => set("costPerStarterStrip", n)}
        perUnit="$/10 ft"
      />
      <CostInput
        id="sd-costcorner"
        label="Corner post pc"
        value={v.costPerCornerPc}
        onChange={(n) => set("costPerCornerPc", n)}
        perUnit="$/10 ft"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.squares),
        unit: "SQUARES",
        label: "Siding squares to order",
      }}
      wastePercent={v.wastePct}
      materials={materials}
      materialCosts={[
        { label: `Siding ${formatNumber(t.squares)} × ${formatMoney(v.costPerSquare)}/sq`, amount: Math.round(sidingCost * 100) / 100 },
        { label: `Housewrap ${formatNumber(t.housewrapRolls)} × ${formatMoney(v.costPerHousewrapRoll)}`, amount: Math.round(wrapCost * 100) / 100 },
        { label: `Trim ${formatNumber(trimQty)} pcs`, amount: Math.round(trimCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add siding lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.squares),
        unit: "squares",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
