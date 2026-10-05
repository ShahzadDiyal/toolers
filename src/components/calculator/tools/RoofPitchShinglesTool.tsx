/**
 * BuildCalc Pro Roof Pitch, Shingle & Underlayment Estimator (Phase 4A).
 *
 * Footprint → pitch-adjusted true area → squares → bundles + underlayment.
 * Dispatches TWO estimate lines (shingles + underlayment) per the contract.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { calculateWithWaste, roundTo, roundUp } from "@/lib/math/units";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "roof-pitch-shingles";

type Complexity = "gable" | "hip" | "complex";
type InputMode = "area" | "dims";

interface RoofInputs extends Record<string, unknown> {
  inputMode: InputMode;
  footprintSqft: number;
  lengthFt: number;
  widthFt: number;
  pitch: number;
  complexity: Complexity;
  shingleType: "architectural" | "3tab";
  costPerBundle: number;
  costPerRoll: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: RoofInputs = {
  inputMode: "area",
  footprintSqft: 2000,
  lengthFt: 50,
  widthFt: 40,
  pitch: 6,
  complexity: "gable",
  shingleType: "architectural",
  costPerBundle: 38,
  costPerRoll: 129,
  laborHours: 0,
  laborRate: 65,
};

const WASTE: Record<Complexity, number> = { gable: 10, hip: 15, complex: 20 };
const COMPLEXITY_LABELS: Record<Complexity, string> = {
  gable: "Simple gable",
  hip: "Hip / valley",
  complex: "Complex cut-up",
};
const BUNDLES_PER_SQUARE = 3;
const SQFT_PER_ROLL = 1000; // 10-square synthetic roll

const PITCHES = [3, 4, 5, 6, 7, 8, 9, 10, 12];

export function RoofPitchShinglesTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<RoofInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Roof Pitch & Shingles",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math (per spec) ---------------- */
  const footprint =
    v.inputMode === "area" ? v.footprintSqft : v.lengthFt * v.widthFt;
  const valid = footprint > 0;
  // Pitch multiplier M = √(rise² + 12²) / 12
  const pitchMultiplier = valid
    ? roundTo(Math.sqrt(v.pitch * v.pitch + 144) / 12, 4)
    : 0;
  const trueArea = valid ? roundTo(footprint * pitchMultiplier, 2) : 0;
  const wastePercent = WASTE[v.complexity];
  const { gross: grossArea } = calculateWithWaste(trueArea, wastePercent);
  const squares = valid ? roundTo(grossArea / 100, 2) : 0;
  const bundles = roundUp(squares * BUNDLES_PER_SQUARE);
  const rolls = roundUp(grossArea / SQFT_PER_ROLL);

  const shingleCost = roundTo(bundles * v.costPerBundle, 2);
  const rollCost = roundTo(rolls * v.costPerRoll, 2);
  const materialCost = roundTo(shingleCost + rollCost, 2);
  const laborTotal = roundTo(v.laborHours * v.laborRate, 2);
  const total = roundTo(materialCost + laborTotal, 2);

  const shingleLabel =
    v.shingleType === "architectural" ? "Architectural" : "3-Tab";

  const materials: MaterialRow[] = [
    {
      label: `${shingleLabel} shingles`,
      net: `${formatNumber(roundTo((trueArea / 100) * BUNDLES_PER_SQUARE, 1))} bundles`,
      waste: `+${wastePercent}%`,
      order: `${formatNumber(bundles)} bundles`,
      note: `${formatNumber(squares)} squares · ${BUNDLES_PER_SQUARE} bundles/sq`,
      highlight: true,
    },
    {
      label: "Synthetic underlayment",
      net: `${formatNumber(roundTo(trueArea / SQFT_PER_ROLL, 2))} rolls`,
      waste: `+${wastePercent}%`,
      order: `${formatNumber(rolls)} rolls`,
      note: "10-sq rolls, rounded up",
    },
  ];

  const handleAdd = () => {
    if (!valid || bundles <= 0) {
      toast.error("Check your inputs", {
        description: "Roof footprint must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `${shingleLabel} shingles ${formatNumber(squares)} sq`,
      category: "framing-roofing",
      quantity: bundles,
      unit: "ea",
      unitCost: v.costPerBundle,
      wastePercent,
      notes: `${formatNumber(squares)} roofing squares incl. ${wastePercent}% waste (${COMPLEXITY_LABELS[v.complexity].toLowerCase()}). Pitch ${v.pitch}/12.`,
    });
    addItem({
      toolSlug: SLUG,
      title: `Synthetic underlayment ${formatNumber(rolls)} rolls`,
      category: "framing-roofing",
      quantity: rolls,
      unit: "ea",
      unitCost: v.costPerRoll,
      wastePercent,
      notes: `Covers ${formatNumber(grossArea)} sq ft incl. waste.`,
    });
    toast.success("2 lines added to Master Bid Cart", {
      description: `Shingles ${formatMoney(shingleCost)} + underlayment ${formatMoney(rollCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Footprint area", "Ground dims L × W"]}
          active={v.inputMode === "area" ? "Footprint area" : "Ground dims L × W"}
          onChange={(label) =>
            set("inputMode", label === "Footprint area" ? "area" : "dims")
          }
        />
      </div>

      {v.inputMode === "area" ? (
        <PresetStepper
          id="r-area"
          label="Roof footprint area"
          value={v.footprintSqft}
          onChange={(n) => set("footprintSqft", n)}
          unit="sq ft"
          step={50}
          min={0}
          hint="Plan-view area (before pitch)."
        />
      ) : (
        <>
          <DimensionInput
            id="r-len"
            label="Ground length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="r-wid"
            label="Ground width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      )}

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Roof pitch
          <span className="ml-2 font-mono normal-case tracking-normal text-accent">
            {v.pitch}/12 · ×{pitchMultiplier || "—"} area
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Roof pitch">
          {PITCHES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("pitch", p)}
              aria-pressed={v.pitch === p}
              className={
                "min-h-[44px] min-w-[52px] rounded-lg border font-mono text-sm font-bold transition-colors " +
                (v.pitch === p
                  ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                  : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]")
              }
            >
              {p}/12
            </button>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={Object.values(COMPLEXITY_LABELS)}
          active={COMPLEXITY_LABELS[v.complexity]}
          onChange={(label) =>
            set(
              "complexity",
              (Object.keys(COMPLEXITY_LABELS) as Complexity[]).find(
                (k) => COMPLEXITY_LABELS[k] === label,
              )!,
            )
          }
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Waste allowance: <span className="font-mono font-bold text-accent">{wastePercent}%</span> —{" "}
          {v.complexity === "gable" && "simple gables cut clean."}
          {v.complexity === "hip" && "hips and valleys eat shingles."}
          {v.complexity === "complex" && "cut-up roofs: dormers, crickets, waste."}
        </p>
      </div>

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Architectural", "3-Tab"]}
          active={v.shingleType === "architectural" ? "Architectural" : "3-Tab"}
          onChange={(label) =>
            set("shingleType", label === "Architectural" ? "architectural" : "3tab")
          }
        />
      </div>

      <CostInput
        id="r-bundle"
        label="Shingle cost"
        value={v.costPerBundle}
        onChange={(n) => set("costPerBundle", n)}
        perUnit="$/bundle"
      />
      <CostInput
        id="r-roll"
        label="Underlayment cost"
        value={v.costPerRoll}
        onChange={(n) => set("costPerRoll", n)}
        perUnit="$/roll"
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
        value: formatNumber(squares),
        unit: "SQUARES",
        label: "Total roofing squares",
      }}
      wastePercent={wastePercent}
      materials={materials}
      materialCosts={[
        {
          label: `${shingleLabel} ${formatNumber(bundles)} bundles × ${formatMoney(v.costPerBundle)}`,
          amount: shingleCost,
        },
        {
          label: `Underlayment ${formatNumber(rolls)} rolls × ${formatMoney(v.costPerRoll)}`,
          amount: rollCost,
        },
      ]}
      labor={v.laborHours > 0 ? { hours: v.laborHours, rate: v.laborRate } : null}
      total={total}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add both to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(squares),
        unit: "squares",
        label: `Total · ${formatMoney(total)}`,
      }}
    />
  );
}
