/**
 * BuildCalc Pro — Concrete Rebar & Mesh Estimator (Phase 4B).
 *
 * Rebar grids with lap splices, or welded wire mesh rolls.
 * Dispatches rebar + ties lines (rebar mode) or a mesh line.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  rebarTakeoff,
  meshTakeoff,
  REBAR_WEIGHT_LB_PER_FT,
} from "@/lib/math/rebar";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "rebar-mesh-estimator";

type BarSize = "#3" | "#4" | "#5";

interface RebarInputs extends Record<string, unknown> {
  lengthFt: number;
  widthFt: number;
  mode: "rebar" | "mesh";
  spacingIn: number;
  barSize: BarSize;
  lapPct: number;
  clearIn: number;
  meshOverlapPct: number;
  costPerStick: number;
  costPerTieBag: number;
  costPerMeshRoll: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: RebarInputs = {
  lengthFt: 20,
  widthFt: 12,
  mode: "rebar",
  spacingIn: 12,
  barSize: "#4",
  lapPct: 15,
  clearIn: 3,
  meshOverlapPct: 10,
  costPerStick: 12.5,
  costPerTieBag: 28,
  costPerMeshRoll: 145,
  laborHours: 0,
  laborRate: 65,
};

const BAR_SIZES: BarSize[] = ["#3", "#4", "#5"];

export function RebarMeshEstimatorTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<RebarInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Rebar & Mesh Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const isRebar = v.mode === "rebar";
  const r = rebarTakeoff({
    lengthFt: v.lengthFt,
    widthFt: v.widthFt,
    spacingIn: v.spacingIn,
    clearIn: v.clearIn,
    lapPct: v.lapPct,
    barSize: v.barSize,
  });
  const m = meshTakeoff(v.lengthFt, v.widthFt, v.meshOverlapPct);
  const valid = v.lengthFt > 0 && v.widthFt > 0;

  const rebarCost = r.sticks20 * v.costPerStick;
  const tiesCost = r.tieBags * v.costPerTieBag;
  const meshCost = m.rolls * v.costPerMeshRoll;
  const materialCost = isRebar ? rebarCost + tiesCost : meshCost;
  const laborTotal = v.laborHours * v.laborRate;
  const total = materialCost + laborTotal;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = isRebar
    ? [
        {
          label: `${v.barSize} rebar (20-ft sticks)`,
          net: `${formatNumber(r.linearFeet)} ft`,
          waste: `+${v.lapPct}% lap`,
          order: `${formatNumber(r.sticks20)} sticks`,
          note: `${formatNumber(r.linearFeetWithLap)} ft with laps · ${r.runsLength}×${r.runsWidth} grid`,
          highlight: true,
        },
        {
          label: "Steel weight",
          net: "—",
          waste: "—",
          order: `${formatNumber(r.weightLb)} lbs`,
          note: `${r.weightTons} tons @ ${REBAR_WEIGHT_LB_PER_FT[v.barSize]} lb/ft`,
        },
        {
          label: "Wire ties",
          net: `${formatNumber(r.ties)} ties`,
          waste: "—",
          order: `${formatNumber(r.tieBags)} bags`,
          note: "1,000-ct bags · 1 tie per intersection",
        },
      ]
    : [
        {
          label: "Welded wire mesh",
          net: `${formatNumber(m.netSqft)} sq ft`,
          waste: `+${v.meshOverlapPct}%`,
          order: `${formatNumber(m.rolls)} rolls`,
          note: "5×150-ft rolls (750 sq ft)",
          highlight: true,
        },
      ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Slab length and width must be greater than zero.",
      });
      return;
    }
    if (isRebar) {
      if (r.sticks20 <= 0) {
        toast.error("Nothing to add", {
          description: "Increase dimensions or tighten spacing.",
        });
        return;
      }
      addItem({
        toolSlug: SLUG,
        title: `Structural Rebar (20ft Sticks) — ${v.barSize}`,
        category: "concrete",
        quantity: r.sticks20,
        unit: "ea",
        unitCost: v.costPerStick,
        wastePercent: v.lapPct,
        notes: `${formatNumber(r.linearFeetWithLap)} lin ft incl. ${v.lapPct}% lap · ${r.weightTons} tons · ${v.spacingIn}″ O.C.`,
      });
      addItem({
        toolSlug: SLUG,
        title: "Rebar Ties & Support Chairs",
        category: "concrete",
        quantity: r.tieBags,
        unit: "bags",
        unitCost: v.costPerTieBag,
        wastePercent: 0,
        notes: `${formatNumber(r.ties)} ties (1,000-ct bags). Chairs per local practice — verify count with supplier.`,
      });
      toast.success("2 lines added to Master Bid Cart", {
        description: `Rebar ${formatMoney(rebarCost)} + ties ${formatMoney(tiesCost)}`,
        action: { label: "View cart", onClick: () => setDrawerOpen(true) },
      });
    } else {
      if (m.rolls <= 0) {
        toast.error("Nothing to add", {
          description: "Increase the slab area.",
        });
        return;
      }
      addItem({
        toolSlug: SLUG,
        title: "Welded Wire Mesh (WWM) Rolls",
        category: "concrete",
        quantity: m.rolls,
        unit: "ea",
        unitCost: v.costPerMeshRoll,
        wastePercent: v.meshOverlapPct,
        notes: `5×150-ft rolls · ${formatNumber(m.grossSqft)} sq ft incl. overlap.`,
      });
      toast.success("Added to Master Bid Cart", {
        description: `${m.rolls} mesh rolls — ${formatMoney(meshCost)}`,
        action: { label: "View cart", onClick: () => setDrawerOpen(true) },
      });
    }
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="rb-length"
        label="Slab length"
        valueFeet={v.lengthFt}
        onChange={(f) => set("lengthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="rb-width"
        label="Slab width"
        valueFeet={v.widthFt}
        onChange={(f) => set("widthFt", f)}
        minFeet={0}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Rebar grid", "Welded wire mesh"]}
          active={isRebar ? "Rebar grid" : "Welded wire mesh"}
          onChange={(l) => set("mode", l === "Rebar grid" ? "rebar" : "mesh")}
        />
      </div>

      {isRebar ? (
        <>
          <div className="sm:col-span-2">
            <TradeFilterTabs
              subtrades={['12" O.C.', '16" O.C.', '18" O.C.', '24" O.C.']}
              active={`${v.spacingIn}" O.C.`}
              onChange={(l) =>
                set("spacingIn", parseInt(l.replace('" O.C.', ""), 10))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <TradeFilterTabs
              subtrades={BAR_SIZES.map(
                (b) => `${b} (${b === "#3" ? '3/8' : b === "#4" ? '1/2' : '5/8'}″)`,
              )}
              active={`${v.barSize} (${v.barSize === "#3" ? "3/8" : v.barSize === "#4" ? "1/2" : "5/8"}″)`}
              onChange={(l) => set("barSize", l.slice(0, 2) as BarSize)}
            />
          </div>
          <PresetStepper
            id="rb-lap"
            label="Lap splice allowance"
            value={v.lapPct}
            onChange={(n) => set("lapPct", n)}
            unit="%"
            step={1}
            min={0}
            max={50}
            presets={[
              { label: "10%", value: 10 },
              { label: "15%", value: 15 },
              { label: "20%", value: 20 },
            ]}
            hint="Extra steel for bar joints."
          />
          <PresetStepper
            id="rb-clear"
            label="Edge clear cover"
            value={v.clearIn}
            onChange={(n) => set("clearIn", n)}
            unit="in"
            step={0.5}
            min={0}
            max={12}
            hint="Distance from form edge."
          />
          <CostInput
            id="rb-stick"
            label="Cost per 20-ft stick"
            value={v.costPerStick}
            onChange={(n) => set("costPerStick", n)}
            perUnit="$/stick"
          />
          <CostInput
            id="rb-tie"
            label="Cost per tie bag"
            value={v.costPerTieBag}
            onChange={(n) => set("costPerTieBag", n)}
            perUnit="$/1000ct"
          />
        </>
      ) : (
        <>
          <PresetStepper
            id="rb-overlap"
            label="Mesh overlap"
            value={v.meshOverlapPct}
            onChange={(n) => set("meshOverlapPct", n)}
            unit="%"
            step={1}
            min={0}
            max={50}
            presets={[
              { label: "10%", value: 10 },
              { label: "15%", value: 15 },
            ]}
          />
          <CostInput
            id="rb-roll"
            label="Cost per mesh roll"
            value={v.costPerMeshRoll}
            onChange={(n) => set("costPerMeshRoll", n)}
            perUnit="$/roll"
          />
        </>
      )}

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="rb-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="rb-rate"
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
      primaryMetric={
        isRebar
          ? { value: formatNumber(r.sticks20), unit: "STICKS", label: "20-ft rebar sticks" }
          : { value: formatNumber(m.rolls), unit: "ROLLS", label: "WWM rolls" }
      }
      wastePercent={isRebar ? v.lapPct : v.meshOverlapPct}
      materials={materials}
      materialCosts={
        isRebar
          ? [
              {
                label: `Rebar — ${formatNumber(r.sticks20)} × ${formatMoney(v.costPerStick)}`,
                amount: Math.round(rebarCost * 100) / 100,
              },
              {
                label: `Ties — ${formatNumber(r.tieBags)} × ${formatMoney(v.costPerTieBag)}`,
                amount: Math.round(tiesCost * 100) / 100,
              },
            ]
          : [
              {
                label: `Mesh — ${formatNumber(m.rolls)} × ${formatMoney(v.costPerMeshRoll)}`,
                amount: Math.round(meshCost * 100) / 100,
              },
            ]
      }
      labor={v.laborHours > 0 ? { hours: v.laborHours, rate: v.laborRate } : null}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      addLabel={isRebar ? "Add 2 lines to Master Estimate" : "Add to Master Estimate"}
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: isRebar ? formatNumber(r.sticks20) : formatNumber(m.rolls),
        unit: isRebar ? "sticks" : "rolls",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
