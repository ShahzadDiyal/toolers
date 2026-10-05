/**
 * BuildCalc Pro Rafter & Truss Cut Length Calculator (Batch 4E).
 *
 * Common rafter line length, overhang, plumb/seat cut angles, bird's-mouth
 * depth check, and stock-length recommendation. Dispatches 1 estimate line.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  rafterTakeoff,
  formatRafterLength,
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

const SLUG = "rafter-truss-cuts";

interface RafterInputs extends Record<string, unknown> {
  spanFt: number;
  pitch: number;
  ridgeThicknessIn: 1.5 | 0.75;
  overhangIn: number;
  rafterStock: "2x6" | "2x8";
  ridgeLengthFt: number;
  rafterSpacingIn: 16 | 24;
  costPerRafterBoard: number;
}

const DEFAULTS: RafterInputs = {
  spanFt: 28,
  pitch: 6,
  ridgeThicknessIn: 1.5,
  overhangIn: 12,
  rafterStock: "2x8",
  ridgeLengthFt: 40,
  rafterSpacingIn: 16,
  costPerRafterBoard: 22,
};

const PITCHES = [3, 4, 5, 6, 7, 8, 10, 12];

export function RafterTrussCutsTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<RafterInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Rafter & Truss Cut Length Calculator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = rafterTakeoff({
    spanFt: v.spanFt,
    pitch: v.pitch,
    ridgeThicknessIn: v.ridgeThicknessIn,
    overhangIn: v.overhangIn,
    rafterStock: v.rafterStock,
    ridgeLengthFt: v.ridgeLengthFt,
    rafterSpacingIn: v.rafterSpacingIn,
  });
  const valid = v.spanFt > 0 && v.pitch > 0;

  const lumberCost = t.rafterCount * v.costPerRafterBoard;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Common rafter ridge to bird's-mouth",
      net: `${formatNumber(t.runIn)}″ run · ${v.pitch}/12`,
      waste: "—",
      order: formatRafterLength(t.lineLengthIn),
      note: `Pitch angle ${formatNumber(t.pitchAngleDeg)}°`,
      highlight: true,
    },
    {
      label: "Eave overhang cut",
      net: `${formatNumber(v.overhangIn)}″ horizontal`,
      waste: "—",
      order: formatRafterLength(t.overhangLengthIn),
      note: "Along the rafter slope",
    },
    {
      label: "Total rafter blank",
      net: "Line + overhang",
      waste: "—",
      order: formatRafterLength(t.totalLengthIn),
      note: t.overStockLength
        ? "⚠ Exceeds 24-ft stock special-order length or splice"
        : `Buy ${t.stockLengthFt}-ft stock`,
      highlight: t.overStockLength,
    },
    {
      label: "Bird's-mouth cuts",
      net: `Plumb ${formatNumber(t.plumbCutDeg)}° · Seat ${formatNumber(t.seatCutDeg)}°`,
      waste: "—",
      order: `${formatNumber(t.birdsMouthDepthIn)}″ deep`,
      note: t.birdsMouthWarning
        ? `⚠ Exceeds ⅓ of ${v.rafterStock} depth (${formatNumber(t.rafterDepthIn / 3)}″ max) deepen the seat or upsize stock`
        : `3.5″ level seat · under ⅓ of ${v.rafterStock} depth`,
      highlight: t.birdsMouthWarning,
    },
    {
      label: `Rafter count ${v.rafterSpacingIn}″ O.C.`,
      net: `${formatNumber(v.ridgeLengthFt)} ft ridge`,
      waste: "—",
      order: `${formatNumber(t.rafterCount)} rafters`,
      note: "Both slopes · +1 starter pair",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.rafterCount <= 0) {
      toast.error("Check your inputs", {
        description: "Building span and pitch must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Roof Rafters ${v.rafterStock} × ${t.stockLengthFt} ft`,
      category: "framing-roofing",
      quantity: t.rafterCount,
      unit: "ea",
      unitCost: v.costPerRafterBoard,
      wastePercent: 0,
      notes: `${formatNumber(v.spanFt)} ft span · ${v.pitch}/12 pitch · ${formatRafterLength(t.totalLengthIn)} blanks · ${v.rafterSpacingIn}″ O.C.`,
    });
    toast.success("1 line added to Master Bid Cart", {
      description: `${t.rafterCount} rafters · ${formatMoney(lumberCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="rf-span"
        label="Building span (wall to wall)"
        valueFeet={v.spanFt}
        onChange={(f) => set("spanFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="rf-ridge"
        label="Ridge length"
        valueFeet={v.ridgeLengthFt}
        onChange={(f) => set("ridgeLengthFt", f)}
        minFeet={0}
      />

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Roof pitch
          <span className="ml-2 font-mono normal-case tracking-normal text-accent">
            {formatNumber(t.pitchAngleDeg)}°
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Roof pitch">
          {PITCHES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("pitch", p)}
              aria-pressed={v.pitch === p}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.pitch === p
                  ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                  : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]")
              }
            >
              {p}/12
            </button>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={['1.5" ridge board (2x)', '0.75" ridge board (1x)']}
          active={v.ridgeThicknessIn === 1.5 ? '1.5" ridge board (2x)' : '0.75" ridge board (1x)'}
          onChange={(l) => set("ridgeThicknessIn", l.startsWith("1.5") ? 1.5 : 0.75)}
        />
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["2×6 rafter stock", "2×8 rafter stock"]}
          active={v.rafterStock === "2x6" ? "2×6 rafter stock" : "2×8 rafter stock"}
          onChange={(l) => set("rafterStock", l.startsWith("2×6") ? "2x6" : "2x8")}
        />
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={['16" O.C. rafters', '24" O.C. rafters']}
          active={v.rafterSpacingIn === 16 ? '16" O.C. rafters' : '24" O.C. rafters'}
          onChange={(l) => set("rafterSpacingIn", l.startsWith("16") ? 16 : 24)}
        />
      </div>

      <PresetStepper
        id="rf-overhang"
        label="Eave overhang"
        value={v.overhangIn}
        onChange={(n) => set("overhangIn", n)}
        unit="in"
        step={2}
        min={0}
        max={36}
        presets={[
          { label: '12"', value: 12 },
          { label: '16"', value: 16 },
          { label: '24"', value: 24 },
        ]}
      />
      <CostInput
        id="rf-costboard"
        label="Cost per rafter board"
        value={v.costPerRafterBoard}
        onChange={(n) => set("costPerRafterBoard", n)}
        perUnit={`$/${t.stockLengthFt} ft`}
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatRafterLength(t.totalLengthIn),
        unit: "BLANK",
        label: "Total rafter blank length",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `${v.rafterStock} × ${t.stockLengthFt} ft ${formatNumber(t.rafterCount)} × ${formatMoney(v.costPerRafterBoard)}`, amount: Math.round(lumberCost * 100) / 100 },
      ]}
      total={Math.round(lumberCost * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add rafter line to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: `${t.stockLengthFt}′ stock`,
        unit: `${formatNumber(t.rafterCount)} rafters`,
        label: `Total · ${formatMoney(Math.round(lumberCost * 100) / 100)}`,
      }}
    />
  );
}
