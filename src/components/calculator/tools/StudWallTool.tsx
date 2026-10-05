/**
 * BuildCalc Pro — Stud Wall Framing (Batch 4H).
 *
 * Studs = L ÷ spacing + 1, plates (bottom + double top), headers,
 * king studs, and cripples per opening. Real-time math, auto-saved
 * inputs, universal ResultsCard, master-estimate dispatch.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { studWallTakeoff } from "@/lib/math/finalBatch";
import { roundTo } from "@/lib/math/units";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "stud-wall";

type Spacing = 16 | 24;

interface StudWallInputs extends Record<string, unknown> {
  wallLengthFt: number;
  spacing: Spacing;
  openings: number;
  studCost: number;
  plateCostPerFt: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: StudWallInputs = {
  wallLengthFt: 12,
  spacing: 16,
  openings: 1,
  studCost: 4.25,
  plateCostPerFt: 0.85,
  laborHours: 0,
  laborRate: 65,
};

const SPACINGS: { id: Spacing; label: string }[] = [
  { id: 16, label: '16" O.C.' },
  { id: 24, label: '24" O.C.' },
];

export function StudWallTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<StudWallInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Stud Wall Framing",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = studWallTakeoff({
    wallLengthFt: v.wallLengthFt,
    spacingIn: v.spacing,
    openings: v.openings,
  });
  const valid = t.totalStuds > 0;
  const studCost = roundTo(t.totalStuds * v.studCost, 2);
  const plateCost = roundTo(t.plateLF * v.plateCostPerFt, 2);
  const materialCost = roundTo(studCost + plateCost, 2);
  const laborTotal = roundTo(v.laborHours * v.laborRate, 2);
  const total = roundTo(materialCost + laborTotal, 2);

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Studs (all-in)",
      net: `${formatNumber(t.studs)} field + ${formatNumber(t.kingStuds + t.cripples + t.cornerStuds)} extras`,
      waste: "—",
      order: `${formatNumber(t.totalStuds)} studs`,
      note: "kings + cripples + corners included",
      highlight: true,
    },
    {
      label: "Plates (bottom + double top)",
      net: `${formatNumber(t.plateLF)} LF`,
      waste: "—",
      order: `${formatNumber(t.plateLF)} LF`,
      note: "3 runs of wall length",
    },
    {
      label: "Headers",
      net: `${formatNumber(v.openings)} openings`,
      waste: "—",
      order: `${formatNumber(t.headers)} headers`,
      note: "one per opening",
    },
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Wall length must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Stud Wall Framing — ${v.wallLengthFt} ft @ ${v.spacing}" O.C.`,
      category: "framing-roofing",
      quantity: t.totalStuds,
      unit: "studs",
      unitCost: v.studCost,
      wastePercent: 0,
      notes: `${t.plateLF} LF plates · ${t.headers} headers · ${v.openings} openings.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${t.totalStuds} studs · ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="s-length"
        label="Wall length"
        valueFeet={v.wallLengthFt}
        onChange={(f) => set("wallLengthFt", f)}
        minFeet={0}
        hint="Total run of this wall."
      />
      <PresetStepper
        id="s-openings"
        label="Openings"
        value={v.openings}
        onChange={(n) => set("openings", n)}
        unit="ea"
        step={1}
        min={0}
        hint="Doors + windows."
      />
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={SPACINGS.map((s) => s.label)}
          active={SPACINGS.find((s) => s.id === v.spacing)!.label}
          onChange={(label) =>
            set("spacing", SPACINGS.find((s) => s.label === label)!.id)
          }
        />
      </div>
      <CostInput
        id="s-studcost"
        label="Stud price"
        value={v.studCost}
        onChange={(n) => set("studCost", n)}
        perUnit="$/stud"
      />
      <CostInput
        id="s-platecost"
        label="Plate price"
        value={v.plateCostPerFt}
        onChange={(n) => set("plateCostPerFt", n)}
        perUnit="$/LF"
      />
      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="s-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="s-rate"
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
        value: formatNumber(t.totalStuds),
        unit: "STUDS",
        label: "Total studs",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `${t.totalStuds} studs × ${formatMoney(v.studCost)}`, amount: studCost },
        { label: `${formatNumber(t.plateLF)} LF plates × ${formatMoney(v.plateCostPerFt)}`, amount: plateCost },
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
        value: formatNumber(t.totalStuds),
        unit: "studs",
        label: "Total studs",
      }}
    />
  );
}
