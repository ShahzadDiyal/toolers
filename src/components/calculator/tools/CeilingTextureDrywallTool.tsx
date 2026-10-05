/**
 * BuildCalc Pro Acoustic Texture, Popcorn & Drywall Mud Sizing (Batch 4F).
 *
 * Texture bags/buckets, PVA primer gallons, and mixing water from area,
 * style, and application depth. Dispatches 2 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  textureTakeoff,
  TEXTURE_STYLES,
  type TextureStyle,
  type TextureDepth,
} from "@/lib/math/mepAndFinishes";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "ceiling-texture-drywall";

interface TextureInputs extends Record<string, unknown> {
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  style: TextureStyle;
  depth: TextureDepth;
  costPerUnit: number;
  costPerPrimerGal: number;
}

const DEFAULTS: TextureInputs = {
  areaMode: "sqft",
  lengthFt: 20,
  widthFt: 15,
  netSqft: 900,
  style: "knockdown",
  depth: "medium",
  costPerUnit: 22,
  costPerPrimerGal: 28,
};

const STYLES = Object.entries(TEXTURE_STYLES) as [
  TextureStyle,
  { label: string; unit: string; unitSize: string; coverageSqft: number; dryMix: boolean },
][];
const DEPTHS: { label: string; value: TextureDepth }[] = [
  { label: "Light", value: "light" },
  { label: "Medium", value: "medium" },
  { label: "Heavy", value: "heavy" },
];

export function CeilingTextureDrywallTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<TextureInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Acoustic Texture, Popcorn & Drywall Mud Sizing",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const areaSqft = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = textureTakeoff({
    areaSqft,
    style: v.style,
    depth: v.depth,
  });
  const valid = areaSqft > 0;
  const styleMeta = TEXTURE_STYLES[v.style];

  const compoundCost = t.units * v.costPerUnit;
  const primerCost = t.primerGal * v.costPerPrimerGal;
  const total = compoundCost + primerCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `${styleMeta.label} ${styleMeta.unitSize}`,
      net: `${formatNumber(t.areaSqft)} sq ft`,
      waste: "+10%",
      order: `${formatNumber(t.units)} ${styleMeta.unit}`,
      note: `${v.depth} application · ≈${formatNumber(Math.round(styleMeta.coverageSqft * (v.depth === "light" ? 1.25 : v.depth === "heavy" ? 0.8 : 1)))} sq ft/unit`,
      highlight: true,
    },
    {
      label: "PVA drywall primer",
      net: `${formatNumber(t.areaSqft)} sq ft`,
      waste: "—",
      order: `${formatNumber(t.primerGal)} gal`,
      note: "350 sq ft/gal · seals texture before topcoat",
    },
    ...(t.waterGal > 0
      ? [
          {
            label: "Mixing water",
            net: `${formatNumber(t.units)} ${styleMeta.unit}`,
            waste: "—",
            order: `${formatNumber(t.waterGal)} gal`,
            note: "≈5 gal per dry-mix bag",
          } as MaterialRow,
        ]
      : []),
  ];

  const handleAdd = () => {
    if (!valid || t.units <= 0) {
      toast.error("Check your inputs", {
        description: "Surface area must be greater than zero.",
      });
      return;
    }
    const ctx = `${styleMeta.label} · ${formatNumber(t.areaSqft)} sq ft · ${v.depth} application`;
    addItem({
      toolSlug: SLUG,
      title: `Drywall Texture Compound ${styleMeta.unitSize} ${styleMeta.unit}`,
      category: "finishes",
      quantity: t.units,
      unit: styleMeta.unit === "buckets" ? "ea" : "bags",
      unitCost: v.costPerUnit,
      wastePercent: 10,
      notes: `${ctx}.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "PVA Drywall Primer Sealer",
      category: "finishes",
      quantity: t.primerGal,
      unit: "gal",
      unitCost: v.costPerPrimerGal,
      wastePercent: 0,
      notes: `${ctx} · 350 sq ft/gal.`,
    });
    toast.success("2 lines added to Master Bid Cart", {
      description: `Compound ${formatMoney(compoundCost)} · Primer ${formatMoney(primerCost)}`,
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
            id="tx-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="tx-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="tx-sqft"
          label="Surface area"
          value={v.netSqft}
          onChange={(n) => set("netSqft", n)}
          unit="sq ft"
          step={50}
          min={0}
        />
      )}

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Texture style
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Texture style">
          {STYLES.map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => set("style", key)}
              aria-pressed={v.style === key}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.style === key
                  ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                  : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]")
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={DEPTHS.map((d) => d.label)}
          active={DEPTHS.find((d) => d.value === v.depth)?.label ?? ""}
          onChange={(l) => set("depth", DEPTHS.find((d) => d.label === l)?.value ?? "medium")}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Light stretches coverage ~25% · heavy cuts it ~20%.
        </p>
      </div>

      <CostInput
        id="tx-costunit"
        label={styleMeta.dryMix ? "Dry texture mix bag" : "Joint compound bucket"}
        value={v.costPerUnit}
        onChange={(n) => set("costPerUnit", n)}
        perUnit={styleMeta.dryMix ? "$/50-lb" : "$/4.5-gal"}
      />
      <CostInput
        id="tx-costprimer"
        label="PVA primer"
        value={v.costPerPrimerGal}
        onChange={(n) => set("costPerPrimerGal", n)}
        perUnit="$/gal"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.units),
        unit: styleMeta.unit.toUpperCase(),
        label: `${styleMeta.unitSize} ${styleMeta.unit} to order`,
      }}
      wastePercent={10}
      materials={materials}
      materialCosts={[
        { label: `Compound ${formatNumber(t.units)} × ${formatMoney(v.costPerUnit)}`, amount: Math.round(compoundCost * 100) / 100 },
        { label: `Primer ${formatNumber(t.primerGal)} × ${formatMoney(v.costPerPrimerGal)}/gal`, amount: Math.round(primerCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add texture lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.units),
        unit: styleMeta.unit,
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
