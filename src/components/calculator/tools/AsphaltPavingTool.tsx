/**
 * BuildCalc Pro Asphalt Paving & Driveway Estimator (Batch 4D).
 *
 * Hot-mix asphalt tonnage (110 lbs/sq yd/in) plus crushed aggregate
 * sub-base. Dispatches 2 lines: HMA surface + stone base course.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { asphaltTakeoff } from "@/lib/math/earthwork";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "asphalt-paving";

interface AsphaltInputs extends Record<string, unknown> {
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  asphaltThicknessIn: number;
  baseThicknessIn: number;
  wastePct: number;
  costPerTonAsphalt: number;
  costPerTonBase: number;
}

const DEFAULTS: AsphaltInputs = {
  areaMode: "dims",
  lengthFt: 50,
  widthFt: 12,
  netSqft: 600,
  asphaltThicknessIn: 3,
  baseThicknessIn: 6,
  wastePct: 5,
  costPerTonAsphalt: 98,
  costPerTonBase: 46,
};

const ASPHALT_DEPTHS = [
  { label: '2″ resurface', value: 2, hint: "Standard residential resurface" },
  { label: '3″ driveway', value: 3, hint: "New residential driveway" },
  { label: '4″ commercial', value: 4, hint: "Commercial parking lot" },
];

const BASE_DEPTHS = [
  { label: '4″ light duty', value: 4 },
  { label: '6″ standard', value: 6 },
  { label: '8″ heavy duty', value: 8 },
];

export function AsphaltPavingTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<AsphaltInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Asphalt Paving & Driveway Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const areaSqft = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = asphaltTakeoff({
    areaSqft,
    asphaltThicknessIn: v.asphaltThicknessIn,
    baseThicknessIn: v.baseThicknessIn,
    wastePct: v.wastePct,
  });
  const valid = areaSqft > 0;

  const asphaltCost = t.asphaltTons * v.costPerTonAsphalt;
  const baseCost = t.baseTons * v.costPerTonBase;
  const total = asphaltCost + baseCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `Hot-mix asphalt ${formatNumber(v.asphaltThicknessIn)}″ compacted`,
      net: `${formatNumber(t.sqYd)} sq yd`,
      waste: `+${v.wastePct}%`,
      order: `${formatNumber(t.asphaltTons)} tons`,
      note: "110 lbs per sq yd per inch",
      highlight: true,
    },
    {
      label: `Aggregate sub-base ${formatNumber(v.baseThicknessIn)}″ crusher run`,
      net: `${formatNumber(t.areaSqft)} sq ft`,
      waste: "+10%",
      order: `${formatNumber(t.baseTons)} tons`,
      note: "1.62 tons/cu yd + compaction allowance",
      highlight: true,
    },
  ];

  const handleAdd = () => {
    if (!valid || (t.asphaltTons <= 0 && t.baseTons <= 0)) {
      toast.error("Check your inputs", {
        description: "Paved area and at least one thickness must be greater than zero.",
      });
      return;
    }
    const ctx = `${formatNumber(t.areaSqft)} sq ft (${formatNumber(t.sqYd)} sq yd) · ${formatNumber(v.asphaltThicknessIn)}″ HMA over ${formatNumber(v.baseThicknessIn)}″ base`;
    const lines: string[] = [];
    if (t.asphaltTons > 0) {
      addItem({
        toolSlug: SLUG,
        title: `Hot-Mix Asphalt ${formatNumber(v.asphaltThicknessIn)}″`,
        category: "site-exterior",
        quantity: t.asphaltTons,
        unit: "tons",
        unitCost: v.costPerTonAsphalt,
        wastePercent: v.wastePct,
        notes: `${ctx}.`,
      });
      lines.push(`Asphalt ${formatMoney(asphaltCost)}`);
    }
    if (t.baseTons > 0) {
      addItem({
        toolSlug: SLUG,
        title: `Crushed Stone Base ${formatNumber(v.baseThicknessIn)}″`,
        category: "site-exterior",
        quantity: t.baseTons,
        unit: "tons",
        unitCost: v.costPerTonBase,
        wastePercent: 0,
        notes: `${ctx} · incl. 10% compaction allowance.`,
      });
      lines.push(`Base ${formatMoney(baseCost)}`);
    }
    toast.success(
      `${lines.length} line${lines.length === 1 ? "" : "s"} added to Master Bid Cart`,
      {
        description: lines.join(" · "),
        action: { label: "View cart", onClick: () => setDrawerOpen(true) },
      },
    );
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
            id="ap-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="ap-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="ap-sqft"
          label="Total area"
          value={v.netSqft}
          onChange={(n) => set("netSqft", n)}
          unit="sq ft"
          step={10}
          min={0}
        />
      )}

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Asphalt thickness (compacted)
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Asphalt thickness">
          {ASPHALT_DEPTHS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => set("asphaltThicknessIn", d.value)}
              aria-pressed={v.asphaltThicknessIn === d.value}
              title={d.hint}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.asphaltThicknessIn === d.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          {ASPHALT_DEPTHS.find((d) => d.value === v.asphaltThicknessIn)?.hint}
        </p>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Aggregate base thickness (compacted)
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Aggregate base thickness">
          {BASE_DEPTHS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => set("baseThicknessIn", d.value)}
              aria-pressed={v.baseThicknessIn === d.value}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.baseThicknessIn === d.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <PresetStepper
        id="ap-waste"
        label="Waste allowance"
        value={v.wastePct}
        onChange={(n) => set("wastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={30}
        presets={[
          { label: "5%", value: 5 },
          { label: "10%", value: 10 },
        ]}
      />

      <CostInput
        id="ap-costhmas"
        label="Hot-mix asphalt"
        value={v.costPerTonAsphalt}
        onChange={(n) => set("costPerTonAsphalt", n)}
        perUnit="$/ton"
      />
      <CostInput
        id="ap-costbase"
        label="Sub-base stone"
        value={v.costPerTonBase}
        onChange={(n) => set("costPerTonBase", n)}
        perUnit="$/ton"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.asphaltTons),
        unit: "TONS",
        label: "Hot-mix asphalt to order",
      }}
      wastePercent={v.wastePct}
      materials={materials}
      materialCosts={[
        { label: `HMA ${formatNumber(t.asphaltTons)} × ${formatMoney(v.costPerTonAsphalt)}/ton`, amount: Math.round(asphaltCost * 100) / 100 },
        { label: `Base ${formatNumber(t.baseTons)} × ${formatMoney(v.costPerTonBase)}/ton`, amount: Math.round(baseCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add paving lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.asphaltTons),
        unit: "tons HMA",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
