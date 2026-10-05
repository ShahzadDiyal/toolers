/**
 * BuildCalc Pro — Stair Stringer & Code Layout Calculator (Phase 4B).
 *
 * Solves stair geometry with key IRC R311.7 riser/tread checks.
 * Dispatches one line: "Stair Stringers & Structural Treads".
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  stairLayout,
  IRC_MAX_RISER_IN,
  IRC_MIN_TREAD_IN,
  COMFORT_MIN_IN,
  COMFORT_MAX_IN,
} from "@/lib/math/stairs";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { StairDiagram } from "@/components/calculator/diagrams/StairDiagram";
import { useToolActions } from "@/components/tools/useToolActions";
import { cn } from "@/lib/utils";

const SLUG = "stair-stringer-layout";

interface StairInputs extends Record<string, unknown> {
  totalRiseIn: number;
  treadRunIn: number;
  widthIn: number;
  costPerBoardFt: number;
  costPerTread: number;
  laborHours: number;
  laborRate: number;
}

const DEFAULTS: StairInputs = {
  totalRiseIn: 108,
  treadRunIn: 10.5,
  widthIn: 36,
  costPerBoardFt: 3.2,
  costPerTread: 14,
  laborHours: 0,
  laborRate: 65,
};

function CodeCheck({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
        ok ? "border-green-800/60 bg-green-950/30" : "border-red-800/60 bg-red-950/30",
      )}
      role="status"
    >
      {ok ? (
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
      ) : (
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
      )}
      <div className="min-w-0">
        <p className={cn("text-sm font-bold", ok ? "text-green-300" : "text-red-300")}>
          {label}
        </p>
        <p className="text-xs text-zinc-400">{detail}</p>
      </div>
    </div>
  );
}

export function StairStringerLayoutTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<StairInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Stair Stringer Layout",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const s = stairLayout(v.totalRiseIn, v.treadRunIn, v.widthIn);
  const valid = s.riserCount > 0;

  const stringerCost = s.stringerQty * s.stringerBoardFt * v.costPerBoardFt;
  const treadsCost = s.treadCount * v.costPerTread;
  const materialCost = stringerCost + treadsCost;
  const laborTotal = v.laborHours * v.laborRate;
  const total = materialCost + laborTotal;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `2×12 stringers (${s.stringerBoardFt}-ft stock)`,
      net: `${formatNumber(s.stringerLengthIn / 12, 2)} ft cut`,
      waste: "—",
      order: `${s.stringerQty} boards`,
      note: s.overStockLength
        ? "Over 16-ft stock — verify LVL/splice"
        : `${s.stringerQty} stringers @ ${formatNumber(v.widthIn, 1)}″ wide`,
      highlight: true,
    },
    {
      label: "Treads",
      net: `${s.treadCount} ea`,
      waste: "—",
      order: `${s.treadCount} ea`,
      note: `Top tread is the landing (${s.riserCount} risers − 1)`,
      highlight: true,
    },
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Total rise and tread run must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: "Stair Stringers & Structural Treads",
      category: "framing-roofing",
      quantity: 1,
      unit: "lot",
      unitCost: Math.round(materialCost * 100) / 100,
      wastePercent: 0,
      notes: `${s.riserCount} risers @ ${s.unitRiseIn}″, ${s.treadCount} treads @ ${s.unitRunIn}″ run, ${s.stringerQty} stringers (${s.stringerBoardFt}-ft 2×12). Total rise ${formatNumber(v.totalRiseIn, 1)}″.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${s.riserCount} risers · ${s.treadCount} treads · ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="s-rise"
        label="Total rise"
        valueFeet={v.totalRiseIn / 12}
        onChange={(f) => set("totalRiseIn", Math.round(f * 12 * 16) / 16)}
        defaultMode="inches"
        minFeet={0}
        hint="Floor-to-floor vertical height."
      />
      <DimensionInput
        id="s-run"
        label="Target tread run"
        valueFeet={v.treadRunIn / 12}
        onChange={(f) => set("treadRunIn", Math.round(f * 12 * 16) / 16)}
        defaultMode="inches"
        minFeet={0}
        presets={[
          { label: '10"', valueFeet: 10 / 12 },
          { label: '10½"', valueFeet: 10.5 / 12 },
          { label: '11"', valueFeet: 11 / 12 },
        ]}
      />
      <DimensionInput
        id="s-width"
        label="Stair width"
        valueFeet={v.widthIn / 12}
        onChange={(f) => set("widthIn", Math.round(f * 12 * 16) / 16)}
        defaultMode="inches"
        minFeet={0}
        hint="Over 36″ gets a 4th stringer."
      />

      {/* Live stringer diagram */}
      <div className="sm:col-span-2">
        <StairDiagram
          totalRiseIn={v.totalRiseIn}
          totalRunIn={s.totalRunIn}
          riserCount={s.riserCount}
          unitRiseIn={s.unitRiseIn}
          unitRunIn={s.unitRunIn}
          stringerLengthIn={s.stringerLengthIn}
        />
      </div>

      {/* Live IRC code validator */}
      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Key IRC R311.7 checks — riser &amp; tread
        </p>
        <p className="mb-3 text-xs text-zinc-500">
          Covers riser height and tread depth only. Full R311.7 compliance also
          requires riser/tread uniformity (⅜″), 6′-8″ headroom, 36″ stairway
          width, landings, and handrails — verify on site.
        </p>
        {valid ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <CodeCheck
              ok={s.checks.riserOk}
              label={s.checks.riserOk ? "Riser OK" : "Riser too tall"}
              detail={`${s.unitRiseIn}″ vs max ${IRC_MAX_RISER_IN}″ (R311.7.5.1)`}
            />
            <CodeCheck
              ok={s.checks.treadOk}
              label={s.checks.treadOk ? "Tread OK" : "Tread too narrow"}
              detail={`${s.unitRunIn}″ vs min ${IRC_MIN_TREAD_IN}″ (R311.7.5.2)`}
            />
            <CodeCheck
              ok={s.checks.comfortOk}
              label={s.checks.comfortOk ? "Comfort OK" : "Steep / shallow"}
              detail={`2R+T = ${s.checks.comfortValue}″ (target ${COMFORT_MIN_IN}–${COMFORT_MAX_IN}″)`}
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Enter rise and run to run the code check.
          </p>
        )}
      </div>

      <CostInput
        id="s-board"
        label="2×12 stringer stock"
        value={v.costPerBoardFt}
        onChange={(n) => set("costPerBoardFt", n)}
        perUnit="$/ft"
      />
      <CostInput
        id="s-tread"
        label="Cost per tread"
        value={v.costPerTread}
        onChange={(n) => set("costPerTread", n)}
        perUnit="$/tread"
      />

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Labor (optional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="s-hours"
            label="Labor hours"
            value={v.laborHours}
            onChange={(n) => set("laborHours", n)}
            unit="hrs"
            step={0.5}
            min={0}
          />
          <CostInput
            id="s-rate"
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
        value: String(s.riserCount),
        unit: "RISERS",
        label: "Step count",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        {
          label: `Stringers — ${s.stringerQty} × ${s.stringerBoardFt} ft × ${formatMoney(v.costPerBoardFt)}`,
          amount: Math.round(stringerCost * 100) / 100,
        },
        {
          label: `Treads — ${s.treadCount} × ${formatMoney(v.costPerTread)}`,
          amount: Math.round(treadsCost * 100) / 100,
        },
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
        value: valid
          ? `${s.riserCount} × ${s.unitRiseIn}″`
          : "—",
        unit: "risers",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
