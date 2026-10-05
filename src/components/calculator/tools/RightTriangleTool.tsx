/**
 * BuildCalc Pro — Right Triangle & 3-4-5 (Batch 4H).
 *
 * Solve from two legs (c = √(a²+b²)) or leg + hypotenuse, get both
 * acute angles, and run a 3-4-5 square check. Layout helper —
 * dispatches a reference note to the bid cart.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { solveRightTriangle, type TriangleMode } from "@/lib/math/finalBatch";
import { formatNumber } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "right-triangle";

interface TriangleInputs extends Record<string, unknown> {
  mode: TriangleMode;
  a: number;
  b: number;
}

const DEFAULTS: TriangleInputs = {
  mode: "two-legs",
  a: 3,
  b: 4,
};

const MODES: { id: TriangleMode; label: string }[] = [
  { id: "two-legs", label: "Two legs" },
  { id: "leg-hyp", label: "Leg + hypotenuse" },
];

export function RightTriangleTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<TriangleInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Right Triangle & 3-4-5",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = solveRightTriangle({ mode: v.mode, a: v.a, b: v.b });

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = t.valid
    ? [
        {
          label: v.mode === "two-legs" ? "Hypotenuse" : "Missing leg",
          net: v.mode === "two-legs" ? `√(${formatNumber(v.a)}² + ${formatNumber(v.b)}²)` : `√(${formatNumber(v.b)}² − ${formatNumber(v.a)}²)`,
          waste: "—",
          order: formatNumber(v.mode === "two-legs" ? t.c : t.b),
          note: "same unit as inputs",
          highlight: true,
        },
        {
          label: "Angles",
          net: "atan2 based",
          waste: "—",
          order: `${formatNumber(t.angleA)}° / ${formatNumber(t.angleB)}°`,
          note: "acute angles, sum to 90°",
        },
        {
          label: "3-4-5 square check",
          net: "within 1% of ratio",
          waste: "—",
          order: t.is345 ? "SQUARE ✓" : "not 3-4-5",
          note: t.is345 ? "corners are square" : "use for layout reference",
        },
      ]
    : [
        {
          label: "Result",
          net: "—",
          waste: "—",
          order: "—",
          note: t.error ?? "Enter positive values for both sides.",
        },
      ];

  const handleAdd = () => {
    if (!t.valid) {
      toast.error("Check your inputs", {
        description: t.error ?? "Enter positive values for both sides.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Right Triangle Reference — ${formatNumber(t.a)} / ${formatNumber(t.b)} / ${formatNumber(t.c)}`,
      category: "utilities",
      quantity: 1,
      unit: "note",
      unitCost: 0,
      wastePercent: 0,
      notes: `Angles ${formatNumber(t.angleA)}° / ${formatNumber(t.angleB)}°${t.is345 ? " · 3-4-5 square confirmed." : "."}`,
    });
    toast.success("Added to Master Bid Cart", {
      description: "Layout reference saved as a note.",
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={MODES.map((m) => m.label)}
          active={MODES.find((m) => m.id === v.mode)!.label}
          onChange={(label) =>
            set("mode", MODES.find((m) => m.label === label)!.id)
          }
        />
      </div>
      <PresetStepper
        id="t-a"
        label={v.mode === "two-legs" ? "Leg A (rise)" : "Leg (known side)"}
        value={v.a}
        onChange={(n) => set("a", n)}
        unit="units"
        step={0.5}
        min={0}
        decimals={2}
        presets={[
          { label: "3", value: 3 },
          { label: "6", value: 6 },
          { label: "9", value: 9 },
          { label: "12", value: 12 },
        ]}
        hint="Any unit — ft, in, m. Output matches."
      />
      <PresetStepper
        id="t-b"
        label={v.mode === "two-legs" ? "Leg B (run)" : "Hypotenuse"}
        value={v.b}
        onChange={(n) => set("b", n)}
        unit="units"
        step={0.5}
        min={0}
        decimals={2}
        presets={[
          { label: "4", value: 4 },
          { label: "8", value: 8 },
          { label: "12", value: 12 },
          { label: "16", value: 16 },
        ]}
        hint={v.mode === "leg-hyp" ? "Must be longer than the leg." : undefined}
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: t.valid ? formatNumber(v.mode === "two-legs" ? t.c : t.b) : "—",
        unit: "UNITS",
        label: v.mode === "two-legs" ? "Hypotenuse" : "Missing leg",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[]}
      labor={null}
      total={0}
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
        value: t.valid ? formatNumber(v.mode === "two-legs" ? t.c : t.b) : "—",
        unit: "",
        label: v.mode === "two-legs" ? "Hypotenuse" : "Missing leg",
      }}
    />
  );
}
