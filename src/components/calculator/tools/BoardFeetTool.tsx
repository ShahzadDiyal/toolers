/**
 * BuildCalc Pro — Board Feet Calculator (Batch 4H).
 *
 * BF = T × W × L ÷ 12 per piece, times piece count. Real-time math,
 * auto-saved inputs, universal ResultsCard, master-estimate dispatch.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { boardFeetTakeoff } from "@/lib/math/finalBatch";
import { roundTo } from "@/lib/math/units";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "board-feet";

interface BoardFeetInputs extends Record<string, unknown> {
  thicknessIn: number;
  widthIn: number;
  lengthFt: number;
  pieces: number;
  pricePerBF: number;
}

const DEFAULTS: BoardFeetInputs = {
  thicknessIn: 2,
  widthIn: 6,
  lengthFt: 8,
  pieces: 10,
  pricePerBF: 1.85,
};

export function BoardFeetTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<BoardFeetInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Board Feet Calculator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = boardFeetTakeoff({
    thicknessIn: v.thicknessIn,
    widthIn: v.widthIn,
    lengthFt: v.lengthFt,
    pieces: v.pieces,
  });
  const valid = t.totalBF > 0;
  const materialCost = roundTo(t.totalBF * v.pricePerBF, 2);

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Board feet",
      net: `${formatNumber(t.bfPerPiece)} BF/pc × ${formatNumber(v.pieces)} pcs`,
      waste: "—",
      order: `${formatNumber(t.totalBF)} BF`,
      note: `${v.thicknessIn} × ${v.widthIn} × ${v.lengthFt} ft`,
      highlight: true,
    },
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Dimensions and piece count must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Lumber — ${v.thicknessIn}×${v.widthIn}×${v.lengthFt} (${v.pieces} pcs)`,
      category: "framing-roofing",
      quantity: t.totalBF,
      unit: "BF",
      unitCost: v.pricePerBF,
      wastePercent: 0,
      notes: `${formatNumber(t.bfPerPiece)} BF per piece × ${v.pieces} pieces.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${formatNumber(t.totalBF)} BF · ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <PresetStepper
        id="b-thick"
        label="Thickness"
        value={v.thicknessIn}
        onChange={(n) => set("thicknessIn", n)}
        unit="in"
        step={0.5}
        min={0}
        presets={[
          { label: '1"', value: 1 },
          { label: '2"', value: 2 },
          { label: '4"', value: 4 },
        ]}
        hint="Nominal thickness."
      />
      <PresetStepper
        id="b-width"
        label="Width"
        value={v.widthIn}
        onChange={(n) => set("widthIn", n)}
        unit="in"
        step={0.5}
        min={0}
        presets={[
          { label: '4"', value: 4 },
          { label: '6"', value: 6 },
          { label: '8"', value: 8 },
          { label: '12"', value: 12 },
        ]}
        hint="Nominal width."
      />
      <PresetStepper
        id="b-length"
        label="Length"
        value={v.lengthFt}
        onChange={(n) => set("lengthFt", n)}
        unit="ft"
        step={1}
        min={0}
        presets={[
          { label: "8'", value: 8 },
          { label: "10'", value: 10 },
          { label: "12'", value: 12 },
          { label: "16'", value: 16 },
        ]}
      />
      <PresetStepper
        id="b-pieces"
        label="Piece count"
        value={v.pieces}
        onChange={(n) => set("pieces", n)}
        unit="pcs"
        step={1}
        min={1}
      />
      <CostInput
        id="b-price"
        label="Price per board foot"
        value={v.pricePerBF}
        onChange={(n) => set("pricePerBF", n)}
        perUnit="$/BF"
        hint="Supplier's BF rate for this species."
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.totalBF),
        unit: "BOARD FT",
        label: "Total board feet",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        {
          label: `${formatNumber(t.totalBF)} BF × ${formatMoney(v.pricePerBF)}`,
          amount: materialCost,
        },
      ]}
      labor={null}
      total={materialCost}
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
        value: formatNumber(t.totalBF),
        unit: "BF",
        label: "Total board feet",
      }}
    />
  );
}
