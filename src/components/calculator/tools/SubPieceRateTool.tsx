/**
 * BuildCalc Pro — Subcontractor Piece-Work & Crew Production (Batch 4G).
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  pieceRateTakeoff,
  PIECE_UNITS,
  type PieceUnit,
} from "@/lib/math/financialAndUtilities";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "sub-piece-rate";

interface PieceInputs extends Record<string, unknown> {
  unit: PieceUnit;
  quantity: number;
  pieceRate: number;
  crewSize: number;
  timeMode: "days" | "hours";
  timeValue: number;
}

const DEFAULTS: PieceInputs = {
  unit: "drywall-sheet",
  quantity: 200,
  pieceRate: 18,
  crewSize: 4,
  timeMode: "days",
  timeValue: 5,
};

const UNIT_LABELS = Object.entries(PIECE_UNITS).map(([id, u]) => u.label);

export function SubPieceRateTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<PieceInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Subcontractor Piece-Work & Crew Production",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const totalHours = v.timeMode === "days" ? v.timeValue * 8 : v.timeValue;
  const t = pieceRateTakeoff({
    unit: v.unit,
    quantity: v.quantity,
    pieceRate: v.pieceRate,
    crewSize: v.crewSize,
    totalHours,
  });
  const unitInfo = PIECE_UNITS[v.unit];
  const valid = v.quantity > 0 && v.pieceRate > 0 && totalHours > 0;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Total subcontract payout",
      net: `${formatNumber(v.quantity)} ${unitInfo.unit} × ${formatMoney(v.pieceRate)}`,
      waste: "—",
      order: formatMoney(t.totalPayout),
      note: "Turnkey piecework contract",
      highlight: true,
    },
    {
      label: "Effective hourly yield",
      net: `${formatNumber(v.crewSize)} workers · ${formatNumber(totalHours)} hrs`,
      waste: "—",
      order: `${formatMoney(t.effectiveHourly)}/hr`,
      note: "per worker",
    },
    {
      label: "Production velocity",
      net: `${formatNumber(v.quantity)} ${unitInfo.unit}`,
      waste: "—",
      order: `${formatNumber(t.velocity)} /man-hr`,
      note: "units installed per man-hour",
    },
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Quantity, piece rate, and time must be positive.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Subcontractor Turnkey Piecework — ${unitInfo.label}`,
      category: "financial-business",
      quantity: v.quantity,
      unit: unitInfo.unit,
      unitCost: v.pieceRate,
      wastePercent: 0,
      notes: `${formatMoney(v.pieceRate)}/${unitInfo.unit} · crew of ${v.crewSize} · ~${formatNumber(t.manHours)} man-hrs · ≈${formatMoney(t.effectiveHourly)}/hr effective.`,
    });
    toast.success("1 line added to Master Bid Cart", {
      description: formatMoney(t.totalPayout),
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={UNIT_LABELS}
          active={unitInfo.label}
          onChange={(label) => {
            const id = (Object.keys(PIECE_UNITS) as PieceUnit[]).find(
              (k) => PIECE_UNITS[k].label === label,
            );
            if (id) set("unit", id);
          }}
        />
      </div>
      <PresetStepper
        id="sp-qty"
        label={`Quantity (${unitInfo.unit})`}
        value={v.quantity}
        onChange={(n) => set("quantity", Math.round(n))}
        unit={unitInfo.unit}
        step={v.unit === "flooring-sqft" ? 100 : 10}
        min={0}
      />
      <CostInput
        id="sp-rate"
        label={`Agreed piece rate`}
        value={v.pieceRate}
        onChange={(n) => set("pieceRate", n)}
        perUnit={`$/ ${unitInfo.unit}`}
      />
      <PresetStepper
        id="sp-crew"
        label="Crew size"
        value={v.crewSize}
        onChange={(n) => set("crewSize", Math.round(n))}
        unit="installers"
        step={1}
        min={1}
        max={50}
      />
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Days (8-hr)", "Total hours"]}
          active={v.timeMode === "days" ? "Days (8-hr)" : "Total hours"}
          onChange={(l) => set("timeMode", l.startsWith("Days") ? "days" : "hours")}
        />
      </div>
      <PresetStepper
        id="sp-time"
        label="Estimated completion time"
        value={v.timeValue}
        onChange={(n) => set("timeValue", Math.round(n))}
        unit={v.timeMode === "days" ? "days" : "hours"}
        step={1}
        min={0}
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatMoney(t.totalPayout),
        unit: "",
        label: "Total sub payout",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `Subcontractor — ${formatNumber(v.quantity)} ${unitInfo.unit}`, amount: t.totalPayout },
      ]}
      total={t.totalPayout}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add subcontract line to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatMoney(t.totalPayout),
        unit: "payout",
        label: `≈ ${formatMoney(t.effectiveHourly)}/hr per worker`,
      }}
    />
  );
}
