/**
 * BuildCalc Pro — Demo tool: Concrete Slab Calculator.
 *
 * Reference implementation for Phase 2 tools. Pattern:
 *   1. Local input state (Zustand is for the estimate, not tool inputs).
 *   2. Pure math via src/lib/math/units.
 *   3. Render inside <CalculationCard> with net / waste / gross / BOM.
 *   4. buildLineItem() returns the EstimateLineItem payload (or null).
 */
"use client";

import * as React from "react";
import type { ToolMetadata } from "@/types/estimator";
import { getTool } from "@/lib/tools-registry";

function requireTool(): ToolMetadata {
  const tool = getTool("concrete", "concrete-slab");
  if (!tool) throw new Error("Tool registry missing concrete-slab");
  return tool;
}
import {
  calculateWithWaste,
  cuftToCuyd,
  roundTo,
  roundUp,
  BAGS_80LB_PER_CUYD,
  BAGS_60LB_PER_CUYD,
} from "@/lib/math/units";
import { formatNumber } from "@/lib/utils";
import type { NewLineItem } from "@/store/useEstimateStore";
import {
  CalculationCard,
  type BomRow,
  type ResultRow,
} from "@/components/calculators/CalculationCard";
import { NumericInput } from "@/components/calculators/NumericInput";

const TOOL = requireTool();

const THICKNESS_PRESETS = [
  { label: '3½"', value: 3.5 },
  { label: '4"', value: 4 },
  { label: '6"', value: 6 },
  { label: '8"', value: 8 },
];

export function ConcreteSlab() {
  const [lengthFt, setLengthFt] = React.useState(20);
  const [widthFt, setWidthFt] = React.useState(12);
  const [thicknessIn, setThicknessIn] = React.useState(4);
  const [wastePercent, setWastePercent] = React.useState(10);
  const [unitCost, setUnitCost] = React.useState(165);

  const valid = lengthFt > 0 && widthFt > 0 && thicknessIn > 0;

  // ---- Net math (pure, decimal-safe) ----
  const volumeCuFt = valid ? roundTo((lengthFt * widthFt * thicknessIn) / 12, 3) : 0;
  const volumeCuYd = cuftToCuyd(volumeCuFt);

  // ---- Waste ----
  const { gross: grossCuYd, wasteAmount: wasteCuYd } = calculateWithWaste(
    volumeCuYd,
    wastePercent,
  );
  const bags80 = roundUp(grossCuYd * BAGS_80LB_PER_CUYD);
  const bags60 = roundUp(grossCuYd * BAGS_60LB_PER_CUYD);

  const net: ResultRow[] = [
    { label: "Volume", value: formatNumber(volumeCuFt), unit: "cu ft" },
    { label: "Concrete", value: formatNumber(volumeCuYd), unit: "cu yd" },
  ];

  const gross: ResultRow[] = [
    {
      label: "Order concrete",
      value: formatNumber(grossCuYd),
      unit: "cu yd",
    },
    {
      label: `Includes ${wastePercent}% waste`,
      value: formatNumber(wasteCuYd),
      unit: "cu yd",
    },
  ];

  const bom: BomRow[] = [
    { item: "Ready-mix concrete", qty: formatNumber(grossCuYd), unit: "cu yd" },
    { item: "80-lb bags (alternative)", qty: formatNumber(bags80), unit: "bags" },
    { item: "60-lb bags (alternative)", qty: formatNumber(bags60), unit: "bags" },
  ];

  const estimatedTotal = roundTo(grossCuYd * unitCost, 2);

  const buildLineItem = (): NewLineItem | null => {
    if (!valid) return null;
    const total = roundTo(grossCuYd * unitCost, 2);
    return {
      toolSlug: TOOL.slug,
      title: `Concrete slab ${lengthFt}′ × ${widthFt}′ × ${thicknessIn}″`,
      category: "concrete",
      quantity: grossCuYd,
      unit: "cu yd",
      unitCost,
      totalCost: total,
      wastePercent,
      notes: `Net ${formatNumber(volumeCuYd)} cu yd + ${wastePercent}% waste. ~${bags80} × 80-lb bags or ~${bags60} × 60-lb bags.`,
    };
  };

  return (
    <CalculationCard
      tool={TOOL}
      net={net}
      wastePercent={wastePercent}
      onWastePercentChange={setWastePercent}
      gross={gross}
      bom={bom}
      unitCostLabel="Ready-mix price"
      unitCost={unitCost}
      onUnitCostChange={setUnitCost}
      estimatedTotal={estimatedTotal}
      buildLineItem={buildLineItem}
    >
      <NumericInput
        id="slab-length"
        label="Length"
        value={lengthFt}
        onChange={setLengthFt}
        unit="ft"
        step={1}
        min={0}
        fractionFriendly
        hint={"Type 20, 20 ft, or 20' 6\" — fractions work."}
      />
      <NumericInput
        id="slab-width"
        label="Width"
        value={widthFt}
        onChange={setWidthFt}
        unit="ft"
        step={1}
        min={0}
        fractionFriendly
      />
      <NumericInput
        id="slab-thickness"
        label="Thickness"
        value={thicknessIn}
        onChange={setThicknessIn}
        unit="in"
        step={0.5}
        min={0}
        presets={THICKNESS_PRESETS}
      />
      <div className="flex items-end">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Volume = L × W × D ÷ 27. Order quantity adds your waste allowance;
          bags are rounded <span className="text-zinc-300 font-semibold">up</span> —
          suppliers don&apos;t sell half bags.
        </p>
      </div>
    </CalculationCard>
  );
}
