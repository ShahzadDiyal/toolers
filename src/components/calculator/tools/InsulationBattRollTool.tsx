/**
 * BuildCalc Pro Fiberglass Batt, Blown-In Cellulose & R-Value Sizer (Batch 4F).
 *
 * Bag counts from DOE/IECC target R-values with framing deductions.
 * Dispatches 1 estimate line.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  insulationTakeoff,
  INSULATION_APPS,
  type InsulationApp,
  type InsulationType,
  type TargetR,
} from "@/lib/math/mepAndFinishes";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "insulation-batt-roll";

interface InsulationInputs extends Record<string, unknown> {
  app: InsulationApp;
  insType: InsulationType;
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  framingSpacingIn: 16 | 24;
  targetR: TargetR;
  costPerBag: number;
}

const DEFAULTS: InsulationInputs = {
  app: "attic",
  insType: "batts",
  areaMode: "sqft",
  lengthFt: 40,
  widthFt: 30,
  netSqft: 1200,
  framingSpacingIn: 16,
  targetR: 38,
  costPerBag: 52,
};

const APPS = Object.entries(INSULATION_APPS) as [
  InsulationApp,
  { label: string },
][];
const R_VALUES: TargetR[] = [13, 15, 19, 30, 38, 49];

export function InsulationBattRollTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<InsulationInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Insulation Batt, Blown Cellulose & R-Value Sizer",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const areaSqft = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = insulationTakeoff({
    app: v.app,
    insType: v.insType,
    areaSqft,
    framingSpacingIn: v.framingSpacingIn,
    targetR: v.targetR,
  });
  const valid = areaSqft > 0;
  const isWall = v.app === "wall2x4" || v.app === "wall2x6";

  const materialCost = t.bags * v.costPerBag;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `${v.insType === "batts" ? "Fiberglass batts" : "Blown cellulose"} R-${t.achievedR}`,
      net: `${formatNumber(t.netAreaSqft)} sq ft cavity`,
      waste: "+5%",
      order: `${formatNumber(t.bags)} ${t.unitLabel}`,
      note: `${formatNumber(t.thicknessIn)}″ installed thickness`,
      highlight: true,
    },
    {
      label: "Coverage check",
      net: `${formatNumber(areaSqft)} sq ft gross`,
      waste: "—",
      order: `${formatNumber(t.netAreaSqft)} sq ft net`,
      note: isWall
        ? "−10% framing deduction"
        : `${v.framingSpacingIn}″ O.C. · ${v.framingSpacingIn === 16 ? '15″' : '23″'} batt width`,
    },
  ];

  const handleAdd = () => {
    if (!valid || t.bags <= 0) {
      toast.error("Check your inputs", {
        description: "Insulation area must be greater than zero.",
      });
      return;
    }
    const appLabel = INSULATION_APPS[v.app].label;
    addItem({
      toolSlug: SLUG,
      title: `Thermal Insulation R-${t.achievedR} ${v.insType === "batts" ? "Batts" : "Blown Cellulose"}`,
      category: "finishes",
      quantity: t.bags,
      unit: "bags",
      unitCost: v.costPerBag,
      wastePercent: 5,
      notes: `${appLabel} · ${formatNumber(t.netAreaSqft)} sq ft net · ${formatNumber(t.thicknessIn)}″ thick.`,
    });
    toast.success("1 line added to Master Bid Cart", {
      description: `${t.bags} ${t.unitLabel} · ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Application
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Insulation application">
          {APPS.map(([key, a]) => (
            <button
              key={key}
              type="button"
              onClick={() => set("app", key)}
              aria-pressed={v.app === key}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.app === key
                  ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                  : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]")
              }
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Fiberglass batts / rolls", "Blown-in cellulose"]}
          active={v.insType === "batts" ? "Fiberglass batts / rolls" : "Blown-in cellulose"}
          onChange={(l) => set("insType", l.startsWith("Fiberglass") ? "batts" : "cellulose")}
        />
        {v.insType === "cellulose" && !isWall && (
          <p className="mt-1.5 text-xs text-zinc-500">
            Attic blown coverage: R-38 ≈ 43 bags/1,000 sq ft · R-49 ≈ 55 bags/1,000 sq ft.
          </p>
        )}
      </div>

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
            id="in-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="in-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="in-sqft"
          label="Area"
          value={v.netSqft}
          onChange={(n) => set("netSqft", n)}
          unit="sq ft"
          step={50}
          min={0}
        />
      )}

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={['16" O.C. framing', '24" O.C. framing']}
          active={v.framingSpacingIn === 16 ? '16" O.C. framing' : '24" O.C. framing'}
          onChange={(l) => set("framingSpacingIn", l.startsWith("16") ? 16 : 24)}
        />
      </div>

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Target R-value
          <span className="ml-2 font-mono normal-case tracking-normal text-accent">
            {formatNumber(t.thicknessIn)}″ thick
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Target R-value">
          {R_VALUES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set("targetR", r)}
              aria-pressed={v.targetR === r}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.targetR === r
                  ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                  : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]")
              }
            >
              R-{r}
            </button>
          ))}
        </div>
      </div>

      <CostInput
        id="in-costbag"
        label={v.insType === "batts" ? "Cost per batt bundle" : "Cost per 30-lb cellulose bag"}
        value={v.costPerBag}
        onChange={(n) => set("costPerBag", n)}
        perUnit="$/bag"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.bags),
        unit: v.insType === "batts" ? "BUNDLES" : "BAGS",
        label: v.insType === "batts" ? "Batt bundles to order" : "Cellulose bags to order",
      }}
      wastePercent={5}
      materials={materials}
      materialCosts={[
        { label: `${v.insType === "batts" ? "Batts" : "Cellulose"} R-${t.achievedR} ${formatNumber(t.bags)} × ${formatMoney(v.costPerBag)}`, amount: Math.round(materialCost * 100) / 100 },
      ]}
      total={Math.round(materialCost * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add insulation line to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.bags),
        unit: v.insType === "batts" ? "bundles" : "bags",
        label: `R-${t.achievedR} · ${formatMoney(Math.round(materialCost * 100) / 100)}`,
      }}
    />
  );
}
