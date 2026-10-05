/**
 * BuildCalc Pro Interlocking Paver, Bedding & Polymeric Sand (Batch 4E).
 *
 * Paver units, crushed base tons, 1" screed sand, and polymeric joint sand.
 * Dispatches 3 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  paverTakeoff,
  PAVER_SIZES,
  type PaverSize,
  type PaverJoint,
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

const SLUG = "paver-patio-sand";

interface PaverInputs extends Record<string, unknown> {
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  paverSize: PaverSize;
  baseDepthIn: number;
  joint: PaverJoint;
  wastePct: number;
  costPerPaverSqft: number;
  costPerTonBase: number;
  costPerPolyBag: number;
}

const DEFAULTS: PaverInputs = {
  areaMode: "dims",
  lengthFt: 20,
  widthFt: 14,
  netSqft: 280,
  paverSize: "4x8",
  baseDepthIn: 4,
  joint: "narrow",
  wastePct: 5,
  costPerPaverSqft: 6.5,
  costPerTonBase: 52,
  costPerPolyBag: 24,
};

const SIZES = Object.entries(PAVER_SIZES) as [
  PaverSize,
  { label: string; lIn: number; wIn: number },
][];

export function PaverPatioSandTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<PaverInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Interlocking Paver, Bedding & Polymeric Sand",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const areaSqft = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = paverTakeoff({
    areaSqft,
    paverSize: v.paverSize,
    baseDepthIn: v.baseDepthIn,
    joint: v.joint,
    wastePct: v.wastePct,
  });
  const valid = areaSqft > 0;
  const size = PAVER_SIZES[v.paverSize];

  const paverCost = t.grossAreaSqft * v.costPerPaverSqft;
  const baseCost = t.baseTons * v.costPerTonBase;
  const polyCost = t.polySandBags * v.costPerPolyBag;
  const beddingCost = t.beddingTons * v.costPerTonBase;
  const total = paverCost + baseCost + polyCost + beddingCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `Pavers ${size.label}`,
      net: `${formatNumber(t.netAreaSqft)} sq ft`,
      waste: `+${v.wastePct}%`,
      order: `${formatNumber(t.paverCount)} units`,
      note: `${formatNumber(t.grossAreaSqft)} sq ft gross · ${size.lIn}×${size.wIn}″`,
      highlight: true,
    },
    {
      label: `Crushed base ${formatNumber(v.baseDepthIn)}″ #57 / road base`,
      net: `${formatNumber(t.netAreaSqft)} sq ft`,
      waste: "+10%",
      order: `${formatNumber(t.baseTons)} tons`,
      note: "1.6 tons/cu yd compacted",
    },
    {
      label: 'Bedding sand 1″ screed',
      net: `${formatNumber(t.netAreaSqft)} sq ft`,
      waste: "—",
      order: `${formatNumber(t.beddingTons)} tons`,
      note: "ICPI 1-in screed bed · 1.35 tons/cu yd",
    },
    {
      label: `Polymeric sand 50-lb bags (${v.joint === "narrow" ? '1/8″' : '3/8″'} joints)`,
      net: `${formatNumber(t.grossAreaSqft)} sq ft`,
      waste: "—",
      order: `${formatNumber(t.polySandBags)} bags`,
      note: v.joint === "narrow" ? "1 bag per 75 sq ft" : "1 bag per 35 sq ft",
      highlight: true,
    },
  ];

  const handleAdd = () => {
    if (!valid || t.paverCount <= 0) {
      toast.error("Check your inputs", {
        description: "Patio area must be greater than zero.",
      });
      return;
    }
    const ctx = `${formatNumber(t.netAreaSqft)} sq ft patio · ${size.label} · ${formatNumber(v.baseDepthIn)}″ base`;
    addItem({
      toolSlug: SLUG,
      title: `Interlocking Concrete Pavers ${size.label}`,
      category: "site-exterior",
      quantity: Math.round(t.grossAreaSqft * 10) / 10,
      unit: "sq ft",
      unitCost: v.costPerPaverSqft,
      wastePercent: v.wastePct,
      notes: `${ctx} · ${formatNumber(t.paverCount)} units.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Crushed Stone Base Course",
      category: "site-exterior",
      quantity: t.baseTons,
      unit: "tons",
      unitCost: v.costPerTonBase,
      wastePercent: 0,
      notes: `${ctx} · ${formatNumber(t.beddingTons)} tons bedding sand incl. at same rate.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Polymeric Joint Sand 50-lb bags",
      category: "site-exterior",
      quantity: t.polySandBags,
      unit: "bags",
      unitCost: v.costPerPolyBag,
      wastePercent: 0,
      notes: `${ctx} · ${v.joint === "narrow" ? "1/8" : "3/8"}″ joints.`,
    });
    toast.success("3 lines added to Master Bid Cart", {
      description: `Pavers ${formatMoney(paverCost)} · Base ${formatMoney(baseCost + beddingCost)} · Poly sand ${formatMoney(polyCost)}`,
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
            id="pv-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="pv-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="pv-sqft"
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
          Paver size
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Paver size">
          {SIZES.map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => set("paverSize", key)}
              aria-pressed={v.paverSize === key}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.paverSize === key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={['4" base walkway / patio', '6" base driveway / heavy']}
          active={v.baseDepthIn === 4 ? '4" base walkway / patio' : '6" base driveway / heavy'}
          onChange={(l) => set("baseDepthIn", l.startsWith('4"') ? 4 : 6)}
        />
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={['Narrow 1/8" joints', 'Wide 3/8" joints']}
          active={v.joint === "narrow" ? 'Narrow 1/8" joints' : 'Wide 3/8" joints'}
          onChange={(l) => set("joint", l.startsWith("Narrow") ? "narrow" : "wide")}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Bedding sand is a fixed 1″ screed bed per ICPI spec.
        </p>
      </div>

      <PresetStepper
        id="pv-waste"
        label="Cut waste"
        value={v.wastePct}
        onChange={(n) => set("wastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={30}
        presets={[
          { label: "5% square", value: 5 },
          { label: "10% curves", value: 10 },
        ]}
      />

      <CostInput
        id="pv-costpaver"
        label="Paver cost"
        value={v.costPerPaverSqft}
        onChange={(n) => set("costPerPaverSqft", n)}
        perUnit="$/sq ft"
      />
      <CostInput
        id="pv-costbase"
        label="Base & bedding stone"
        value={v.costPerTonBase}
        onChange={(n) => set("costPerTonBase", n)}
        perUnit="$/ton"
      />
      <CostInput
        id="pv-costpoly"
        label="Polymeric sand bag"
        value={v.costPerPolyBag}
        onChange={(n) => set("costPerPolyBag", n)}
        perUnit="$/50 lb"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.paverCount),
        unit: "PAVERS",
        label: "Paver units to order",
      }}
      wastePercent={v.wastePct}
      materials={materials}
      materialCosts={[
        { label: `Pavers ${formatNumber(t.grossAreaSqft)} × ${formatMoney(v.costPerPaverSqft)}/sq ft`, amount: Math.round(paverCost * 100) / 100 },
        { label: `Base stone ${formatNumber(t.baseTons)} × ${formatMoney(v.costPerTonBase)}/ton`, amount: Math.round((baseCost + beddingCost) * 100) / 100 },
        { label: `Poly sand ${formatNumber(t.polySandBags)} × ${formatMoney(v.costPerPolyBag)}`, amount: Math.round(polyCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add paver lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.paverCount),
        unit: "pavers",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
