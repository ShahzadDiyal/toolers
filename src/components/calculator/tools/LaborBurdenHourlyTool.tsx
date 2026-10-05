/**
 * BuildCalc Pro True Burdened Labor Rate & Payroll Cost (Batch 4G).
 *
 * Base wage vs. true employer cost per billable hour. Dispatches 1 line.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { burdenTakeoff } from "@/lib/math/financialAndUtilities";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "labor-burden-hourly";

interface BurdenInputs extends Record<string, unknown> {
  baseWage: number;
  ficaPct: number;
  unemploymentPct: number;
  workersCompPer100: number;
  glMode: "pct" | "annual";
  glPctOfPayroll: number;
  glAnnualPremium: number;
  ptoHolidays: number;
  ptoVacation: number;
  annualBenefits: number;
  billableEfficiencyPct: number;
  crewSize: number;
  estHours: number;
}

const DEFAULTS: BurdenInputs = {
  baseWage: 28,
  ficaPct: 7.65,
  unemploymentPct: 3.5,
  workersCompPer100: 8.5,
  glMode: "pct",
  glPctOfPayroll: 2.5,
  glAnnualPremium: 3600,
  ptoHolidays: 6,
  ptoVacation: 10,
  annualBenefits: 4800,
  billableEfficiencyPct: 80,
  crewSize: 3,
  estHours: 480,
};

export function LaborBurdenHourlyTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<BurdenInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "True Burdened Labor Rate & Payroll Cost",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = burdenTakeoff({
    baseWage: v.baseWage,
    ficaPct: v.ficaPct,
    unemploymentPct: v.unemploymentPct,
    workersCompPer100: v.workersCompPer100,
    glPctOfPayroll: v.glPctOfPayroll,
    glAnnualPremium: v.glAnnualPremium,
    glMode: v.glMode,
    ptoDays: v.ptoHolidays + v.ptoVacation,
    annualBenefits: v.annualBenefits,
    billableEfficiencyPct: v.billableEfficiencyPct,
  });
  const valid = v.baseWage > 0;
  const laborCost = v.crewSize * v.estHours * t.burdenedRate;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "True cost per billable hour",
      net: `${formatMoney(v.baseWage)}/hr base`,
      waste: "—",
      order: `${formatMoney(t.burdenedRate)}/hr`,
      note: `+${formatNumber(t.burdenPct)}% burden`,
      highlight: true,
    },
    ...t.breakdown.map((b) => ({
      label: b.label,
      net: "—",
      waste: "—",
      order: formatMoney(b.amount),
      note: "per year",
    }) as MaterialRow),
    {
      label: "Billable hours / year",
      net: `${formatNumber(v.billableEfficiencyPct)}% efficiency`,
      waste: "—",
      order: `${formatNumber(t.billableHours)} hrs`,
      note: `2,080 hrs − PTO − unbillable time`,
    },
  ];

  // Simple bar visualization of the annual breakdown.
  const maxBreakdown = Math.max(...t.breakdown.map((b) => b.amount), 1);
  const bars = (
    <div className="space-y-2" aria-label="Annual cost breakdown">
      {t.breakdown.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{b.label}</span>
            <span className="font-mono font-bold text-zinc-200">{formatMoney(b.amount)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(2, (b.amount / maxBreakdown) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Base wage must be greater than zero.",
      });
      return;
    }
    addItem({
      toolSlug: SLUG,
      title: `Labor Allocation Burdened Crew (${v.crewSize} workers)`,
      category: "financial-business",
      quantity: v.crewSize * v.estHours,
      unit: "hrs",
      unitCost: t.burdenedRate,
      wastePercent: 0,
      notes: `${formatMoney(v.baseWage)}/hr base → ${formatMoney(t.burdenedRate)}/hr burdened (+${formatNumber(t.burdenPct)}%).`,
    });
    toast.success("1 line added to Master Bid Cart", {
      description: `${v.crewSize * v.estHours} crew-hrs · ${formatMoney(laborCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <CostInput
        id="lb-wage"
        label="Base hourly wage"
        value={v.baseWage}
        onChange={(n) => set("baseWage", n)}
        perUnit="$/hr"
      />
      <PresetStepper
        id="lb-fica"
        label="FICA (Soc Sec + Medicare)"
        value={v.ficaPct}
        onChange={(n) => set("ficaPct", n)}
        unit="%"
        step={0.05}
        min={0}
        max={20}
        presets={[{ label: "7.65%", value: 7.65 }]}
      />
      <PresetStepper
        id="lb-unemp"
        label="FUTA / SUTA unemployment"
        value={v.unemploymentPct}
        onChange={(n) => set("unemploymentPct", n)}
        unit="%"
        step={0.1}
        min={0}
        max={15}
        presets={[{ label: "3.5%", value: 3.5 }]}
      />
      <PresetStepper
        id="lb-wc"
        label="Workers' comp rate"
        value={v.workersCompPer100}
        onChange={(n) => set("workersCompPer100", n)}
        unit="$/100"
        step={0.5}
        min={0}
        max={40}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["GL as % of payroll", "GL annual premium"]}
          active={v.glMode === "pct" ? "GL as % of payroll" : "GL annual premium"}
          onChange={(l) => set("glMode", l.startsWith("GL as") ? "pct" : "annual")}
        />
      </div>
      {v.glMode === "pct" ? (
        <PresetStepper
          id="lb-glpct"
          label="General liability"
          value={v.glPctOfPayroll}
          onChange={(n) => set("glPctOfPayroll", n)}
          unit="% payroll"
          step={0.25}
          min={0}
          max={15}
        />
      ) : (
        <CostInput
          id="lb-glann"
          label="GL annual premium"
          value={v.glAnnualPremium}
          onChange={(n) => set("glAnnualPremium", n)}
          perUnit="$/yr"
        />
      )}

      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Paid time off & benefits
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PresetStepper
            id="lb-hol"
            label="Paid holidays"
            value={v.ptoHolidays}
            onChange={(n) => set("ptoHolidays", Math.round(n))}
            unit="days/yr"
            step={1}
            min={0}
            max={20}
          />
          <PresetStepper
            id="lb-vac"
            label="Vacation / sick"
            value={v.ptoVacation}
            onChange={(n) => set("ptoVacation", Math.round(n))}
            unit="days/yr"
            step={1}
            min={0}
            max={30}
          />
          <CostInput
            id="lb-ben"
            label="Direct benefits"
            value={v.annualBenefits}
            onChange={(n) => set("annualBenefits", n)}
            perUnit="$/yr"
          />
        </div>
      </div>

      <PresetStepper
        id="lb-eff"
        label="Billable efficiency"
        value={v.billableEfficiencyPct}
        onChange={(n) => set("billableEfficiencyPct", n)}
        unit="%"
        step={1}
        min={10}
        max={100}
        presets={[{ label: "80%", value: 80 }]}
      />

      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Bid allocation (for the estimate line)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PresetStepper
            id="lb-crew"
            label="Crew size"
            value={v.crewSize}
            onChange={(n) => set("crewSize", Math.round(n))}
            unit="workers"
            step={1}
            min={1}
            max={50}
          />
          <PresetStepper
            id="lb-hours"
            label="Est. billable hours"
            value={v.estHours}
            onChange={(n) => set("estHours", Math.round(n))}
            unit="hrs"
            step={8}
            min={0}
          />
        </div>
      </div>
      <div className="sm:col-span-2">{bars}</div>
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatMoney(t.burdenedRate),
        unit: "/HR",
        label: "True burdened cost",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `Labor ${v.crewSize * v.estHours} crew-hrs × ${formatMoney(t.burdenedRate)}`, amount: Math.round(laborCost * 100) / 100 },
      ]}
      total={Math.round(laborCost * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add labor line to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatMoney(t.burdenedRate),
        unit: "/hr burdened",
        label: `+${formatNumber(t.burdenPct)}% over base wage`,
      }}
    />
  );
}
