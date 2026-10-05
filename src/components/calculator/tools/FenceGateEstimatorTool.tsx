/**
 * BuildCalc Pro — Wood & Chain-Link Fence Material Estimator (Batch 4E).
 *
 * Posts, rails, pickets / fabric rolls, gate kits, and fast-set concrete.
 * Dispatches up to 4 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { fenceTakeoff, type FenceType } from "@/lib/math/exteriorFraming";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "fence-gate-estimator";

interface FenceInputs extends Record<string, unknown> {
  fenceType: FenceType;
  totalLF: number;
  heightFt: 4 | 6 | 8;
  postSpacingFt: 6 | 8;
  picketWidthIn: 3.5 | 5.5;
  railCount: number;
  singleGates: number;
  doubleGates: number;
  costPerPost: number;
  costPerRail: number;
  costPerPicket: number;
  costPerConcreteBag: number;
  costPerFabricRoll: number;
  costPerGateKit: number;
}

const DEFAULTS: FenceInputs = {
  fenceType: "wood",
  totalLF: 150,
  heightFt: 6,
  postSpacingFt: 8,
  picketWidthIn: 5.5,
  railCount: 3,
  singleGates: 1,
  doubleGates: 0,
  costPerPost: 16,
  costPerRail: 7,
  costPerPicket: 3.4,
  costPerConcreteBag: 6.8,
  costPerFabricRoll: 95,
  costPerGateKit: 85,
};

export function FenceGateEstimatorTool() {
  const { values: v, set, resetToDefaults } =
    useToolAutoSave<FenceInputs>(SLUG, DEFAULTS);
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Wood & Chain-Link Fence Material Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = fenceTakeoff({
    fenceType: v.fenceType,
    totalLF: v.totalLF,
    heightFt: v.heightFt,
    postSpacingFt: v.postSpacingFt,
    picketWidthIn: v.picketWidthIn,
    railCount: v.railCount,
    singleGates: v.singleGates,
    doubleGates: v.doubleGates,
  });
  const valid = v.totalLF > 0;
  const isWood = v.fenceType === "wood";

  const postCost = t.posts * v.costPerPost;
  const railCost = t.rails * v.costPerRail;
  const picketCost = t.pickets * v.costPerPicket;
  const fabricCost = t.fabricRolls * v.costPerFabricRoll;
  const concreteCost = t.concreteBags * v.costPerConcreteBag;
  const gateCost = t.gateKits * v.costPerGateKit;
  const total =
    postCost + railCost + picketCost + fabricCost + concreteCost + gateCost;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `Posts — ${v.heightFt} ft ${isWood ? "wood" : "galvanized steel"}`,
      net: `${formatNumber(t.sections)} sections`,
      waste: "—",
      order: `${formatNumber(t.posts)} posts`,
      note: `${v.postSpacingFt}′ O.C. + gate posts`,
      highlight: true,
    },
    ...(isWood
      ? [
          {
            label: "Horizontal rails — 2×4",
            net: `${v.railCount} per section`,
            waste: "+5%",
            order: `${formatNumber(t.rails)} rails`,
            note: "8-ft stock",
          } as MaterialRow,
          {
            label: `Pickets — ${v.picketWidthIn}″ dog-ear`,
            net: `${formatNumber(v.totalLF)} lin ft`,
            waste: "+10%",
            order: `${formatNumber(t.pickets)} pickets`,
            note: "¼″ gap allowance",
            highlight: true,
          } as MaterialRow,
        ]
      : [
          {
            label: "Chain-link fabric — 50-ft rolls",
            net: `${formatNumber(v.totalLF)} lin ft`,
            waste: "—",
            order: `${formatNumber(t.fabricRolls)} rolls`,
            note: `${v.heightFt} ft height · incl. top rail & ties in hardware`,
            highlight: true,
          } as MaterialRow,
        ]),
    {
      label: "Post concrete — 60-lb fast-set",
      net: `${formatNumber(t.posts)} holes`,
      waste: "—",
      order: `${formatNumber(t.concreteBags)} bags`,
      note: "2 bags per hole",
    },
    ...(t.gateKits > 0
      ? [
          {
            label: "Gate kits",
            net: `${v.singleGates} single · ${v.doubleGates} double`,
            waste: "—",
            order: `${formatNumber(t.gateKits)} kits`,
            note: "Hinges, latch & hardware",
          } as MaterialRow,
        ]
      : []),
  ];

  const handleAdd = () => {
    if (!valid || t.posts <= 0) {
      toast.error("Check your inputs", {
        description: "Total fence run must be greater than zero.",
      });
      return;
    }
    const ctx = `${isWood ? "Wood privacy" : "Chain-link"} · ${formatNumber(v.totalLF)} lin ft × ${v.heightFt} ft · ${v.postSpacingFt}′ O.C.`;
    let lines = 0;
    addItem({
      toolSlug: SLUG,
      title: `Fence Posts — ${v.heightFt} ft`,
      category: "site-exterior",
      quantity: t.posts,
      unit: "ea",
      unitCost: v.costPerPost,
      wastePercent: 0,
      notes: `${ctx} · incl. gate posts.`,
    });
    lines++;
    if (isWood) {
      addItem({
        toolSlug: SLUG,
        title: "Fence Rails — 2×4 × 8 ft",
        category: "site-exterior",
        quantity: t.rails,
        unit: "ea",
        unitCost: v.costPerRail,
        wastePercent: 5,
        notes: `${ctx} · ${v.railCount} rails per section.`,
      });
      lines++;
      addItem({
        toolSlug: SLUG,
        title: `Fence Pickets — ${v.picketWidthIn}″`,
        category: "site-exterior",
        quantity: t.pickets,
        unit: "ea",
        unitCost: v.costPerPicket,
        wastePercent: 10,
        notes: `${ctx}.`,
      });
      lines++;
    } else {
      addItem({
        toolSlug: SLUG,
        title: `Chain-Link Fabric — ${v.heightFt} ft × 50 ft rolls`,
        category: "site-exterior",
        quantity: t.fabricRolls,
        unit: "ea",
        unitCost: v.costPerFabricRoll,
        wastePercent: 0,
        notes: `${ctx} · top rail, ties & tension hardware in post line.`,
      });
      lines++;
    }
    addItem({
      toolSlug: SLUG,
      title: "Post Concrete — 60-lb fast-set bags",
      category: "site-exterior",
      quantity: t.concreteBags,
      unit: "bags",
      unitCost: v.costPerConcreteBag,
      wastePercent: 0,
      notes: `${ctx} · 2 bags per hole.`,
    });
    lines++;
    if (t.gateKits > 0) {
      addItem({
        toolSlug: SLUG,
        title: "Gate Hardware Kits",
        category: "site-exterior",
        quantity: t.gateKits,
        unit: "ea",
        unitCost: v.costPerGateKit,
        wastePercent: 0,
        notes: `${ctx} · ${v.singleGates} single + ${v.doubleGates} double-drive gates.`,
      });
      lines++;
    }
    toast.success(`${lines} lines added to Master Bid Cart`, {
      description: `Posts ${formatMoney(postCost)} · ${isWood ? `Pickets ${formatMoney(picketCost)}` : `Fabric ${formatMoney(fabricCost)}`} · Concrete ${formatMoney(concreteCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Wood privacy fence", "Chain-link fence"]}
          active={isWood ? "Wood privacy fence" : "Chain-link fence"}
          onChange={(l) => set("fenceType", l.startsWith("Wood") ? "wood" : "chainlink")}
        />
      </div>

      <DimensionInput
        id="fe-run"
        label="Total fence run"
        valueFeet={v.totalLF}
        onChange={(f) => set("totalLF", f)}
        minFeet={0}
      />
      <div className="sm:col-span-1">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Fence height
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Fence height">
          {[4, 6, 8].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                set("heightFt", h as 4 | 6 | 8);
                if (isWood) set("railCount", h >= 6 ? 3 : 2);
              }}
              aria-pressed={v.heightFt === h}
              className={
                "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors " +
                (v.heightFt === h
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary")
              }
            >
              {h} ft
            </button>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["6 ft O.C. posts", "8 ft O.C. posts"]}
          active={v.postSpacingFt === 6 ? "6 ft O.C. posts" : "8 ft O.C. posts"}
          onChange={(l) => set("postSpacingFt", l.startsWith("6") ? 6 : 8)}
        />
      </div>

      {isWood && (
        <>
          <div className="sm:col-span-2">
            <TradeFilterTabs
              subtrades={['3.5" pickets', '5.5" pickets']}
              active={v.picketWidthIn === 3.5 ? '3.5" pickets' : '5.5" pickets'}
              onChange={(l) => set("picketWidthIn", l.startsWith("3") ? 3.5 : 5.5)}
            />
          </div>
          <PresetStepper
            id="fe-rails"
            label="Rails per section"
            value={v.railCount}
            onChange={(n) => set("railCount", Math.round(n))}
            unit="rails"
            step={1}
            min={1}
            max={4}
            presets={[
              { label: "2 (4 ft)", value: 2 },
              { label: "3 (6 ft+)", value: 3 },
            ]}
          />
        </>
      )}

      <PresetStepper
        id="fe-sgates"
        label="Single gates (4 ft)"
        value={v.singleGates}
        onChange={(n) => set("singleGates", Math.round(n))}
        unit="gates"
        step={1}
        min={0}
        max={10}
      />
      <PresetStepper
        id="fe-dgates"
        label="Double drive gates (10 ft)"
        value={v.doubleGates}
        onChange={(n) => set("doubleGates", Math.round(n))}
        unit="gates"
        step={1}
        min={0}
        max={10}
      />

      <CostInput
        id="fe-costpost"
        label="Cost per post"
        value={v.costPerPost}
        onChange={(n) => set("costPerPost", n)}
        perUnit="$/post"
      />
      {isWood ? (
        <>
          <CostInput
            id="fe-costrail"
            label="Cost per 2×4 rail"
            value={v.costPerRail}
            onChange={(n) => set("costPerRail", n)}
            perUnit="$/8 ft"
          />
          <CostInput
            id="fe-costpicket"
            label="Cost per picket"
            value={v.costPerPicket}
            onChange={(n) => set("costPerPicket", n)}
            perUnit="$/picket"
          />
        </>
      ) : (
        <CostInput
          id="fe-costroll"
          label="Cost per fabric roll"
          value={v.costPerFabricRoll}
          onChange={(n) => set("costPerFabricRoll", n)}
          perUnit="$/50 ft"
        />
      )}
      <CostInput
        id="fe-costconc"
        label="Fast-set concrete"
        value={v.costPerConcreteBag}
        onChange={(n) => set("costPerConcreteBag", n)}
        perUnit="$/60 lb"
      />
      <CostInput
        id="fe-costgate"
        label="Gate hardware kit"
        value={v.costPerGateKit}
        onChange={(n) => set("costPerGateKit", n)}
        perUnit="$/kit"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(isWood ? t.pickets : t.fabricRolls),
        unit: isWood ? "PICKETS" : "ROLLS",
        label: isWood ? "Pickets to order" : "Fabric rolls to order",
      }}
      wastePercent={isWood ? 10 : 0}
      materials={materials}
      materialCosts={[
        { label: `Posts — ${formatNumber(t.posts)} × ${formatMoney(v.costPerPost)}`, amount: Math.round(postCost * 100) / 100 },
        ...(isWood
          ? [
              { label: `Rails — ${formatNumber(t.rails)} × ${formatMoney(v.costPerRail)}`, amount: Math.round(railCost * 100) / 100 },
              { label: `Pickets — ${formatNumber(t.pickets)} × ${formatMoney(v.costPerPicket)}`, amount: Math.round(picketCost * 100) / 100 },
            ]
          : [{ label: `Fabric — ${formatNumber(t.fabricRolls)} × ${formatMoney(v.costPerFabricRoll)}`, amount: Math.round(fabricCost * 100) / 100 }]),
        { label: `Concrete — ${formatNumber(t.concreteBags)} × ${formatMoney(v.costPerConcreteBag)}`, amount: Math.round(concreteCost * 100) / 100 },
        ...(t.gateKits > 0
          ? [{ label: `Gates — ${formatNumber(t.gateKits)} × ${formatMoney(v.costPerGateKit)}`, amount: Math.round(gateCost * 100) / 100 }]
          : []),
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add fence lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(isWood ? t.pickets : t.fabricRolls),
        unit: isWood ? "pickets" : "rolls",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
