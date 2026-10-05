/**
 * BuildCalc Pro — Paint, Primer & Ceiling Coverage (Phase 4C).
 *
 * Net wall area minus openings, ceiling toggle, primer toggle, coats.
 * Dispatches up to 3 lines: wall paint, ceiling paint, primer/sealer.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { paintTakeoff } from "@/lib/math/paint";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";
import { cn } from "@/lib/utils";

const SLUG = "paint-primer-coverage";

interface PaintInputs extends Record<string, unknown> {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  doors: number;
  windows: number;
  includeCeiling: boolean;
  includePrimer: boolean;
  coats: 1 | 2;
  spreadRate: number;
  costPerWallGal: number;
  costPerCeilingGal: number;
  costPerPrimerGal: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: PaintInputs = {
  lengthFt: 16,
  widthFt: 12,
  heightFt: 8,
  doors: 1,
  windows: 2,
  includeCeiling: true,
  includePrimer: false,
  coats: 2,
  spreadRate: 350,
  costPerWallGal: 45,
  costPerCeilingGal: 32,
  costPerPrimerGal: 28,
  laborHours: 0,
  laborRate: 55,
};

function ScopeToggle({
  label,
  on,
  onChange,
  hint,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={cn(
          "flex min-h-[48px] w-full items-center justify-between rounded-xl border px-4 transition-colors",
          on
            ? "border-primary bg-primary/10"
            : "border-zinc-700 bg-zinc-900",
        )}
      >
        <span className="text-sm font-bold text-zinc-100">{label}</span>
        <span
          className={cn(
            "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
            on ? "justify-end bg-primary" : "justify-start bg-zinc-700",
          )}
        >
          <span className="h-5 w-5 rounded-full bg-white shadow" />
        </span>
      </button>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function PaintPrimerCoverageTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<PaintInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Paint, Primer & Ceiling Coverage",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = paintTakeoff({
    lengthFt: v.lengthFt,
    widthFt: v.widthFt,
    heightFt: v.heightFt,
    doors: v.doors,
    windows: v.windows,
    includeCeiling: v.includeCeiling,
    includePrimer: v.includePrimer,
    coats: v.coats,
    spreadRate: v.spreadRate,
  });
  const valid = v.lengthFt > 0 && v.widthFt > 0 && v.heightFt > 0;

  const wallCost = t.wallGallons * v.costPerWallGal;
  const ceilingCost = t.ceilingGallons * v.costPerCeilingGal;
  const primerCost = t.primerGallons * v.costPerPrimerGal;
  const materialCost = wallCost + ceilingCost + primerCost;
  const laborTotal = v.laborHours * v.laborRate;
  const total = materialCost + laborTotal;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Interior wall paint",
      net: `${formatNumber(t.netWallSqft)} sq ft`,
      waste: `${v.coats} coat${v.coats === 2 ? "s" : ""}`,
      order: `${t.wallGallons} gal`,
      note: `${t.wallPails} × 5-gal pails @ ${v.spreadRate} sq ft/gal`,
      highlight: true,
    },
    ...(t.ceilingGallons > 0
      ? [
          {
            label: "Ceiling paint",
            net: `${formatNumber(t.ceilingSqft)} sq ft`,
            waste: `${v.coats} coat${v.coats === 2 ? "s" : ""}`,
            order: `${t.ceilingGallons} gal`,
            highlight: true,
          } as MaterialRow,
        ]
      : []),
    ...(t.primerGallons > 0
      ? [
          {
            label: "Primer / sealer",
            net: `${formatNumber(t.netPaintableSqft)} sq ft`,
            waste: "1 coat",
            order: `${t.primerGallons} gal`,
          } as MaterialRow,
        ]
      : []),
    {
      label: "Net paintable area",
      net: "—",
      waste: "—",
      order: `${formatNumber(t.netPaintableSqft)} sq ft`,
      note: `${formatNumber(t.deductionsSqft)} sq ft deducted (doors/windows)`,
    },
  ];

  const handleAdd = () => {
    if (!valid || t.wallGallons <= 0) {
      toast.error("Check your inputs", {
        description: "Room dimensions must be greater than zero.",
      });
      return;
    }
    const lines: string[] = [];
    addItem({
      toolSlug: SLUG,
      title: "Interior Wall Paint",
      category: "finishes",
      quantity: t.wallGallons,
      unit: "gal",
      unitCost: v.costPerWallGal,
      wastePercent: 0,
      notes: `${formatNumber(t.netWallSqft)} sq ft net · ${v.coats} coats @ ${v.spreadRate} sq ft/gal.`,
    });
    lines.push(`Wall ${formatMoney(wallCost)}`);
    if (t.ceilingGallons > 0) {
      addItem({
        toolSlug: SLUG,
        title: "Ceiling Paint",
        category: "finishes",
        quantity: t.ceilingGallons,
        unit: "gal",
        unitCost: v.costPerCeilingGal,
        wastePercent: 0,
        notes: `${formatNumber(t.ceilingSqft)} sq ft · ${v.coats} coats.`,
      });
      lines.push(`Ceiling ${formatMoney(ceilingCost)}`);
    }
    if (t.primerGallons > 0) {
      addItem({
        toolSlug: SLUG,
        title: "Primer / Sealer",
        category: "finishes",
        quantity: t.primerGallons,
        unit: "gal",
        unitCost: v.costPerPrimerGal,
        wastePercent: 0,
        notes: `${formatNumber(t.netPaintableSqft)} sq ft @ 350 sq ft/gal.`,
      });
      lines.push(`Primer ${formatMoney(primerCost)}`);
    }
    toast.success(`${lines.length} line${lines.length === 1 ? "" : "s"} added to Master Bid Cart`, {
      description: lines.join(" · "),
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="p-length"
        label="Room length"
        valueFeet={v.lengthFt}
        onChange={(f) => set("lengthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="p-width"
        label="Room width"
        valueFeet={v.widthFt}
        onChange={(f) => set("widthFt", f)}
        minFeet={0}
      />
      <PresetStepper
        id="p-height"
        label="Wall height"
        value={v.heightFt}
        onChange={(n) => set("heightFt", n)}
        unit="ft"
        step={0.5}
        min={0}
        presets={[
          { label: "8'", value: 8 },
          { label: "9'", value: 9 },
          { label: "10'", value: 10 },
        ]}
      />
      <div className="grid grid-cols-2 gap-4">
        <PresetStepper
          id="p-doors"
          label="Doors"
          value={v.doors}
          onChange={(n) => set("doors", n)}
          unit="ea"
          step={1}
          min={0}
          hint="−21 sq ft each"
        />
        <PresetStepper
          id="p-windows"
          label="Windows"
          value={v.windows}
          onChange={(n) => set("windows", n)}
          unit="ea"
          step={1}
          min={0}
          hint="−15 sq ft each"
        />
      </div>

      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
        <ScopeToggle
          label="Include ceiling"
          on={v.includeCeiling}
          onChange={(b) => set("includeCeiling", b)}
        />
        <ScopeToggle
          label="Include primer coat"
          on={v.includePrimer}
          onChange={(b) => set("includePrimer", b)}
          hint="One coat @ 350 sq ft/gal on bare surfaces."
        />
      </div>

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["1 coat — repaint", "2 coats — standard"]}
          active={v.coats === 1 ? "1 coat — repaint" : "2 coats — standard"}
          onChange={(l) => set("coats", l.startsWith("1 coat") ? 1 : 2)}
        />
      </div>

      <PresetStepper
        id="p-spread"
        label="Spreading rate"
        value={v.spreadRate}
        onChange={(n) => set("spreadRate", n)}
        unit="sq ft/gal"
        step={10}
        min={100}
        max={600}
        presets={[
          { label: "300 rough", value: 300 },
          { label: "350 std", value: 350 },
          { label: "400 smooth", value: 400 },
        ]}
      />

      <CostInput
        id="p-wallcost"
        label="Wall paint"
        value={v.costPerWallGal}
        onChange={(n) => set("costPerWallGal", n)}
        perUnit="$/gal"
      />
      <CostInput
        id="p-ceilcost"
        label="Ceiling paint"
        value={v.costPerCeilingGal}
        onChange={(n) => set("costPerCeilingGal", n)}
        perUnit="$/gal"
      />
      <CostInput
        id="p-primcost"
        label="Primer"
        value={v.costPerPrimerGal}
        onChange={(n) => set("costPerPrimerGal", n)}
        perUnit="$/gal"
      />

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="p-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="p-rate"
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
        value: String(t.wallGallons),
        unit: "GALLONS",
        label: "Wall paint to order",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        {
          label: `Wall paint — ${t.wallGallons} × ${formatMoney(v.costPerWallGal)}`,
          amount: Math.round(wallCost * 100) / 100,
        },
        ...(t.ceilingGallons > 0
          ? [
              {
                label: `Ceiling — ${t.ceilingGallons} × ${formatMoney(v.costPerCeilingGal)}`,
                amount: Math.round(ceilingCost * 100) / 100,
              },
            ]
          : []),
        ...(t.primerGallons > 0
          ? [
              {
                label: `Primer — ${t.primerGallons} × ${formatMoney(v.costPerPrimerGal)}`,
                amount: Math.round(primerCost * 100) / 100,
              },
            ]
          : []),
      ]}
      labor={v.laborHours > 0 ? { hours: v.laborHours, rate: v.laborRate } : null}
      total={Math.round(total * 100) / 100}
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
        value: String(t.wallGallons),
        unit: "gal",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
