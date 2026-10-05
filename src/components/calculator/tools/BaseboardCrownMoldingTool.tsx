/**
 * BuildCalc Pro — Crown Molding, Baseboard & Miter Cut Estimator (Batch 4F).
 *
 * Trim boards, miter/scarf cut counts, and caulk tubes from room
 * perimeter and corners. Dispatches 2 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  trimTakeoff,
  TRIM_PROFILES,
  type TrimProfile,
} from "@/lib/math/mepAndFinishes";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "baseboard-crown-molding";

interface TrimInputs extends Record<string, unknown> {
  areaMode: "perimeter" | "dims";
  perimeterLF: number;
  lengthFt: number;
  widthFt: number;
  insideCorners: number;
  outsideCorners: number;
  stockLengthFt: 8 | 12 | 16;
  profile: TrimProfile;
  wastePct: number;
  costPerLF: number;
  costPerCaulkTube: number;
}

const DEFAULTS: TrimInputs = {
  areaMode: "dims",
  perimeterLF: 48,
  lengthFt: 14,
  widthFt: 10,
  insideCorners: 4,
  outsideCorners: 0,
  stockLengthFt: 16,
  profile: "baseboard",
  wastePct: 10,
  costPerLF: 2.8,
  costPerCaulkTube: 7.5,
};

const PROFILES = Object.entries(TRIM_PROFILES) as [
  TrimProfile,
  { label: string },
][];
const STOCK = [8, 12, 16] as const;

export function BaseboardCrownMoldingTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<TrimInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Crown Molding, Baseboard & Miter Cut Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const perimeterLF =
    v.areaMode === "dims" ? 2 * (v.lengthFt + v.widthFt) : v.perimeterLF;
  const t = trimTakeoff({
    perimeterLF,
    insideCorners: v.insideCorners,
    outsideCorners: v.outsideCorners,
    stockLengthFt: v.stockLengthFt,
    profile: v.profile,
    wastePct: v.wastePct,
  });
  const valid = perimeterLF > 0;
  const profileLabel = TRIM_PROFILES[v.profile].label;

  const trimCost = t.grossLF * v.costPerLF;
  const caulkCost = t.caulkTubes * v.costPerCaulkTube;
  const total = trimCost + caulkCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `${profileLabel} — ${v.stockLengthFt}-ft stock`,
      net: `${formatNumber(t.netLF)} lin ft`,
      waste: `+${v.wastePct}%`,
      order: `${formatNumber(t.boards)} boards`,
      note: `${formatNumber(t.grossLF)} lin ft gross`,
      highlight: true,
    },
    {
      label: "Miter & scarf cuts",
      net: `${v.insideCorners + v.outsideCorners} corners`,
      waste: "—",
      order: `${formatNumber(t.miterCuts)} cuts`,
      note: `${t.scarfJoints} scarf joints on long runs`,
    },
    {
      label: "Painter's caulk — 10 oz tubes",
      net: `${formatNumber(t.grossLF)} lin ft`,
      waste: "—",
      order: `${formatNumber(t.caulkTubes)} tubes`,
      note: "1 tube per 75 lin ft · top + bottom edges",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.boards <= 0) {
      toast.error("Check your inputs", {
        description: "Room perimeter must be greater than zero.",
      });
      return;
    }
    const ctx = `${profileLabel} · ${formatNumber(t.netLF)} lin ft · ${v.stockLengthFt}-ft stock`;
    addItem({
      toolSlug: SLUG,
      title: `Architectural Moulding — ${profileLabel}`,
      category: "finishes",
      quantity: Math.round(t.grossLF * 10) / 10,
      unit: "lf",
      unitCost: v.costPerLF,
      wastePercent: v.wastePct,
      notes: `${ctx} · ${t.boards} boards · ${t.miterCuts} cuts.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Trim Caulk & Fasteners",
      category: "finishes",
      quantity: t.caulkTubes,
      unit: "ea",
      unitCost: v.costPerCaulkTube,
      wastePercent: 0,
      notes: `${ctx} · ${t.caulkTubes} caulk tubes + brads/filler.`,
    });
    toast.success("2 lines added to Master Bid Cart", {
      description: `Moulding ${formatMoney(trimCost)} · Caulk ${formatMoney(caulkCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["L × W room", "Perimeter LF"]}
          active={v.areaMode === "dims" ? "L × W room" : "Perimeter LF"}
          onChange={(l) => set("areaMode", l === "L × W room" ? "dims" : "perimeter")}
        />
      </div>

      {v.areaMode === "dims" ? (
        <>
          <DimensionInput
            id="tr-length"
            label="Room length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="tr-width"
            label="Room width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="tr-perim"
          label="Room perimeter"
          value={v.perimeterLF}
          onChange={(n) => set("perimeterLF", n)}
          unit="lin ft"
          step={1}
          min={0}
        />
      )}

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Trim profile
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Trim profile">
          {PROFILES.map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                set("profile", key);
                if (key === "crown") set("wastePct", 15);
              }}
              aria-pressed={v.profile === key}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.profile === key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          {v.profile === "crown"
            ? "Crown: 38°/52° spring angle · compound miters — 15% waste suggested."
            : v.profile === "baseboard"
              ? "Tall baseboard 4¼″–5¼″ · coped inside corners."
              : "Chair rail / picture frame · single-level miters."}
        </p>
      </div>

      <PresetStepper
        id="tr-inside"
        label="Inside 90° corners"
        value={v.insideCorners}
        onChange={(n) => set("insideCorners", Math.round(n))}
        unit="corners"
        step={1}
        min={0}
        max={24}
      />
      <PresetStepper
        id="tr-outside"
        label="Outside corners"
        value={v.outsideCorners}
        onChange={(n) => set("outsideCorners", Math.round(n))}
        unit="corners"
        step={1}
        min={0}
        max={24}
      />

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Stock board length
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Stock board length">
          {STOCK.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("stockLengthFt", s)}
              aria-pressed={v.stockLengthFt === s}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.stockLengthFt === s
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {s} ft
            </button>
          ))}
        </div>
      </div>

      <PresetStepper
        id="tr-waste"
        label="Waste factor"
        value={v.wastePct}
        onChange={(n) => set("wastePct", n)}
        unit="%"
        step={1}
        min={0}
        max={30}
        presets={[
          { label: "10% simple", value: 10 },
          { label: "15% crown", value: 15 },
        ]}
      />

      <CostInput
        id="tr-costlf"
        label="Trim cost"
        value={v.costPerLF}
        onChange={(n) => set("costPerLF", n)}
        perUnit="$/lin ft"
      />
      <CostInput
        id="tr-costcaulk"
        label="Caulk tube"
        value={v.costPerCaulkTube}
        onChange={(n) => set("costPerCaulkTube", n)}
        perUnit="$/tube"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.boards),
        unit: "BOARDS",
        label: `${v.stockLengthFt}-ft trim boards to order`,
      }}
      wastePercent={v.wastePct}
      materials={materials}
      materialCosts={[
        { label: `${profileLabel} — ${formatNumber(t.grossLF)} × ${formatMoney(v.costPerLF)}/ft`, amount: Math.round(trimCost * 100) / 100 },
        { label: `Caulk — ${formatNumber(t.caulkTubes)} × ${formatMoney(v.costPerCaulkTube)}`, amount: Math.round(caulkCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add trim lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.boards),
        unit: "boards",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
