/**
 * BuildCalc Pro Daily Jobsite Overhead & Breakeven Rate (Batch 4G).
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { breakevenTakeoff } from "@/lib/math/financialAndUtilities";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "jobsite-breakeven";

interface BreakevenInputs extends Record<string, unknown> {
  vehicleCost: number;
  insuranceCost: number;
  officeCost: number;
  adminSalary: number;
  professionalFees: number;
  billableDays: number;
  profitTargetPct: number;
  projectDays: number;
}

const DEFAULTS: BreakevenInputs = {
  vehicleCost: 14400,
  insuranceCost: 7200,
  officeCost: 9600,
  adminSalary: 60000,
  professionalFees: 4800,
  billableDays: 220,
  profitTargetPct: 15,
  projectDays: 5,
};

export function JobsiteBreakevenTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<BreakevenInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Daily Jobsite Overhead & Breakeven Rate",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = breakevenTakeoff({
    vehicleCost: v.vehicleCost,
    insuranceCost: v.insuranceCost,
    officeCost: v.officeCost,
    adminSalary: v.adminSalary,
    professionalFees: v.professionalFees,
    billableDays: v.billableDays,
    profitTargetPct: v.profitTargetPct,
  });
  const allocation = v.projectDays * t.dailyOverhead;
  const valid = t.annualOverhead > 0;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Daily overhead (zero-profit breakeven)",
      net: `${formatMoney(t.annualOverhead)} / ${formatNumber(v.billableDays)} days`,
      waste: "—",
      order: `${formatMoney(t.dailyOverhead)}/day`,
      note: "The floor never bid below this",
      highlight: true,
    },
    {
      label: "Hourly shop overhead",
      net: "8-hr day",
      waste: "—",
      order: `${formatMoney(t.hourlyOverhead)}/hr`,
      note: "add to labor burden",
    },
    {
      label: `Survival rate (+${formatNumber(v.profitTargetPct)}% profit target)`,
      net: "dailyOverhead ÷ (1 − profit%)",
      waste: "—",
      order: `${formatMoney(t.survivalRate)}/day`,
      note: "minimum daily bid threshold",
    },
    ...t.breakdown.map(
      (b) =>
        ({
          label: b.label,
          net: "—",
          waste: "—",
          order: formatMoney(b.amount),
          note: "per year",
        }) as MaterialRow,
    ),
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Enter at least one fixed overhead cost.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Project Mobilization & Overhead Allocation (${v.projectDays} days)`,
      category: "financial-business",
      quantity: v.projectDays,
      unit: "days",
      unitCost: t.dailyOverhead,
      wastePercent: 0,
      notes: `Daily breakeven ${formatMoney(t.dailyOverhead)} · survival rate ${formatMoney(t.survivalRate)}/day at ${formatNumber(v.profitTargetPct)}% target.`,
    });
    toast.success("1 line added to Master Bid Cart", {
      description: `${v.projectDays} days · ${formatMoney(allocation)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Annual fixed overhead
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <CostInput
            id="jb-veh"
            label="Vehicles, fuel & maintenance"
            value={v.vehicleCost}
            onChange={(n) => set("vehicleCost", n)}
            perUnit="$/yr"
          />
          <CostInput
            id="jb-ins"
            label="Liability & umbrella insurance"
            value={v.insuranceCost}
            onChange={(n) => set("insuranceCost", n)}
            perUnit="$/yr"
          />
          <CostInput
            id="jb-off"
            label="Office, software & phone"
            value={v.officeCost}
            onChange={(n) => set("officeCost", n)}
            perUnit="$/yr"
          />
          <CostInput
            id="jb-adm"
            label="Owner / admin salary"
            value={v.adminSalary}
            onChange={(n) => set("adminSalary", n)}
            perUnit="$/yr"
          />
          <CostInput
            id="jb-pro"
            label="Legal, bookkeeping & tax"
            value={v.professionalFees}
            onChange={(n) => set("professionalFees", n)}
            perUnit="$/yr"
          />
        </div>
      </div>
      <PresetStepper
        id="jb-days"
        label="Billable jobsite days / yr"
        value={v.billableDays}
        onChange={(n) => set("billableDays", Math.round(n))}
        unit="days"
        step={5}
        min={50}
        max={365}
        presets={[{ label: "220", value: 220 }]}
      />
      <PresetStepper
        id="jb-profit"
        label="Profit buffer target"
        value={v.profitTargetPct}
        onChange={(n) => set("profitTargetPct", n)}
        unit="%"
        step={1}
        min={0}
        max={50}
        presets={[{ label: "15%", value: 15 }]}
      />
      <PresetStepper
        id="jb-projdays"
        label="Project duration (for allocation)"
        value={v.projectDays}
        onChange={(n) => set("projectDays", Math.round(n))}
        unit="days"
        step={1}
        min={1}
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatMoney(t.dailyOverhead),
        unit: "/DAY",
        label: "Daily overhead",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `Overhead allocation ${v.projectDays} days`, amount: Math.round(allocation * 100) / 100 },
      ]}
      total={Math.round(allocation * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add overhead line to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatMoney(t.dailyOverhead),
        unit: "/day breakeven",
        label: `survival ${formatMoney(t.survivalRate)}/day`,
      }}
    />
  );
}
