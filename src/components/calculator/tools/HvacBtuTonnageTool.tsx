/**
 * BuildCalc Pro — HVAC Heating/Cooling BTU Load & AC Tonnage Sizer (Batch 4F).
 *
 * Rule-of-thumb Manual-J-style sizing: climate zone base factors, ceiling
 * height, insulation, sun exposure, and occupants. Dispatches 2 lines.
 *
 * NOTE: budgeting/bid-scoping figures — not a substitute for an ACCA
 * Manual J load calculation.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  hvacTakeoff,
  CLIMATE_ZONES,
  type ClimateZone,
  type InsulationQuality,
  type SunExposure,
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

const SLUG = "hvac-btu-tonnage";

interface HvacInputs extends Record<string, unknown> {
  areaMode: "dims" | "sqft";
  lengthFt: number;
  widthFt: number;
  netSqft: number;
  ceilingHeightFt: number;
  climateZone: ClimateZone;
  insulation: InsulationQuality;
  sun: SunExposure;
  occupants: number;
  costPerTon: number;
  costPer10kBtuHeat: number;
}

const DEFAULTS: HvacInputs = {
  areaMode: "sqft",
  lengthFt: 40,
  widthFt: 30,
  netSqft: 1800,
  ceilingHeightFt: 8,
  climateZone: "zone34",
  insulation: "average",
  sun: "average",
  occupants: 4,
  costPerTon: 2400,
  costPer10kBtuHeat: 900,
};

const ZONES = Object.entries(CLIMATE_ZONES) as [
  ClimateZone,
  { label: string; coolingBtuPerSqft: number; heatingBtuPerSqft: number },
][];

const INSULATION: { label: string; value: InsulationQuality; hint: string }[] = [
  { label: "Poor / uninsulated", value: "poor", hint: "Older home · +20% load" },
  { label: "Average / code", value: "average", hint: "Standard construction · +0%" },
  { label: "High efficiency", value: "high", hint: "Spray foam / tight · −15%" },
];
const SUN: { label: string; value: SunExposure; hint: string }[] = [
  { label: "Heavy sun", value: "heavy", hint: "Large south glass · +10%" },
  { label: "Average", value: "average", hint: "+0%" },
  { label: "Shaded", value: "shaded", hint: "North-facing / trees · −10%" },
];

export function HvacBtuTonnageTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<HvacInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "HVAC BTU Load & AC Tonnage Sizer",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const areaSqft = v.areaMode === "dims" ? v.lengthFt * v.widthFt : v.netSqft;
  const t = hvacTakeoff({
    floorAreaSqft: areaSqft,
    ceilingHeightFt: v.ceilingHeightFt,
    climateZone: v.climateZone,
    insulation: v.insulation,
    sun: v.sun,
    occupants: v.occupants,
  });
  const valid = areaSqft > 0;
  const zone = CLIMATE_ZONES[v.climateZone];

  const coolingCost = t.acTons * v.costPerTon;
  const heatingCost = (t.heatingBtu / 10000) * v.costPer10kBtuHeat;
  const total = coolingCost + heatingCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: "Cooling load",
      net: `${formatNumber(t.baseCoolingBtu)} BTU/hr base`,
      waste: "—",
      order: `${formatNumber(t.adjustedCoolingBtu)} BTU/hr`,
      note: `${zone.label} · ${formatNumber(zone.coolingBtuPerSqft)} BTU/sq ft`,
      highlight: true,
    },
    {
      label: "AC condenser size",
      net: `${formatNumber(t.adjustedCoolingBtu)} BTU/hr`,
      waste: "—",
      order: `${formatNumber(t.acTons)} tons`,
      note: "Rounded up to nearest ½ ton",
      highlight: true,
    },
    {
      label: "Heating load",
      net: `${formatNumber(t.heatingBtu)} BTU/hr`,
      waste: "—",
      order: `${formatNumber(Math.round(t.heatingBtu / 100) / 10)}k BTU`,
      note: `${formatNumber(zone.heatingBtuPerSqft)} BTU/sq ft · ${v.climateZone === "zone57" ? "heating priority climate" : "cooling priority climate"}`,
    },
    {
      label: "Airflow requirement",
      net: `${formatNumber(t.acTons)} tons`,
      waste: "—",
      order: `${formatNumber(t.cfm)} CFM`,
      note: "≈400 CFM per ton",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.acTons <= 0) {
      toast.error("Check your inputs", {
        description: "Floor area must be greater than zero.",
      });
      return;
    }
    const ctx = `${formatNumber(areaSqft)} sq ft · ${zone.label} · ${formatNumber(t.adjustedCoolingBtu)} BTU/hr cooling`;
    addItem({
      toolSlug: SLUG,
      title: `HVAC Cooling Equipment — ${formatNumber(t.acTons)} Ton`,
      category: "mep",
      quantity: t.acTons,
      unit: "tons",
      unitCost: v.costPerTon,
      wastePercent: 0,
      notes: `${ctx}.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "HVAC Heating Unit / Air Handler",
      category: "mep",
      quantity: Math.round((t.heatingBtu / 10000) * 10) / 10,
      unit: "10k BTU",
      unitCost: v.costPer10kBtuHeat,
      wastePercent: 0,
      notes: `${ctx} · ${formatNumber(t.heatingBtu)} BTU/hr heating · ${formatNumber(t.cfm)} CFM. Rule-of-thumb sizing — confirm with Manual J.`,
    });
    toast.success("2 lines added to Master Bid Cart", {
      description: `Cooling ${formatMoney(coolingCost)} · Heating ${formatMoney(heatingCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["L × W dims", "Total sq ft"]}
          active={v.areaMode === "dims" ? "L × W dims" : "Total sq ft"}
          onChange={(l) => set("areaMode", l === "L × W dims" ? "dims" : "sqft")}
        />
      </div>

      {v.areaMode === "dims" ? (
        <>
          <DimensionInput
            id="hv-length"
            label="Length"
            valueFeet={v.lengthFt}
            onChange={(f) => set("lengthFt", f)}
            minFeet={0}
          />
          <DimensionInput
            id="hv-width"
            label="Width"
            valueFeet={v.widthFt}
            onChange={(f) => set("widthFt", f)}
            minFeet={0}
          />
        </>
      ) : (
        <PresetStepper
          id="hv-sqft"
          label="Floor area"
          value={v.netSqft}
          onChange={(n) => set("netSqft", n)}
          unit="sq ft"
          step={50}
          min={0}
        />
      )}
      <PresetStepper
        id="hv-ceil"
        label="Ceiling height"
        value={v.ceilingHeightFt}
        onChange={(n) => set("ceilingHeightFt", n)}
        unit="ft"
        step={1}
        min={7}
        max={20}
        presets={[
          { label: "8′", value: 8 },
          { label: "9′", value: 9 },
          { label: "10′", value: 10 },
        ]}
      />

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Climate zone
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Climate zone">
          {ZONES.map(([key, z]) => (
            <button
              key={key}
              type="button"
              onClick={() => set("climateZone", key)}
              aria-pressed={v.climateZone === key}
              title={`${z.coolingBtuPerSqft} BTU/sq ft cooling · ${z.heatingBtuPerSqft} BTU/sq ft heating`}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.climateZone === key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Insulation quality
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Insulation quality">
          {INSULATION.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set("insulation", o.value)}
              aria-pressed={v.insulation === o.value}
              title={o.hint}
              className={
                "min-h-[44px] rounded-lg border px-4 text-sm font-bold transition-colors " +
                (v.insulation === o.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={SUN.map((s) => s.label)}
          active={SUN.find((s) => s.value === v.sun)?.label ?? ""}
          onChange={(l) => set("sun", SUN.find((s) => s.label === l)?.value ?? "average")}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          {SUN.find((s) => s.value === v.sun)?.hint}
        </p>
      </div>

      <PresetStepper
        id="hv-occ"
        label="Occupants"
        value={v.occupants}
        onChange={(n) => set("occupants", Math.round(n))}
        unit="people"
        step={1}
        min={0}
        max={20}
      />

      <CostInput
        id="hv-costton"
        label="AC condenser"
        value={v.costPerTon}
        onChange={(n) => set("costPerTon", n)}
        perUnit="$/ton"
      />
      <CostInput
        id="hv-costheat"
        label="Heating unit"
        value={v.costPer10kBtuHeat}
        onChange={(n) => set("costPer10kBtuHeat", n)}
        perUnit="$/10k BTU"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.acTons),
        unit: "TONS",
        label: "Recommended AC size",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `Cooling — ${formatNumber(t.acTons)} × ${formatMoney(v.costPerTon)}/ton`, amount: Math.round(coolingCost * 100) / 100 },
        { label: `Heating — ${formatNumber(Math.round(t.heatingBtu / 100) / 10)} × ${formatMoney(v.costPer10kBtuHeat)}/10k`, amount: Math.round(heatingCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add HVAC lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: `${formatNumber(t.acTons)} tons`,
        unit: `${formatNumber(t.adjustedCoolingBtu)} BTU/hr`,
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
