/**
 * BuildCalc Pro — Flooring & Baseboard Trim Estimator (Phase 4C).
 *
 * Plank boxes, underlayment rolls, and 16-ft baseboard sticks.
 * Dispatches up to 3 lines: cartons, underlayment, trim moulding.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { flooringTakeoff } from "@/lib/math/flooring";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "flooring-trim-estimator";

const FLOORING_TYPES = [
  "Luxury vinyl plank",
  "Hardwood",
  "Laminate",
  "Tile-look vinyl",
] as const;

const BASEBOARD_STYLES = ['3½" colonial', '5¼" craftsman', '7" modern'] as const;

interface FlooringInputs extends Record<string, unknown> {
  flooringType: (typeof FLOORING_TYPES)[number];
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  sqftPerBox: number;
  wastePct: number;
  baseboardStyle: (typeof BASEBOARD_STYLES)[number];
  costPerBox: number;
  costPerUnderlaymentSqft: number;
  costPerBaseboardStick: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: FlooringInputs = {
  flooringType: "Luxury vinyl plank",
  areaMode: "dims",
  lengthFt: 20,
  widthFt: 15,
  netSqft: 300,
  sqftPerBox: 20,
  wastePct: 5,
  baseboardStyle: '3½" colonial',
  costPerBox: 55,
  costPerUnderlaymentSqft: 0.45,
  costPerBaseboardStick: 18,
  laborHours: 0,
  laborRate: 60,
};

export function FlooringTrimEstimatorTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<FlooringInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Flooring & Baseboard Trim Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const netArea = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = flooringTakeoff({
    netSqft: netArea,
    wastePct: v.wastePct,
    sqftPerBox: v.sqftPerBox,
    lengthFt: v.areaMode === "dims" ? v.lengthFt : 0,
    widthFt: v.areaMode === "dims" ? v.widthFt : 0,
  });
  const valid = netArea > 0;

  const boxesCost = t.boxes * v.costPerBox;
  const underlaymentCostPerRoll = 100 * v.costPerUnderlaymentSqft;
  const underlaymentCost = t.underlaymentRolls * underlaymentCostPerRoll;
  const trimCost = t.trimSticks * v.costPerBaseboardStick;
  const materialCost = boxesCost + underlaymentCost + trimCost;
  const laborTotal = v.laborHours * v.laborRate;
  const total = materialCost + laborTotal;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `${v.flooringType} cartons`,
      net: `${formatNumber(t.netSqft)} sq ft`,
      waste: `+${v.wastePct}%`,
      order: `${t.boxes} boxes`,
      note: `${v.sqftPerBox} sq ft/box · ${formatNumber(t.grossSqft)} sq ft gross`,
      highlight: true,
    },
    {
      label: "Acoustic underlayment",
      net: `${formatNumber(t.netSqft)} sq ft`,
      waste: "—",
      order: `${t.underlaymentRolls} rolls`,
      note: "100 sq ft rolls",
    },
    {
      label: `Baseboard — ${v.baseboardStyle}`,
      net: t.perimeterFt > 0 ? `${formatNumber(t.perimeterFt)} lin ft` : "—",
      waste: t.perimeterFt > 0 ? "+10%" : "—",
      order: t.perimeterFt > 0 ? `${t.trimSticks} sticks` : "—",
      note:
        t.perimeterFt > 0
          ? "16-ft sticks"
          : "Enter L × W for the trim takeoff",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.boxes <= 0) {
      toast.error("Check your inputs", {
        description: "Floor area must be greater than zero.",
      });
      return;
    }
    const lines: string[] = [];
    addItem({
      toolSlug: SLUG,
      title: `Flooring Cartons — ${v.flooringType}`,
      category: "finishes",
      quantity: t.boxes,
      unit: "ea",
      unitCost: v.costPerBox,
      wastePercent: v.wastePct,
      notes: `${formatNumber(t.netSqft)} sq ft net + ${v.wastePct}% waste · ${v.sqftPerBox} sq ft/box.`,
    });
    lines.push(`Flooring ${formatMoney(boxesCost)}`);
    addItem({
      toolSlug: SLUG,
      title: "Acoustic Underlayment",
      category: "finishes",
      quantity: t.underlaymentRolls,
      unit: "ea",
      unitCost: Math.round(underlaymentCostPerRoll * 100) / 100,
      wastePercent: 0,
      notes: `100 sq ft rolls @ ${formatMoney(v.costPerUnderlaymentSqft)}/sq ft.`,
    });
    lines.push(`Underlayment ${formatMoney(underlaymentCost)}`);
    if (t.trimSticks > 0) {
      addItem({
        toolSlug: SLUG,
        title: `Baseboard Trim Moulding — ${v.baseboardStyle}`,
        category: "finishes",
        quantity: t.trimSticks,
        unit: "ea",
        unitCost: v.costPerBaseboardStick,
        wastePercent: 10,
        notes: `${formatNumber(t.perimeterFt)} lin ft perimeter + 10% · 16-ft sticks.`,
      });
      lines.push(`Trim ${formatMoney(trimCost)}`);
    }
    toast.success(`${lines.length} lines added to Master Bid Cart`, {
      description: lines.join(" · "),
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={[...FLOORING_TYPES]}
          active={v.flooringType}
          onChange={(l) =>
            set("flooringType", l as FlooringInputs["flooringType"])
          }
        />
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
            id="fl-length"
            label="Room length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="fl-width"
            label="Room width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="fl-sqft"
          label="Floor area"
          value={v.netSqft}
          onChange={(n) => set("netSqft", n)}
          unit="sq ft"
          step={10}
          min={0}
          hint="Trim needs L × W — switch modes for baseboard."
        />
      )}

      <PresetStepper
        id="fl-box"
        label="Coverage per carton"
        value={v.sqftPerBox}
        onChange={(n) => set("sqftPerBox", n)}
        unit="sq ft"
        step={1}
        min={1}
      />
      <PresetStepper
        id="fl-waste"
        label="Cut waste"
        value={v.wastePct}
        onChange={(n) => set("wastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={50}
        presets={[
          { label: "5% straight", value: 5 },
          { label: "10% angle", value: 10 },
          { label: "15% diagonal", value: 15 },
        ]}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={[...BASEBOARD_STYLES]}
          active={v.baseboardStyle}
          onChange={(l) =>
            set("baseboardStyle", l as FlooringInputs["baseboardStyle"])
          }
        />
      </div>

      <CostInput
        id="fl-costbox"
        label="Cost per flooring box"
        value={v.costPerBox}
        onChange={(n) => set("costPerBox", n)}
        perUnit="$/box"
      />
      <CostInput
        id="fl-costunder"
        label="Underlayment"
        value={v.costPerUnderlaymentSqft}
        onChange={(n) => set("costPerUnderlaymentSqft", n)}
        perUnit="$/sq ft"
      />
      <CostInput
        id="fl-costtrim"
        label="Baseboard stick"
        value={v.costPerBaseboardStick}
        onChange={(n) => set("costPerBaseboardStick", n)}
        perUnit="$/16 ft"
      />

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="fl-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="fl-rate"
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
        value: String(t.boxes),
        unit: "BOXES",
        label: "Flooring cartons to order",
      }}
      wastePercent={v.wastePct}
      materials={materials}
      materialCosts={[
        {
          label: `Flooring — ${t.boxes} × ${formatMoney(v.costPerBox)}`,
          amount: Math.round(boxesCost * 100) / 100,
        },
        {
          label: `Underlayment — ${t.underlaymentRolls} × ${formatMoney(underlaymentCostPerRoll)}`,
          amount: Math.round(underlaymentCost * 100) / 100,
        },
        ...(t.trimSticks > 0
          ? [
              {
                label: `Trim — ${t.trimSticks} × ${formatMoney(v.costPerBaseboardStick)}`,
                amount: Math.round(trimCost * 100) / 100,
              },
            ]
          : []),
      ]}
      labor={v.laborHours > 0 ? { hours: v.laborHours, rate: v.laborRate } : null}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: String(t.boxes),
        unit: "boxes",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
