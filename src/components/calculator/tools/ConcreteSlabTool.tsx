/**
 * BuildCalc Pro — Concrete Slab, Footing & Column Calculator (Phase 4A).
 *
 * Shapes: rectangular slab, circular column/pier, trench footing.
 * Cost modes: ready-mix ($/cu yd) or premix bags ($/bag). Real-time math,
 * auto-saved inputs, universal ResultsCard, master-estimate dispatch.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  calculateWithWaste,
  roundTo,
  roundUp,
  BAGS_80LB_PER_CUYD,
  BAGS_60LB_PER_CUYD,
} from "@/lib/math/units";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import {
  useToolActions,
} from "@/components/tools/useToolActions";

const SLUG = "concrete-slab";

type Shape = "rect" | "circle" | "trench";
type CostMode = "readymix" | "bags80" | "bags60";

interface ConcreteInputs extends Record<string, unknown> {
  shape: Shape;
  lengthFt: number;
  widthFt: number;
  thicknessIn: number;
  diameterFt: number;
  depthFt: number;
  trenchLengthFt: number;
  trenchWidthIn: number;
  trenchDepthIn: number;
  count: number;
  wastePercent: number;
  costMode: CostMode;
  costPerYard: number;
  costPerBag: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: ConcreteInputs = {
  shape: "rect",
  lengthFt: 20,
  widthFt: 12,
  thicknessIn: 4,
  diameterFt: 4,
  depthFt: 4,
  trenchLengthFt: 50,
  trenchWidthIn: 12,
  trenchDepthIn: 24,
  count: 1,
  wastePercent: 10,
  costMode: "readymix",
  costPerYard: 165,
  costPerBag: 5.5,
  laborHours: 0,
  laborRate: 65,
};

const SHAPES: { id: Shape; label: string }[] = [
  { id: "rect", label: "Rectangular slab" },
  { id: "circle", label: "Circular column" },
  { id: "trench", label: "Trench footing" },
];

const COST_MODES: { id: CostMode; label: string }[] = [
  { id: "readymix", label: "Ready-mix" },
  { id: "bags80", label: "80-lb bags" },
  { id: "bags60", label: "60-lb bags" },
];

const SHAPE_TITLES: Record<Shape, string> = {
  rect: "Concrete Slab",
  circle: "Concrete Column",
  trench: "Trench Footing",
};

export function ConcreteSlabTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<ConcreteInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  // Layout action bar wiring.
  useToolActions({
    toolTitle: "Concrete Calculator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math (pure, real-time) ---------------- */
  let cuFtPerUnit = 0;
  if (v.shape === "rect") {
    cuFtPerUnit = (v.lengthFt * v.widthFt * v.thicknessIn) / 12;
  } else if (v.shape === "circle") {
    const r = v.diameterFt / 2;
    cuFtPerUnit = Math.PI * r * r * v.depthFt;
  } else {
    cuFtPerUnit =
      (v.trenchLengthFt * v.trenchWidthIn * v.trenchDepthIn) / 1728;
  }
  const valid = cuFtPerUnit > 0 && v.count > 0;
  const netYards = valid ? roundTo((cuFtPerUnit / 27) * v.count, 4) : 0;
  const { gross: grossYards, wasteAmount: wasteYards } = calculateWithWaste(
    netYards,
    v.wastePercent,
  );
  const bags80 = roundUp(grossYards * BAGS_80LB_PER_CUYD);
  const bags60 = roundUp(grossYards * BAGS_60LB_PER_CUYD);
  const truckloads = grossYards > 0 ? Math.ceil(grossYards / 10) : 0;
  const shortLoad = grossYards > 0 && grossYards < 4;

  /* ---------------- Cost ---------------- */
  let materialLabel = "";
  let materialCost = 0;
  let lineQty = 0;
  let lineUnit = "";
  let lineUnitCost = 0;
  if (v.costMode === "readymix") {
    materialCost = roundTo(grossYards * v.costPerYard, 2);
    materialLabel = `Ready-mix — ${formatNumber(grossYards)} cu yd × ${formatMoney(v.costPerYard)}`;
    lineQty = grossYards;
    lineUnit = "cu yd";
    lineUnitCost = v.costPerYard;
  } else if (v.costMode === "bags80") {
    materialCost = roundTo(bags80 * v.costPerBag, 2);
    materialLabel = `80-lb bags — ${bags80} × ${formatMoney(v.costPerBag)}`;
    lineQty = bags80;
    lineUnit = "bags";
    lineUnitCost = v.costPerBag;
  } else {
    materialCost = roundTo(bags60 * v.costPerBag, 2);
    materialLabel = `60-lb bags — ${bags60} × ${formatMoney(v.costPerBag)}`;
    lineQty = bags60;
    lineUnit = "bags";
    lineUnitCost = v.costPerBag;
  }
  const laborTotal = roundTo(v.laborHours * v.laborRate, 2);
  const total = roundTo(materialCost + laborTotal, 2);

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label:
        v.costMode === "readymix"
          ? "Ready-mix concrete"
          : v.costMode === "bags80"
            ? "80-lb premix bags"
            : "60-lb premix bags",
      net:
        v.costMode === "readymix"
          ? `${formatNumber(netYards)} cu yd`
          : `${formatNumber(Math.round(netYards * (v.costMode === "bags80" ? BAGS_80LB_PER_CUYD : BAGS_60LB_PER_CUYD)))} bags`,
      waste:
        v.costMode === "readymix"
          ? `+${formatNumber(wasteYards)} cu yd`
          : `+${formatNumber(
              (v.costMode === "bags80" ? bags80 : bags60) -
                Math.round(
                  netYards *
                    (v.costMode === "bags80"
                      ? BAGS_80LB_PER_CUYD
                      : BAGS_60LB_PER_CUYD),
                ),
            )} bags`,
      order:
        v.costMode === "readymix"
          ? `${formatNumber(grossYards)} cu yd`
          : `${formatNumber(v.costMode === "bags80" ? bags80 : bags60)} bags`,
      note:
        v.costMode === "readymix"
          ? truckloads > 0
            ? `${truckloads} truckload${truckloads === 1 ? "" : "s"}${
                shortLoad ? " — short-load fee likely" : ""
              }`
            : undefined
          : "Rounded up — no split bags",
      highlight: true,
    },
    {
      label: "80-lb bags (alt.)",
      net: `${formatNumber(Math.round(netYards * BAGS_80LB_PER_CUYD))} bags`,
      waste: `+${v.wastePercent}%`,
      order: `${formatNumber(bags80)} bags`,
    },
    {
      label: "60-lb bags (alt.)",
      net: `${formatNumber(Math.round(netYards * BAGS_60LB_PER_CUYD))} bags`,
      waste: `+${v.wastePercent}%`,
      order: `${formatNumber(bags60)} bags`,
    },
  ];

  const handleAdd = () => {
    if (!valid || lineQty <= 0) {
      toast.error("Check your inputs", {
        description: "Dimensions must be greater than zero.",
      });
      return;
    }
    const title =
      v.costMode === "readymix"
        ? `Concrete Pour (Ready-Mix) — ${SHAPE_TITLES[v.shape]}`
        : `Concrete (${v.costMode === "bags80" ? "80-lb" : "60-lb"} bags) — ${SHAPE_TITLES[v.shape]}`;
    addItem({
      toolSlug: SLUG,
      title,
      category: "concrete",
      quantity: lineQty,
      unit: lineUnit,
      unitCost: lineUnitCost,
      wastePercent: v.wastePercent,
      notes: `Net ${formatNumber(netYards)} cu yd + ${v.wastePercent}% waste.${
        v.costMode === "readymix" && truckloads > 0
          ? ` ${truckloads} truckload${truckloads === 1 ? "" : "s"}.`
          : ""
      }`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${title} — ${formatMoney(roundTo(lineQty * lineUnitCost, 2))}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={SHAPES.map((s) => s.label)}
          active={SHAPES.find((s) => s.id === v.shape)!.label}
          onChange={(label) =>
            set("shape", SHAPES.find((s) => s.label === label)!.id)
          }
        />
      </div>

      {v.shape === "rect" && (
        <>
          <DimensionInput
            id="c-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
            hint="Slab length."
          />
          <DimensionInput
            id="c-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
          <PresetStepper
            id="c-thick"
            label="Thickness"
            value={v.thicknessIn}
            onChange={(n) => set("thicknessIn", n)}
            unit="in"
            step={0.5}
            min={0}
            presets={[
              { label: '3½"', value: 3.5 },
              { label: '4"', value: 4 },
              { label: '6"', value: 6 },
              { label: '8"', value: 8 },
            ]}
          />
        </>
      )}

      {v.shape === "circle" && (
        <>
          <DimensionInput
            id="c-dia"
            label="Diameter"
            valueFeet={v.diameterFt}
            onChange={(f) => set("diameterFt", f)}
            minFeet={0}
            hint="Sonotube / pier diameter."
          />
          <DimensionInput
            id="c-depth"
            label="Depth"
            valueFeet={v.depthFt}
            onChange={(f) => set("depthFt", f)}
            minFeet={0}
          />
        </>
      )}

      {v.shape === "trench" && (
        <>
          <DimensionInput
            id="c-tlen"
            label="Trench length"
            valueFeet={v.trenchLengthFt}
            onChange={(f) => set("trenchLengthFt", f)}
            minFeet={0}
          />
          <PresetStepper
            id="c-twid"
            label="Trench width"
            value={v.trenchWidthIn}
            onChange={(n) => set("trenchWidthIn", n)}
            unit="in"
            step={1}
            min={0}
            presets={[
              { label: '8"', value: 8 },
              { label: '12"', value: 12 },
              { label: '18"', value: 18 },
              { label: '24"', value: 24 },
            ]}
          />
          <PresetStepper
            id="c-tdep"
            label="Trench depth"
            value={v.trenchDepthIn}
            onChange={(n) => set("trenchDepthIn", n)}
            unit="in"
            step={1}
            min={0}
          />
        </>
      )}

      <PresetStepper
        id="c-count"
        label="Quantity / count"
        value={v.count}
        onChange={(n) => set("count", n)}
        unit="ea"
        step={1}
        min={1}
        hint="How many identical pours."
      />
      <PresetStepper
        id="c-waste"
        label="Waste factor"
        value={v.wastePercent}
        onChange={(n) => set("wastePercent", n)}
        unit="%"
        step={1}
        min={0}
        max={50}
        presets={[
          { label: "5%", value: 5 },
          { label: "10%", value: 10 },
          { label: "15%", value: 15 },
        ]}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={COST_MODES.map((c) => c.label)}
          active={COST_MODES.find((c) => c.id === v.costMode)!.label}
          onChange={(label) =>
            set("costMode", COST_MODES.find((c) => c.label === label)!.id)
          }
        />
      </div>
      {v.costMode === "readymix" ? (
        <CostInput
          id="c-yard"
          label="Ready-mix price"
          value={v.costPerYard}
          onChange={(n) => set("costPerYard", n)}
          perUnit="$/cu yd"
          hint="Your supplier's per-yard rate."
        />
      ) : (
        <CostInput
          id="c-bag"
          label={v.costMode === "bags80" ? "80-lb bag price" : "60-lb bag price"}
          value={v.costPerBag}
          onChange={(n) => set("costPerBag", n)}
          perUnit="$/bag"
        />
      )}

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="c-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="c-rate"
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
        value: formatNumber(
          v.costMode === "readymix" ? grossYards : v.costMode === "bags80" ? bags80 : bags60,
        ),
        unit: v.costMode === "readymix" ? "CU YDS" : "BAGS",
        label: "Order quantity",
      }}
      wastePercent={v.wastePercent}
      materials={materials}
      materialCosts={[{ label: materialLabel, amount: materialCost }]}
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
        value: formatNumber(
          v.costMode === "readymix" ? grossYards : v.costMode === "bags80" ? bags80 : bags60,
        ),
        unit: v.costMode === "readymix" ? "cu yd" : "bags",
        label: `Total · ${formatMoney(total)}`,
      }}
    />
  );
}
