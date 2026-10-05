/**
 * BuildCalc Pro — CMU Block, Mortar & Core-Fill Grout (Batch 4D).
 *
 * Block count from wall area, Type S mortar bags, core-fill grout yards,
 * and bond-beam rebar sticks. Dispatches up to 4 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  cmuTakeoff,
  type CmuBlockSize,
  type CmuCoreFill,
} from "@/lib/math/earthwork";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "cmu-block-mortar";

interface CmuInputs extends Record<string, unknown> {
  wallLengthFt: number;
  wallHeightFt: number;
  blockSize: CmuBlockSize;
  coreFill: CmuCoreFill;
  bondBeamCourses: number;
  blockWastePct: number;
  mortarWastePct: number;
  costPerBlock: number;
  costPerMortarBag: number;
  costPerGroutYd: number;
  costPerRebarStick: number;
}

const DEFAULTS: CmuInputs = {
  wallLengthFt: 40,
  wallHeightFt: 8,
  blockSize: "8x8x16",
  coreFill: "none",
  bondBeamCourses: 0,
  blockWastePct: 5,
  mortarWastePct: 10,
  costPerBlock: 2.85,
  costPerMortarBag: 9.5,
  costPerGroutYd: 165,
  costPerRebarStick: 11,
};

const BLOCK_SIZES: { label: string; value: CmuBlockSize }[] = [
  { label: '8×8×16', value: "8x8x16" },
  { label: '6×8×16', value: "6x8x16" },
  { label: '12×8×16', value: "12x8x16" },
];

const CORE_FILLS: { label: string; value: CmuCoreFill; hint: string }[] = [
  { label: "None", value: "none", hint: "Hollow wall" },
  { label: "Solid", value: "solid", hint: "Every core" },
  { label: '24″ O.C.', value: "oc24", hint: "Every 3rd core" },
  { label: '32″ O.C.', value: "oc32", hint: "Every 4th core" },
  { label: '48″ O.C.', value: "oc48", hint: "Every 6th core" },
];

export function CmuBlockMortarTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<CmuInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "CMU Block, Mortar & Core-Fill Grout",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = cmuTakeoff({
    wallLengthFt: v.wallLengthFt,
    wallHeightFt: v.wallHeightFt,
    blockSize: v.blockSize,
    coreFill: v.coreFill,
    bondBeamCourses: v.bondBeamCourses,
    blockWastePct: v.blockWastePct,
    mortarWastePct: v.mortarWastePct,
  });
  const valid = v.wallLengthFt > 0 && v.wallHeightFt > 0;

  const blockCost = t.orderBlocks * v.costPerBlock;
  const mortarCost = t.mortarBags * v.costPerMortarBag;
  const groutCost = t.groutCuYd * v.costPerGroutYd;
  const rebarCost = t.bondBeamSticks * v.costPerRebarStick;
  const materialCost = blockCost + mortarCost + groutCost + rebarCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `CMU block — ${v.blockSize.replace("x", "×").replace("x", "×")}″`,
      net: `${formatNumber(t.netBlocks)} ea`,
      waste: `+${v.blockWastePct}%`,
      order: `${formatNumber(t.orderBlocks)} blocks`,
      note: `≈112.5 blocks / 100 sq ft · ${formatNumber(t.wallAreaSqft)} sq ft wall`,
      highlight: true,
    },
    {
      label: "Type S mortar — 80-lb bags",
      net: `${formatNumber(Math.ceil(t.orderBlocks / 30))} bags`,
      waste: `+${v.mortarWastePct}%`,
      order: `${formatNumber(t.mortarBags)} bags`,
      note: "1 bag per 30 blocks",
    },
    {
      label: "Core-fill grout",
      net: `${formatNumber(t.groutCuYd)} cu yd`,
      waste: "—",
      order: `${formatNumber(t.groutCuYd)} cu yd`,
      note:
        v.coreFill === "none" && v.bondBeamCourses === 0
          ? "No grout specified"
          : `${CORE_FILLS.find((c) => c.value === v.coreFill)?.label} cores` +
            (v.bondBeamCourses > 0 ? ` + ${v.bondBeamCourses} bond beam course${v.bondBeamCourses > 1 ? "s" : ""}` : ""),
      highlight: t.groutCuYd > 0,
    },
    ...(t.bondBeamSticks > 0
      ? [
          {
            label: "Bond beam rebar — #4 × 20 ft",
            net: `${v.bondBeamCourses} course${v.bondBeamCourses > 1 ? "s" : ""}`,
            waste: "—",
            order: `${formatNumber(t.bondBeamSticks)} sticks`,
            note: "2 bars continuous per beam",
          } as MaterialRow,
        ]
      : []),
  ];

  const handleAdd = () => {
    if (!valid || t.orderBlocks <= 0) {
      toast.error("Check your inputs", {
        description: "Wall length and height must be greater than zero.",
      });
      return;
    }
    const ctx = `${formatNumber(v.wallLengthFt)}×${formatNumber(v.wallHeightFt)} ft wall · ${v.blockSize.replace("x", "×").replace("x", "×")}″ CMU`;
    let lines = 0;
    addItem({
      toolSlug: SLUG,
      title: `CMU Concrete Blocks — ${v.blockSize}`,
      category: "concrete",
      quantity: t.orderBlocks,
      unit: "ea",
      unitCost: v.costPerBlock,
      wastePercent: v.blockWastePct,
      notes: `${ctx} · ${formatNumber(t.wallAreaSqft)} sq ft.`,
    });
    lines++;
    addItem({
      toolSlug: SLUG,
      title: "Type S Mortar — 80-lb bags",
      category: "concrete",
      quantity: t.mortarBags,
      unit: "bags",
      unitCost: v.costPerMortarBag,
      wastePercent: v.mortarWastePct,
      notes: `${ctx} · 1 bag per 30 blocks.`,
    });
    lines++;
    if (t.groutCuYd > 0) {
      addItem({
        toolSlug: SLUG,
        title: "Core-Fill Grout",
        category: "concrete",
        quantity: t.groutCuYd,
        unit: "cu yd",
        unitCost: v.costPerGroutYd,
        wastePercent: 0,
        notes: `${ctx} · ${CORE_FILLS.find((c) => c.value === v.coreFill)?.label} cores.`,
      });
      lines++;
    }
    if (t.bondBeamSticks > 0) {
      addItem({
        toolSlug: SLUG,
        title: "Bond Beam Rebar — #4 × 20 ft sticks",
        category: "concrete",
        quantity: t.bondBeamSticks,
        unit: "ea",
        unitCost: v.costPerRebarStick,
        wastePercent: 0,
        notes: `${ctx} · ${v.bondBeamCourses} bond beam course${v.bondBeamCourses > 1 ? "s" : ""}, 2 bars continuous.`,
      });
      lines++;
    }
    toast.success(`${lines} line${lines > 1 ? "s" : ""} added to Master Bid Cart`, {
      description: `Blocks ${formatMoney(blockCost)} · Mortar ${formatMoney(mortarCost)}${t.groutCuYd > 0 ? ` · Grout ${formatMoney(groutCost)}` : ""}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="cmu-length"
        label="Wall length"
        valueFeet={v.wallLengthFt}
        onChange={(f) => set("wallLengthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="cmu-height"
        label="Wall height"
        valueFeet={v.wallHeightFt}
        onChange={(f) => set("wallHeightFt", f)}
        minFeet={0}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={BLOCK_SIZES.map((b) => b.label)}
          active={BLOCK_SIZES.find((b) => b.value === v.blockSize)?.label ?? ""}
          onChange={(l) =>
            set("blockSize", BLOCK_SIZES.find((b) => b.label === l)?.value ?? "8x8x16")
          }
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Nominal 8″ × 16″ face with ⅜″ joints — ≈0.89 sq ft per block for every
          width.
        </p>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Core grout fill
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Core grout fill">
          {CORE_FILLS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => set("coreFill", c.value)}
              aria-pressed={v.coreFill === c.value}
              title={c.hint}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.coreFill === c.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          {CORE_FILLS.find((c) => c.value === v.coreFill)?.hint} · solid core ≈
          0.16 cu ft per block.
        </p>
      </div>

      <PresetStepper
        id="cmu-beam"
        label="Bond beam courses"
        value={v.bondBeamCourses}
        onChange={(n) => set("bondBeamCourses", Math.round(n))}
        unit="courses"
        step={1}
        min={0}
        max={10}
      />
      <PresetStepper
        id="cmu-waste-b"
        label="Block waste"
        value={v.blockWastePct}
        onChange={(n) => set("blockWastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={30}
        presets={[
          { label: "5%", value: 5 },
          { label: "10%", value: 10 },
        ]}
      />
      <PresetStepper
        id="cmu-waste-m"
        label="Mortar waste"
        value={v.mortarWastePct}
        onChange={(n) => set("mortarWastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={30}
        presets={[
          { label: "10%", value: 10 },
          { label: "15%", value: 15 },
        ]}
      />

      <CostInput
        id="cmu-costblock"
        label="Cost per block"
        value={v.costPerBlock}
        onChange={(n) => set("costPerBlock", n)}
        perUnit="$/block"
      />
      <CostInput
        id="cmu-costmortar"
        label="Cost per mortar bag"
        value={v.costPerMortarBag}
        onChange={(n) => set("costPerMortarBag", n)}
        perUnit="$/80 lb"
      />
      <CostInput
        id="cmu-costgrout"
        label="Core grout cost"
        value={v.costPerGroutYd}
        onChange={(n) => set("costPerGroutYd", n)}
        perUnit="$/cu yd"
      />
      <CostInput
        id="cmu-costrebar"
        label="Cost per rebar stick"
        value={v.costPerRebarStick}
        onChange={(n) => set("costPerRebarStick", n)}
        perUnit="$/20 ft"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.orderBlocks),
        unit: "BLOCKS",
        label: "CMU blocks to order",
      }}
      wastePercent={v.blockWastePct}
      materials={materials}
      materialCosts={[
        { label: `Blocks — ${formatNumber(t.orderBlocks)} × ${formatMoney(v.costPerBlock)}`, amount: Math.round(blockCost * 100) / 100 },
        { label: `Mortar — ${formatNumber(t.mortarBags)} × ${formatMoney(v.costPerMortarBag)}`, amount: Math.round(mortarCost * 100) / 100 },
        ...(t.groutCuYd > 0
          ? [{ label: `Grout — ${formatNumber(t.groutCuYd)} × ${formatMoney(v.costPerGroutYd)}/yd`, amount: Math.round(groutCost * 100) / 100 }]
          : []),
        ...(t.bondBeamSticks > 0
          ? [{ label: `Rebar — ${formatNumber(t.bondBeamSticks)} × ${formatMoney(v.costPerRebarStick)}`, amount: Math.round(rebarCost * 100) / 100 }]
          : []),
      ]}
      total={Math.round(materialCost * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add masonry lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.orderBlocks),
        unit: "blocks",
        label: `Total · ${formatMoney(Math.round(materialCost * 100) / 100)}`,
      }}
    />
  );
}
