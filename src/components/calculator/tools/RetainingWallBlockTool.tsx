/**
 * BuildCalc Pro Segmental Retaining Wall & Geogrid Estimator (Batch 4D).
 *
 * SRW block courses, caps, drainage stone, base leveling rock, and
 * geogrid (auto-required over 4 ft). Dispatches up to 5 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  retainingWallTakeoff,
  type SrwBlockSize,
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

const SLUG = "retaining-wall-block";

interface SrwInputs extends Record<string, unknown> {
  lengthFt: number;
  exposedHeightFt: number;
  buriedCourses: number;
  blockSize: SrwBlockSize;
  drainageWidthIn: number;
  blockWastePct: number;
  costPerBlock: number;
  costPerCap: number;
  costPerTonStone: number;
  costPerSqftGrid: number;
}

const DEFAULTS: SrwInputs = {
  lengthFt: 40,
  exposedHeightFt: 3,
  buriedCourses: 1,
  blockSize: "6x16",
  drainageWidthIn: 12,
  blockWastePct: 5,
  costPerBlock: 4.75,
  costPerCap: 3.5,
  costPerTonStone: 52,
  costPerSqftGrid: 0.85,
};

const BLOCK_SIZES: { label: string; value: SrwBlockSize }[] = [
  { label: '6″ H × 16″ W', value: "6x16" },
  { label: '8″ H × 18″ W', value: "8x18" },
];

export function RetainingWallBlockTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<SrwInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Segmental Retaining Wall & Geogrid Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = retainingWallTakeoff({
    lengthFt: v.lengthFt,
    exposedHeightFt: v.exposedHeightFt,
    buriedCourses: v.buriedCourses,
    blockSize: v.blockSize,
    drainageWidthIn: v.drainageWidthIn,
    blockWastePct: v.blockWastePct,
  });
  const valid = v.lengthFt > 0 && v.exposedHeightFt > 0;

  const blockCost = t.totalBlocks * v.costPerBlock;
  const capCost = t.capUnits * v.costPerCap;
  const stoneCost = t.drainageTons * v.costPerTonStone + t.baseTons * v.costPerTonStone;
  const gridCost = t.geogridSqft * v.costPerSqftGrid;
  const materialCost = blockCost + capCost + stoneCost + gridCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `SRW wall block ${v.blockSize === "6x16" ? '6″×16″' : '8″×18″'} face`,
      net: `${t.courses} courses × ${formatNumber(t.blocksPerCourse)}/course`,
      waste: `+${v.blockWastePct}%`,
      order: `${formatNumber(t.totalBlocks)} blocks`,
      note: `${formatNumber(t.totalHeightFt)} ft total height incl. buried course${v.buriedCourses > 1 ? "s" : ""}`,
      highlight: true,
    },
    {
      label: "Wall cap units",
      net: `${formatNumber(t.blocksPerCourse)} ea`,
      waste: `+${v.blockWastePct}%`,
      order: `${formatNumber(t.capUnits)} caps`,
      note: "One per block on the top course",
    },
    {
      label: 'Drainage stone ¾″ crushed',
      net: `${formatNumber(v.drainageWidthIn)}″ column × ${formatNumber(v.exposedHeightFt)} ft`,
      waste: "—",
      order: `${formatNumber(t.drainageTons)} tons`,
      note: "1.4 tons per cu yd",
    },
    {
      label: "Base leveling pad crusher run",
      net: '6″ deep × 24″ wide',
      waste: "—",
      order: `${formatNumber(t.baseTons)} tons`,
      note: "Compacted pad under first course",
    },
    {
      label: "Geogrid reinforcement",
      net: t.geogridRequired ? `${t.geogridLayers} layers` : "Not required",
      waste: "—",
      order: t.geogridRequired ? `${formatNumber(t.geogridSqft)} sq ft` : "—",
      note: t.geogridRequired
        ? "Every 2 courses · embed 0.7 × height engineer-stamped design still required over 4 ft"
        : "Walls over 4 ft exposed need grid + engineered design",
      highlight: t.geogridRequired,
    },
  ];

  const handleAdd = () => {
    if (!valid || t.totalBlocks <= 0) {
      toast.error("Check your inputs", {
        description: "Wall length and exposed height must be greater than zero.",
      });
      return;
    }
    const ctx = `${formatNumber(v.lengthFt)} ft × ${formatNumber(v.exposedHeightFt)} ft exposed SRW wall`;
    let lines = 0;
    addItem({
      toolSlug: SLUG,
      title: `Retaining Wall Blocks ${v.blockSize === "6x16" ? '6″×16″' : '8″×18″'}`,
      category: "site-exterior",
      quantity: t.totalBlocks,
      unit: "ea",
      unitCost: v.costPerBlock,
      wastePercent: v.blockWastePct,
      notes: `${ctx} · ${t.courses} courses.`,
    });
    lines++;
    addItem({
      toolSlug: SLUG,
      title: "Retaining Wall Cap Units",
      category: "site-exterior",
      quantity: t.capUnits,
      unit: "ea",
      unitCost: v.costPerCap,
      wastePercent: v.blockWastePct,
      notes: ctx,
    });
    lines++;
    addItem({
      toolSlug: SLUG,
      title: 'Drainage Gravel Backfill ¾″ stone',
      category: "site-exterior",
      quantity: t.drainageTons,
      unit: "tons",
      unitCost: v.costPerTonStone,
      wastePercent: 0,
      notes: `${ctx} · ${formatNumber(v.drainageWidthIn)}″ drainage column + 6″×24″ base pad.`,
    });
    lines++;
    if (t.geogridRequired) {
      addItem({
        toolSlug: SLUG,
        title: "Soil Reinforcement Geogrid",
        category: "site-exterior",
        quantity: t.geogridSqft,
        unit: "sq ft",
        unitCost: v.costPerSqftGrid,
        wastePercent: 0,
        notes: `${ctx} · ${t.geogridLayers} layers every 2 courses. Engineered design required over 4 ft.`,
      });
      lines++;
    }
    toast.success(`${lines} lines added to Master Bid Cart`, {
      description: `Blocks ${formatMoney(blockCost)} · Caps ${formatMoney(capCost)} · Stone ${formatMoney(stoneCost)}${t.geogridRequired ? ` · Grid ${formatMoney(gridCost)}` : ""}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="srw-length"
        label="Wall length"
        valueFeet={v.lengthFt}
        onChange={(f) => set("lengthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="srw-height"
        label="Exposed height"
        valueFeet={v.exposedHeightFt}
        onChange={(f) => set("exposedHeightFt", f)}
        minFeet={0}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={BLOCK_SIZES.map((b) => b.label)}
          active={BLOCK_SIZES.find((b) => b.value === v.blockSize)?.label ?? ""}
          onChange={(l) =>
            set("blockSize", BLOCK_SIZES.find((b) => b.label === l)?.value ?? "6x16")
          }
        />
      </div>

      <PresetStepper
        id="srw-buried"
        label="Buried base courses"
        value={v.buriedCourses}
        onChange={(n) => set("buriedCourses", Math.round(n))}
        unit="courses"
        step={1}
        min={0}
        max={4}
      />
      <PresetStepper
        id="srw-drain"
        label="Drainage column width"
        value={v.drainageWidthIn}
        onChange={(n) => set("drainageWidthIn", n)}
        unit="in"
        step={2}
        min={6}
        max={36}
        presets={[
          { label: '12"', value: 12 },
          { label: '18"', value: 18 },
        ]}
      />
      <PresetStepper
        id="srw-waste"
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

      <CostInput
        id="srw-costblock"
        label="Cost per wall block"
        value={v.costPerBlock}
        onChange={(n) => set("costPerBlock", n)}
        perUnit="$/block"
      />
      <CostInput
        id="srw-costcap"
        label="Cost per cap unit"
        value={v.costPerCap}
        onChange={(n) => set("costPerCap", n)}
        perUnit="$/cap"
      />
      <CostInput
        id="srw-coststone"
        label="Drainage stone, delivered"
        value={v.costPerTonStone}
        onChange={(n) => set("costPerTonStone", n)}
        perUnit="$/ton"
      />
      <CostInput
        id="srw-costgrid"
        label="Geogrid fabric"
        value={v.costPerSqftGrid}
        onChange={(n) => set("costPerSqftGrid", n)}
        perUnit="$/sq ft"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.totalBlocks),
        unit: "BLOCKS",
        label: "SRW blocks to order",
      }}
      wastePercent={v.blockWastePct}
      materials={materials}
      materialCosts={[
        { label: `Blocks ${formatNumber(t.totalBlocks)} × ${formatMoney(v.costPerBlock)}`, amount: Math.round(blockCost * 100) / 100 },
        { label: `Caps ${formatNumber(t.capUnits)} × ${formatMoney(v.costPerCap)}`, amount: Math.round(capCost * 100) / 100 },
        { label: `Stone ${formatNumber(Math.round((t.drainageTons + t.baseTons) * 10) / 10)} tons × ${formatMoney(v.costPerTonStone)}`, amount: Math.round(stoneCost * 100) / 100 },
        ...(t.geogridRequired
          ? [{ label: `Geogrid ${formatNumber(t.geogridSqft)} × ${formatMoney(v.costPerSqftGrid)}/sq ft`, amount: Math.round(gridCost * 100) / 100 }]
          : []),
      ]}
      total={Math.round(materialCost * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add wall lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.totalBlocks),
        unit: "blocks",
        label: `Total · ${formatMoney(Math.round(materialCost * 100) / 100)}`,
      }}
    />
  );
}
