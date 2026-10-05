/**
 * BuildCalc Pro Wall Framing & Drywall Pack (Phase 4B).
 *
 * Rough framing lumber takeoff + interior wallboard in one pass.
 * Dispatches 3 estimate lines: framing lumber, wallboards, finishing.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { framingTakeoff } from "@/lib/math/framing";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "framing-drywall-pack";

interface FramingInputs extends Record<string, unknown> {
  wallLengthFt: number;
  wallHeightFt: number;
  spacingIn: number;
  corners: number;
  doors: number;
  windows: number;
  doubleTopPlate: boolean;
  sheetSize: "4x8" | "4x12";
  sides: 1 | 2;
  costPerStud: number;
  costPerPlate: number;
  costPerSheet: number;
  costPerMudBucket: number;
  costPerTapeRoll: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: FramingInputs = {
  wallLengthFt: 40,
  wallHeightFt: 8,
  spacingIn: 16,
  corners: 4,
  doors: 2,
  windows: 4,
  doubleTopPlate: true,
  sheetSize: "4x8",
  sides: 2,
  costPerStud: 4.25,
  costPerPlate: 9.5,
  costPerSheet: 16.5,
  costPerMudBucket: 22,
  costPerTapeRoll: 8,
  laborHours: 0,
  laborRate: 65,
};

export function FramingDrywallPackTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<FramingInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Wall Framing & Drywall Pack",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = framingTakeoff({
    lengthFt: v.wallLengthFt,
    heightFt: v.wallHeightFt,
    spacingIn: v.spacingIn,
    corners: v.corners,
    doors: v.doors,
    windows: v.windows,
    doubleTopPlate: v.doubleTopPlate,
    sheetSqft: v.sheetSize === "4x8" ? 32 : 48,
    sides: v.sides,
  });
  const valid = v.wallLengthFt > 0 && v.wallHeightFt > 0;

  const studsCost = t.totalStuds * v.costPerStud;
  const platesCost = t.plateBoards * v.costPerPlate;
  // Headers/sills priced as 8-ft boards at the stud unit price.
  const headerSillCost = (t.headerBoards + t.sillBoards) * v.costPerStud;
  const lumberCost = studsCost + platesCost + headerSillCost;
  const sheetsCost = t.sheets * v.costPerSheet;
  const mudCost = t.mudBuckets * v.costPerMudBucket;
  const tapeCost = t.tapeRolls * v.costPerTapeRoll;
  const finishCost = mudCost + tapeCost;
  const laborTotal = v.laborHours * v.laborRate;
  const total = lumberCost + sheetsCost + finishCost + laborTotal;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "2×4 wall studs",
      net: `${formatNumber(t.baseStuds)} ea`,
      waste: `+${formatNumber(t.extraStuds)} corners/openings`,
      order: `${formatNumber(t.totalStuds)} ea`,
      note: `${v.spacingIn}″ O.C. · kings/jacks at every opening`,
      highlight: true,
    },
    {
      label: "Header & sill boards (8-ft)",
      net: `${formatNumber(t.headerBoards + t.sillBoards)} ea`,
      waste: "—",
      order: `${formatNumber(t.headerBoards + t.sillBoards)} ea`,
      note: "Double header per opening + sill per window",
    },
    {
      label: "16-ft plate boards",
      net: `${formatNumber(t.plateBoards)} ea`,
      waste: "—",
      order: `${formatNumber(t.plateBoards)} ea`,
      note: `${t.plateRuns} runs (${v.doubleTopPlate ? "double top" : "single top"} + bottom)`,
    },
    {
      label: `Drywall sheets (${v.sheetSize})`,
      net: `${formatNumber(t.netDrywallSqft)} sq ft`,
      waste: "+10%",
      order: `${formatNumber(t.sheets)} sheets`,
      note: `${v.sides} side${v.sides === 2 ? "s" : ""}`,
      highlight: true,
    },
    {
      label: "Joint compound",
      net: `${formatNumber(t.grossDrywallSqft)} sq ft`,
      waste: "—",
      order: `${formatNumber(t.mudBuckets)} buckets`,
      note: "4.5-gal buckets",
    },
    {
      label: "Drywall tape",
      net: "—",
      waste: "—",
      order: `${formatNumber(t.tapeRolls)} rolls`,
      note: "250-ft rolls",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.totalStuds <= 0) {
      toast.error("Check your inputs", {
        description: "Wall length and height must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: "Wall Studs & Plates (Framing Lumber)",
      category: "finishes",
      quantity: 1,
      unit: "lot",
      unitCost: Math.round(lumberCost * 100) / 100,
      wastePercent: 0,
      notes: `${formatNumber(t.totalStuds)} studs @ ${v.spacingIn}″ O.C. + ${formatNumber(t.headerBoards + t.sillBoards)} header/sill boards + ${formatNumber(t.plateBoards)} 16-ft plates (${t.plateRuns} runs).`,
    });
    addItem({
      toolSlug: SLUG,
      title: `Drywall Wallboards (${v.sheetSize})`,
      category: "finishes",
      quantity: t.sheets,
      unit: "ea",
      unitCost: v.costPerSheet,
      wastePercent: 10,
      notes: `${formatNumber(t.netDrywallSqft)} sq ft net, ${v.sides} side(s), openings deducted.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Drywall Finishing (Mud & Tape)",
      category: "finishes",
      quantity: 1,
      unit: "lot",
      unitCost: Math.round(finishCost * 100) / 100,
      wastePercent: 0,
      notes: `${formatNumber(t.mudBuckets)} mud buckets + ${formatNumber(t.tapeRolls)} tape rolls (~500 sq ft coverage each).`,
    });
    toast.success("3 lines added to Master Bid Cart", {
      description: `Framing ${formatMoney(lumberCost)} · Boards ${formatMoney(sheetsCost)} · Finish ${formatMoney(finishCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="f-length"
        label="Total linear wall length"
        valueFeet={v.wallLengthFt}
        onChange={(f) => set("wallLengthFt", f)}
        minFeet={0}
      />
      <PresetStepper
        id="f-height"
        label="Wall height"
        value={v.wallHeightFt}
        onChange={(n) => set("wallHeightFt", n)}
        unit="ft"
        step={0.5}
        min={0}
        presets={[
          { label: "8'", value: 8 },
          { label: "9'", value: 9 },
          { label: "10'", value: 10 },
        ]}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={['16" O.C.', '24" O.C.']}
          active={v.spacingIn === 16 ? '16" O.C.' : '24" O.C.'}
          onChange={(l) => set("spacingIn", l.startsWith("16") ? 16 : 24)}
        />
      </div>

      <PresetStepper
        id="f-doors"
        label="Standard doors"
        value={v.doors}
        onChange={(n) => set("doors", n)}
        unit="ea"
        step={1}
        min={0}
        hint="Deducts 21 sq ft drywall · adds king/jack studs + double header."
      />
      <PresetStepper
        id="f-windows"
        label="Windows"
        value={v.windows}
        onChange={(n) => set("windows", n)}
        unit="ea"
        step={1}
        min={0}
        hint="Deducts 15 sq ft drywall · adds king/jack studs + header + sill."
      />
      <PresetStepper
        id="f-corners"
        label="Corners"
        value={v.corners}
        onChange={(n) => set("corners", n)}
        unit="ea"
        step={1}
        min={0}
        hint="+2 studs per corner."
      />
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Single top plate", "Double top plate"]}
          active={v.doubleTopPlate ? "Double top plate" : "Single top plate"}
          onChange={(l) => set("doubleTopPlate", l === "Double top plate")}
        />
      </div>

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["4×8 sheets", "4×12 sheets"]}
          active={v.sheetSize === "4x8" ? "4×8 sheets" : "4×12 sheets"}
          onChange={(l) => set("sheetSize", l === "4×8 sheets" ? "4x8" : "4x12")}
        />
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["1 side", "2 sides"]}
          active={v.sides === 1 ? "1 side" : "2 sides"}
          onChange={(l) => set("sides", l === "1 side" ? 1 : 2)}
        />
      </div>

      <CostInput
        id="f-stud"
        label="Cost per stud"
        value={v.costPerStud}
        onChange={(n) => set("costPerStud", n)}
        perUnit="$/stud"
      />
      <CostInput
        id="f-plate"
        label="Cost per plate (16 ft)"
        value={v.costPerPlate}
        onChange={(n) => set("costPerPlate", n)}
        perUnit="$/board"
      />
      <CostInput
        id="f-sheet"
        label="Cost per drywall sheet"
        value={v.costPerSheet}
        onChange={(n) => set("costPerSheet", n)}
        perUnit="$/sheet"
      />
      <CostInput
        id="f-mud"
        label="Cost per mud bucket"
        value={v.costPerMudBucket}
        onChange={(n) => set("costPerMudBucket", n)}
        perUnit="$/4.5 gal"
      />
      <CostInput
        id="f-tape"
        label="Cost per tape roll"
        value={v.costPerTapeRoll}
        onChange={(n) => set("costPerTapeRoll", n)}
        perUnit="$/250 ft"
      />

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="f-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="f-rate"
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
        label: "Total 2×4 wall studs",
      }}
      wastePercent={10}
      materials={materials}
      materialCosts={[
        {
          label: `Studs ${formatNumber(t.totalStuds)} × ${formatMoney(v.costPerStud)}`,
          amount: Math.round(studsCost * 100) / 100,
        },
        {
          label: `Plates ${formatNumber(t.plateBoards)} × ${formatMoney(v.costPerPlate)}`,
          amount: Math.round(platesCost * 100) / 100,
        },
        {
          label: `Sheets ${formatNumber(t.sheets)} × ${formatMoney(v.costPerSheet)}`,
          amount: Math.round(sheetsCost * 100) / 100,
        },
        {
          label: `Mud & tape ${formatNumber(t.mudBuckets)} + ${formatNumber(t.tapeRolls)}`,
          amount: Math.round(finishCost * 100) / 100,
        },
      ]}
      labor={v.laborHours > 0 ? { hours: v.laborHours, rate: v.laborRate } : null}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add 3 lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.totalStuds),
        unit: "studs",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
