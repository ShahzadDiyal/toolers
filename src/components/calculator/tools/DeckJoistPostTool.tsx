/**
 * BuildCalc Pro — Decking, Joist & Post Estimator (Batch 4E).
 *
 * Field joists, rim/ledger boards, decking planks, support posts,
 * post concrete, and fastener packs. Dispatches 3 estimate lines.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { deckTakeoff, type DeckBoardType } from "@/lib/math/exteriorFraming";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { DimensionInput } from "@/components/calculator/inputs/DimensionInput";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "deck-joist-post";

interface DeckInputs extends Record<string, unknown> {
  widthFt: number;
  projectionFt: number;
  joistSpacingIn: 12 | 16;
  boardType: DeckBoardType;
  postSpacingFt: number;
  postHoleDepthIn: number;
  costPerJoistBoard: number;
  costPerDeckBoardLF: number;
  costPerPost: number;
  costPerConcreteBag: number;
  costPerFastenerPack: number;
}

const DEFAULTS: DeckInputs = {
  widthFt: 16,
  projectionFt: 12,
  joistSpacingIn: 16,
  boardType: "composite",
  postSpacingFt: 8,
  postHoleDepthIn: 36,
  costPerJoistBoard: 18,
  costPerDeckBoardLF: 3.2,
  costPerPost: 24,
  costPerConcreteBag: 6.5,
  costPerFastenerPack: 42,
};

export function DeckJoistPostTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<DeckInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Decking, Joist & Post Estimator",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const t = deckTakeoff({
    widthFt: v.widthFt,
    projectionFt: v.projectionFt,
    joistSpacingIn: v.joistSpacingIn,
    boardType: v.boardType,
    postSpacingFt: v.postSpacingFt,
    postHoleDepthIn: v.postHoleDepthIn,
  });
  const valid = v.widthFt > 0 && v.projectionFt > 0;

  const framingQty = t.fieldJoists + t.rimLedgerBoards;
  const framingCost = framingQty * v.costPerJoistBoard;
  const deckingCost = t.deckingLF * v.costPerDeckBoardLF;
  const footingCost =
    t.posts * v.costPerPost + t.concreteBags * v.costPerConcreteBag;
  const fastenerCost = t.fastenerPacks * v.costPerFastenerPack;
  const total = framingCost + deckingCost + footingCost + fastenerCost;
  const boardLabel =
    v.boardType === "composite" ? "5/4×6 composite / PVC" : "2×6 pressure-treated";

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = [
    {
      label: `Field joists — ${v.joistSpacingIn}″ O.C.`,
      net: `${formatNumber(v.widthFt)} ft span`,
      waste: "—",
      order: `${formatNumber(t.fieldJoists)} boards`,
      note: "16-ft stock · +1 starter joist",
      highlight: true,
    },
    {
      label: "Rim & ledger boards",
      net: `${formatNumber(2 * v.widthFt + 2 * v.projectionFt)} lin ft`,
      waste: "—",
      order: `${formatNumber(t.rimLedgerBoards)} boards`,
      note: "16-ft stock lengths",
    },
    {
      label: `Decking — ${boardLabel}`,
      net: `${formatNumber(t.deckAreaSqft)} sq ft`,
      waste: "+10%",
      order: `${formatNumber(t.deckingPlanks)} planks`,
      note: `${formatNumber(t.deckingLF)} lin ft · ¼″ gap`,
      highlight: true,
    },
    {
      label: `Support posts — ${formatNumber(v.postHoleDepthIn)}″ holes`,
      net: `${formatNumber(v.postSpacingFt)}′ O.C.`,
      waste: "—",
      order: `${formatNumber(t.posts)} posts`,
      note: "4×4 or 6×6, per local code",
    },
    {
      label: "Post concrete — 80-lb bags",
      net: `${formatNumber(t.posts)} footings`,
      waste: "—",
      order: `${formatNumber(t.concreteBags)} bags`,
      note: "2 bags per post",
    },
    {
      label: "Hidden fastener packs",
      net: `${formatNumber(t.deckAreaSqft)} sq ft`,
      waste: "—",
      order: `${formatNumber(t.fastenerPacks)} packs`,
      note: "100 sq ft coverage per pack",
    },
  ];

  const handleAdd = () => {
    if (!valid || t.fieldJoists <= 0) {
      toast.error("Check your inputs", {
        description: "Deck width and projection must be greater than zero.",
      });
      return;
    }
    const ctx = `${formatNumber(v.widthFt)}×${formatNumber(v.projectionFt)} ft deck · ${v.joistSpacingIn}″ O.C. joists · ${boardLabel}`;
    addItem({
      toolSlug: SLUG,
      title: "Framing Lumber — Joists, Rim & Ledger",
      category: "site-exterior",
      quantity: framingQty,
      unit: "ea",
      unitCost: v.costPerJoistBoard,
      wastePercent: 0,
      notes: `${ctx} · ${t.fieldJoists} field joists + ${t.rimLedgerBoards} rim/ledger (16-ft stock).`,
    });
    addItem({
      toolSlug: SLUG,
      title: `Decking Surface Boards — ${boardLabel}`,
      category: "site-exterior",
      quantity: t.deckingLF,
      unit: "lf",
      unitCost: v.costPerDeckBoardLF,
      wastePercent: 10,
      notes: `${ctx} · ${t.deckingPlanks} planks, ¼″ gap.`,
    });
    addItem({
      toolSlug: SLUG,
      title: "Footing Posts & Concrete",
      category: "site-exterior",
      quantity: t.posts,
      unit: "ea",
      unitCost: Math.round((v.costPerPost + 2 * v.costPerConcreteBag) * 100) / 100,
      wastePercent: 0,
      notes: `${ctx} · ${t.posts} posts + ${t.concreteBags} 80-lb concrete bags (${formatNumber(v.postHoleDepthIn)}″ holes).`,
    });
    toast.success("3 lines added to Master Bid Cart", {
      description: `Framing ${formatMoney(framingCost)} · Decking ${formatMoney(deckingCost)} · Footings ${formatMoney(footingCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <DimensionInput
        id="dk-width"
        label="Width along house"
        valueFeet={v.widthFt}
        onChange={(f) => set("widthFt", f)}
        minFeet={0}
      />
      <DimensionInput
        id="dk-proj"
        label="Projection from house"
        valueFeet={v.projectionFt}
        onChange={(f) => set("projectionFt", f)}
        minFeet={0}
      />

      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={['12" O.C. — composite/diagonal', '16" O.C. — standard wood']}
          active={
            v.joistSpacingIn === 12
              ? '12" O.C. — composite/diagonal'
              : '16" O.C. — standard wood'
          }
          onChange={(l) => set("joistSpacingIn", l.startsWith('12"') ? 12 : 16)}
        />
      </div>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["5/4×6 composite / PVC", "2×6 pressure-treated pine"]}
          active={
            v.boardType === "composite"
              ? "5/4×6 composite / PVC"
              : "2×6 pressure-treated pine"
          }
          onChange={(l) =>
            set("boardType", l.startsWith("5/4") ? "composite" : "pt2x6")
          }
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          5.5″ face + ¼″ gap per board · 10% cut waste included.
        </p>
      </div>

      <PresetStepper
        id="dk-postspace"
        label="Post spacing"
        value={v.postSpacingFt}
        onChange={(n) => set("postSpacingFt", n)}
        unit="ft O.C."
        step={1}
        min={4}
        max={12}
        presets={[
          { label: "6′", value: 6 },
          { label: "8′", value: 8 },
        ]}
      />
      <PresetStepper
        id="dk-holedepth"
        label="Post hole depth"
        value={v.postHoleDepthIn}
        onChange={(n) => set("postHoleDepthIn", n)}
        unit="in"
        step={6}
        min={12}
        max={60}
        presets={[
          { label: '24"', value: 24 },
          { label: '36"', value: 36 },
          { label: '48"', value: 48 },
        ]}
      />

      <CostInput
        id="dk-costjoist"
        label="Cost per joist board"
        value={v.costPerJoistBoard}
        onChange={(n) => set("costPerJoistBoard", n)}
        perUnit="$/16 ft"
      />
      <CostInput
        id="dk-costdeck"
        label="Decking cost"
        value={v.costPerDeckBoardLF}
        onChange={(n) => set("costPerDeckBoardLF", n)}
        perUnit="$/lin ft"
      />
      <CostInput
        id="dk-costpost"
        label="Cost per post"
        value={v.costPerPost}
        onChange={(n) => set("costPerPost", n)}
        perUnit="$/post"
      />
      <CostInput
        id="dk-costconc"
        label="Post concrete"
        value={v.costPerConcreteBag}
        onChange={(n) => set("costPerConcreteBag", n)}
        perUnit="$/80 lb"
      />
      <CostInput
        id="dk-costfast"
        label="Fastener pack"
        value={v.costPerFastenerPack}
        onChange={(n) => set("costPerFastenerPack", n)}
        perUnit="$/100 sq ft"
      />
    </>
  );

  const results = (
    <ResultsCard
      primaryMetric={{
        value: formatNumber(t.deckingPlanks),
        unit: "PLANKS",
        label: "Decking planks to order",
      }}
      wastePercent={10}
      materials={materials}
      materialCosts={[
        { label: `Framing — ${formatNumber(framingQty)} × ${formatMoney(v.costPerJoistBoard)}`, amount: Math.round(framingCost * 100) / 100 },
        { label: `Decking — ${formatNumber(t.deckingLF)} lf × ${formatMoney(v.costPerDeckBoardLF)}`, amount: Math.round(deckingCost * 100) / 100 },
        { label: `Footings — ${formatNumber(t.posts)} posts + ${formatNumber(t.concreteBags)} bags`, amount: Math.round(footingCost * 100) / 100 },
        { label: `Fasteners — ${formatNumber(t.fastenerPacks)} × ${formatMoney(v.costPerFastenerPack)}`, amount: Math.round(fastenerCost * 100) / 100 },
      ]}
      total={Math.round(total * 100) / 100}
      onAddToEstimate={handleAdd}
      onReset={resetToDefaults}
      shareValues={v}
      addLabel="Add deck lines to Master Estimate"
    />
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: formatNumber(t.deckingPlanks),
        unit: "planks",
        label: `Total · ${formatMoney(Math.round(total * 100) / 100)}`,
      }}
    />
  );
}
