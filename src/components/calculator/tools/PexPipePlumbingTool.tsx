/**
 * BuildCalc Pro — PEX Plumbing Pipe Runs & WSFU Sizer (Batch 4F).
 *
 * IPC fixture-unit main sizing, home-run vs trunk-and-branch footage,
 * coil counts, manifold ports, and fitting packs. Dispatches 3 lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { pexTakeoff, type PexSystem } from "@/lib/math/mepAndFinishes";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "pex-pipe-plumbing";

interface PexInputs extends Record<string, unknown> {
  system: PexSystem;
  fullBaths: number;
  halfBaths: number;
  kitchens: number;
  laundry: number;
  hoseBibbs: number;
  avgRunFt: number;
  costPerHalfCoil: number;
  costPerMainFt: number;
  costPerFittingPack: number;
}

const DEFAULTS: PexInputs = {
  system: "homerun",
  fullBaths: 2,
  halfBaths: 1,
  kitchens: 1,
  laundry: 1,
  hoseBibbs: 2,
  avgRunFt: 30,
  costPerHalfCoil: 42,
  costPerMainFt: 1.9,
  costPerFittingPack: 28,
};

export function PexPipePlumbingTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<PexInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "PEX Plumbing Pipe Runs & WSFU Sizer",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = pexTakeoff({
    system: v.system,
    fullBaths: v.fullBaths,
    halfBaths: v.halfBaths,
    kitchens: v.kitchens,
    laundry: v.laundry,
    hoseBibbs: v.hoseBibbs,
    avgRunFt: v.avgRunFt,
  });
  const valid = t.coldConnections + t.hotConnections > 0;

  const coilCost = (t.coldCoils + t.hotCoils) * v.costPerHalfCoil;
  const mainCost = t.mainTrunkFt * v.costPerMainFt;
  const fittingCost = t.fittingPacks * v.costPerFittingPack;
  const total = coilCost + mainCost + fittingCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: '½″ PEX — blue (cold)',
      net: `${t.coldConnections} connections`,
      waste: "+15%",
      order: `${formatNumber(t.coldCoils)} coils`,
      note: `${formatNumber(t.coldFt)} ft · 100-ft coils`,
      highlight: true,
    },
    {
      label: '½″ PEX — red (hot)',
      net: `${t.hotConnections} connections`,
      waste: "+15%",
      order: `${formatNumber(t.hotCoils)} coils`,
      note: `${formatNumber(t.hotFt)} ft · 100-ft coils`,
      highlight: true,
    },
    {
      label: `Main supply — ${t.mainSizeIn} PEX`,
      net: `${formatNumber(t.totalWsfu)} WSFU`,
      waste: "—",
      order: `${formatNumber(t.mainTrunkFt)} ft`,
      note:
        t.totalWsfu <= 14
          ? "≤ 14 WSFU → ¾″ main per IPC"
          : "> 14 WSFU → 1″ main per IPC",
    },
    {
      label: "Brass fittings & crimp rings",
      net: `${t.coldConnections + t.hotConnections} connections`,
      waste: "—",
      order: `${formatNumber(t.fittingPacks)} packs`,
      note: "10-pack fittings",
    },
    ...(v.system === "homerun"
      ? [
          {
            label: "Manifold ports",
            net: `${t.coldConnections} cold + ${t.hotConnections} hot`,
            waste: "—",
            order: `${formatNumber(t.manifoldPorts)} ports`,
            note: "Dedicated home-run ports",
          } as MaterialRow,
        ]
      : []),
  ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: "Add at least one fixture to size the system.",
      });
      return;
    }
    const ctx = `${v.system === "homerun" ? "Home-run manifold" : "Trunk & branch"} · ${formatNumber(t.totalWsfu)} WSFU · ${t.mainSizeIn} main`;
    addItem({
      toolSlug: SLUG,
      title: "PEX Tubing Coils — ½″ Hot & Cold",
      category: "mep",
      quantity: t.coldCoils + t.hotCoils,
      unit: "ea",
      unitCost: v.costPerHalfCoil,
      wastePercent: 0,
      notes: `${ctx} · ${t.coldCoils} cold + ${t.hotCoils} hot 100-ft coils (15% slack).`,
    });
    addItem({
      toolSlug: SLUG,
      title: `Main Supply Line — ${t.mainSizeIn} PEX`,
      category: "mep",
      quantity: t.mainTrunkFt,
      unit: "lf",
      unitCost: v.costPerMainFt,
      wastePercent: 0,
      notes: `${ctx}.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "PEX Brass Fittings & Crimp Rings",
      category: "mep",
      quantity: t.fittingPacks,
      unit: "ea",
      unitCost: v.costPerFittingPack,
      wastePercent: 0,
      notes: `${ctx} · 10-pack fittings.`,
    });
    toast.success("3 lines added to Master Bid Cart", {
      description: `Coils ${formatMoney(coilCost)} · Main ${formatMoney(mainCost)} · Fittings ${formatMoney(fittingCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Home run (central manifold)", "Trunk and branch"]}
          active={v.system === "homerun" ? "Home run (central manifold)" : "Trunk and branch"}
          onChange={(l) => set("system", l.startsWith("Home") ? "homerun" : "trunk")}
        />
      </div>

      <div className="sm:col-span-2 rounded-xl border border-border bg-zinc-950/60 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Fixture takeoff
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PresetStepper
            id="px-fullbath"
            label="Full baths"
            value={v.fullBaths}
            onChange={(n) => set("fullBaths", Math.round(n))}
            unit="3.5 WSFU"
            step={1}
            min={0}
            max={10}
          />
          <PresetStepper
            id="px-halfbath"
            label="Half baths"
            value={v.halfBaths}
            onChange={(n) => set("halfBaths", Math.round(n))}
            unit="1.5 WSFU"
            step={1}
            min={0}
            max={10}
          />
          <PresetStepper
            id="px-kitchen"
            label="Kitchens"
            value={v.kitchens}
            onChange={(n) => set("kitchens", Math.round(n))}
            unit="2.0 WSFU"
            step={1}
            min={0}
            max={4}
          />
          <PresetStepper
            id="px-laundry"
            label="Laundry"
            value={v.laundry}
            onChange={(n) => set("laundry", Math.round(n))}
            unit="2.0 WSFU"
            step={1}
            min={0}
            max={4}
          />
          <PresetStepper
            id="px-hose"
            label="Hose bibbs"
            value={v.hoseBibbs}
            onChange={(n) => set("hoseBibbs", Math.round(n))}
            unit="2.5 WSFU"
            step={1}
            min={0}
            max={10}
          />
          <PresetStepper
            id="px-run"
            label="Avg run distance"
            value={v.avgRunFt}
            onChange={(n) => set("avgRunFt", n)}
            unit="ft"
            step={5}
            min={5}
            max={150}
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Total <span className="font-mono font-bold text-accent">{formatNumber(t.totalWsfu)} WSFU</span>
          {" "}→ <span className="font-mono font-bold text-accent">{t.mainSizeIn}</span> main supply
          {v.system === "homerun" && (
            <> · <span className="font-mono font-bold text-accent">{t.manifoldPorts}</span> manifold ports</>
          )}
        </p>
      </div>

      <CostInput
        id="px-costcoil"
        label="½″ PEX coil"
        value={v.costPerHalfCoil}
        onChange={(n) => set("costPerHalfCoil", n)}
        perUnit="$/100 ft"
      />
      <CostInput
        id="px-costmain"
        label="Main line PEX"
        value={v.costPerMainFt}
        onChange={(n) => set("costPerMainFt", n)}
        perUnit="$/lin ft"
      />
      <CostInput
        id="px-costfit"
        label="Fitting pack"
        value={v.costPerFittingPack}
        onChange={(n) => set("costPerFittingPack", n)}
        perUnit="$/10-pack"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: `${t.coldCoils + t.hotCoils}`,
        unit: "COILS",
        label: "½″ PEX coils to order",
      }}
      wastePercent={0}
      materials={materials}
      materialCosts={[
        { label: `Coils — ${t.coldCoils + t.hotCoils} × ${formatMoney(v.costPerHalfCoil)}`, amount: Math.round(coilCost * 100) / 100 },
        { label: `Main — ${formatNumber(t.mainTrunkFt)} × ${formatMoney(v.costPerMainFt)}/ft`, amount: Math.round(mainCost * 100) / 100 },
        { label: `Fittings — ${formatNumber(t.fittingPacks)} × ${formatMoney(v.costPerFittingPack)}`, amount: Math.round(fittingCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add plumbing lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: `${t.coldCoils + t.hotCoils} coils`,
        unit: `${t.mainSizeIn} main`,
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
