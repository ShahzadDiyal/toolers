/**
 * BuildCalc Pro — Tile, Thinset & Grout Calculator (Phase 4B).
 *
 * Coverage, box counts, thinset bags, and grout from the dry-density formula.
 * Dispatches 3 lines: tile cartons, thinset mortar, grout compound.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { tileTakeoff, groutTypeForJoint, type GroutType } from "@/lib/math/tile";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "tile-grout-calculator";

interface TileInputs extends Record<string, unknown> {
  surfaceType: "floor" | "wall";
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  tileLengthIn: number;
  tileWidthIn: number;
  thicknessIn: number;
  sqftPerBox: number;
  jointIn: number;
  groutType: GroutType;
  wastePct: number;
  costPerBox: number;
  costPerThinsetBag: number;
  costPerGroutBag: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: TileInputs = {
  surfaceType: "floor",
  areaMode: "dims",
  lengthFt: 15,
  widthFt: 10,
  netSqft: 150,
  tileLengthIn: 12,
  tileWidthIn: 12,
  thicknessIn: 0.375,
  sqftPerBox: 15,
  jointIn: 1 / 8,
  groutType: "Sanded",
  wastePct: 10,
  costPerBox: 42,
  costPerThinsetBag: 18,
  costPerGroutBag: 24,
  laborHours: 0,
  laborRate: 65,
};

const TILE_PRESETS = [
  { label: "12×12", l: 12, w: 12 },
  { label: "12×24", l: 12, w: 24 },
  { label: "6×24", l: 6, w: 24 },
  { label: "3×6 subway", l: 3, w: 6 },
];

const JOINTS = [
  { label: '1/16″', value: 1 / 16 },
  { label: '1/8″', value: 1 / 8 },
  { label: '3/16″', value: 3 / 16 },
  { label: '1/4″', value: 1 / 4 },
];

export function TileGroutCalculatorTool() {
  const { values: v, set, setValues, resetToDefaults } = useToolAutoSave<TileInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Tile, Thinset & Grout Calculator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const netArea = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = tileTakeoff({
    netSqft: netArea,
    wastePct: v.wastePct,
    sqftPerBox: v.sqftPerBox,
    tileLengthIn: v.tileLengthIn,
    tileWidthIn: v.tileWidthIn,
    jointIn: v.jointIn,
    thicknessIn: v.thicknessIn,
  });
  const valid = netArea > 0;

  const boxesCost = t.boxes * v.costPerBox;
  const thinsetCost = t.thinsetBags * v.costPerThinsetBag;
  const groutCost = t.groutBags * v.costPerGroutBag;
  const materialCost = boxesCost + thinsetCost + groutCost;
  const laborTotal = v.laborHours * v.laborRate;
  const total = materialCost + laborTotal;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `Tile — ${v.tileLengthIn}×${v.tileWidthIn}″`,
      net: `${formatNumber(t.netSqft)} sq ft`,
      waste: `+${v.wastePct}%`,
      order: `${formatNumber(t.boxes)} boxes`,
      note: `${v.sqftPerBox} sq ft/box`,
      highlight: true,
    },
    {
      label: "Thinset mortar",
      net: `${formatNumber(t.grossSqft)} sq ft`,
      waste: "—",
      order: `${formatNumber(t.thinsetBags)} bags`,
      note: "50-lb bags · ¼×⅜″ notch",
    },
    {
      label: `${v.groutType} grout`,
      net: `${formatNumber(t.groutWeightLb)} lbs`,
      waste: "—",
      order: `${formatNumber(t.groutBags)} bags`,
      note: "25-lb bags · dry-density formula",
      highlight: true,
    },
    {
      label: "Tile spacers",
      net: "—",
      waste: "—",
      order: `${formatNumber(t.spacerBags)} bags`,
      note: "Est. 1 bag per 200 sq ft",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.boxes <= 0) {
      toast.error("Check your inputs", {
        description: "Tile area must be greater than zero.",
      });
      return;
    }
    const ctx = `${v.surfaceType === "floor" ? "Floor" : "Shower/wall"} · ${v.tileLengthIn}×${v.tileWidthIn}″ tile`;
    addItem({
      toolSlug: SLUG,
      title: `Tile Cartons — ${v.tileLengthIn}×${v.tileWidthIn}″`,
      category: "finishes",
      quantity: t.boxes,
      unit: "ea",
      unitCost: v.costPerBox,
      wastePercent: v.wastePct,
      notes: `${ctx} · ${formatNumber(t.netSqft)} sq ft net + ${v.wastePct}% waste.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Thinset Mortar (50-lb bags)",
      category: "finishes",
      quantity: t.thinsetBags,
      unit: "ea",
      unitCost: v.costPerThinsetBag,
      wastePercent: 0,
      notes: `${ctx} · ¼×⅜″ notch trowel coverage.`,
    });
    addItem({
      toolSlug: SLUG,
      title: `Grout Compound — ${v.groutType} (25-lb bags)`,
      category: "finishes",
      quantity: t.groutBags,
      unit: "ea",
      unitCost: v.costPerGroutBag,
      wastePercent: 0,
      notes: `${ctx} · ${formatNumber(t.groutWeightLb)} lbs dry grout · ${JOINTS.find((j) => Math.abs(j.value - v.jointIn) < 1e-9)?.label ?? v.jointIn + "″"} joints.`,
    });
    toast.success("3 lines added to Master Bid Cart", {
      description: `Tile ${formatMoney(boxesCost)} · Thinset ${formatMoney(thinsetCost)} · Grout ${formatMoney(groutCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const jointLabel =
    JOINTS.find((j) => Math.abs(j.value - v.jointIn) < 1e-9)?.label ?? "Custom";

  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Floor", "Shower / wall"]}
          active={v.surfaceType === "floor" ? "Floor" : "Shower / wall"}
          onChange={(l) => set("surfaceType", l === "Floor" ? "floor" : "wall")}
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
            id="t-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="t-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="t-sqft"
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
          Tile size
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tile size presets">
          {TILE_PRESETS.map((p) => {
            const active = v.tileLengthIn === p.l && v.tileWidthIn === p.w;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setValues({ tileLengthIn: p.l, tileWidthIn: p.w })}
                aria-pressed={active}
                className={
                  "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                  (active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <PresetStepper
            id="t-tl"
            label="Tile length"
            value={v.tileLengthIn}
            onChange={(n) => set("tileLengthIn", n)}
            unit="in"
            step={1}
            min={0}
          />
          <PresetStepper
            id="t-tw"
            label="Tile width"
            value={v.tileWidthIn}
            onChange={(n) => set("tileWidthIn", n)}
            unit="in"
            step={1}
            min={0}
          />
          <PresetStepper
            id="t-th"
            label="Tile thickness"
            value={v.thicknessIn}
            onChange={(n) => set("thicknessIn", n)}
            unit="in"
            step={0.125}
            min={0}
            presets={[
              { label: '1/4"', value: 0.25 },
              { label: '3/8"', value: 0.375 },
              { label: '1/2"', value: 0.5 },
            ]}
          />
        </div>
      </div>

      <PresetStepper
        id="t-box"
        label="Coverage per box"
        value={v.sqftPerBox}
        onChange={(n) => set("sqftPerBox", n)}
        unit="sq ft"
        step={1}
        min={1}
      />
      <PresetStepper
        id="t-waste"
        label="Cut waste"
        value={v.wastePct}
        onChange={(n) => set("wastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={50}
        presets={[
          { label: "10% straight", value: 10 },
          { label: "15% diagonal", value: 15 },
        ]}
      />

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Grout joint width
          <span className="ml-2 font-mono normal-case tracking-normal text-amber-300">
            {jointLabel} → {groutTypeForJoint(v.jointIn)} recommended
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Grout joint width">
          {JOINTS.map((j) => (
            <button
              key={j.label}
              type="button"
              onClick={() => {
                set("jointIn", j.value);
                set("groutType", groutTypeForJoint(j.value));
              }}
              aria-pressed={Math.abs(v.jointIn - j.value) < 1e-9}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (Math.abs(v.jointIn - j.value) < 1e-9
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {j.label}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Sanded grout", "Unsanded grout"]}
          active={v.groutType === "Sanded" ? "Sanded grout" : "Unsanded grout"}
          onChange={(l) => set("groutType", l === "Sanded grout" ? "Sanded" : "Unsanded")}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Sanded for joints ≥ ⅛″ · unsanded under ⅛″ to avoid scratching tile.
        </p>
      </div>

      <CostInput
        id="t-costbox"
        label="Cost per tile box"
        value={v.costPerBox}
        onChange={(n) => set("costPerBox", n)}
        perUnit="$/box"
      />
      <CostInput
        id="t-costthin"
        label="Cost per thinset bag"
        value={v.costPerThinsetBag}
        onChange={(n) => set("costPerThinsetBag", n)}
        perUnit="$/50 lb"
      />
      <CostInput
        id="t-costgrout"
        label="Cost per grout bag"
        value={v.costPerGroutBag}
        onChange={(n) => set("costPerGroutBag", n)}
        perUnit="$/25 lb"
      />

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="t-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="t-rate"
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
        value: formatNumber(t.boxes),
        unit: "BOXES",
        label: "Tile cartons to order",
      }}
      wastePercent={v.wastePct}
      materials={materials}
      materialCosts={[
        {
          label: `Tile — ${formatNumber(t.boxes)} × ${formatMoney(v.costPerBox)}`,
          amount: Math.round(boxesCost * 100) / 100,
        },
        {
          label: `Thinset — ${formatNumber(t.thinsetBags)} × ${formatMoney(v.costPerThinsetBag)}`,
          amount: Math.round(thinsetCost * 100) / 100,
        },
        {
          label: `Grout — ${formatNumber(t.groutBags)} × ${formatMoney(v.costPerGroutBag)}`,
          amount: Math.round(groutCost * 100) / 100,
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
        value: formatNumber(t.boxes),
        unit: "boxes",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
