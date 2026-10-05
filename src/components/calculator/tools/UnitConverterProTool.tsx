/**
 * BuildCalc Pro — Construction Area & Volume Unit Converter (Batch 4G).
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowLeftRight, Copy } from "lucide-react";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  CONVERTER_UNITS,
  CONVERTER_RULES,
  convertUnits,
  type ConverterDimension,
} from "@/lib/math/financialAndUtilities";
import { formatNumber } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";

const SLUG = "unit-converter-pro";

interface ConverterInputs extends Record<string, unknown> {
  dimension: ConverterDimension;
  fromId: string;
  toId: string;
  value: number;
}

const DEFAULTS: ConverterInputs = {
  dimension: "area",
  fromId: "sqft",
  toId: "sqyd",
  value: 1200,
};

const DIM_LABELS: Record<ConverterDimension, string> = {
  area: "Area",
  volume: "Volume",
  weight: "Weight",
};

export function UnitConverterProTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<ConverterInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Construction Area & Volume Unit Converter",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  /* ---------------- Math ---------------- */
  const units = CONVERTER_UNITS[v.dimension];
  const from = units.find((u) => u.id === v.fromId) ?? units[0];
  const to = units.find((u) => u.id === v.toId) ?? units[1];
  const converted = convertUnits(v.value, from, to);

  const setDimension = (dim: ConverterDimension) => {
    const us = CONVERTER_UNITS[dim];
    set("dimension", dim);
    set("fromId", us[0].id);
    set("toId", us[1].id);
  };

  const swap = () => {
    set("fromId", v.toId);
    set("toId", v.fromId);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied", { description: text });
    } catch {
      toast.error("Copy failed — your browser blocked clipboard access");
    }
  };

  const pushToEstimate = () => {
    addItem({
      toolSlug: SLUG,
      title: "Unit conversion reference",
      category: "utilities",
      quantity: 1,
      unit: "note",
      unitCost: 0,
      wastePercent: 0,
      notes: `${formatNumber(v.value)} ${from.short} = ${formatNumber(converted)} ${to.short}`,
    });
    toast.success("Conversion saved to Master Bid Cart", {
      description: `${formatNumber(v.value)} ${from.short} = ${formatNumber(converted)} ${to.short}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Area", "Volume", "Weight"]}
          active={DIM_LABELS[v.dimension]}
          onChange={(l) =>
            setDimension(
              (Object.keys(DIM_LABELS) as ConverterDimension[]).find(
                (k) => DIM_LABELS[k] === l,
              ) ?? "area",
            )
          }
        />
      </div>
      <PresetStepper
        id="uc-value"
        label="Value to convert"
        value={v.value}
        onChange={(n) => set("value", n)}
        unit={from.short}
        step={v.value >= 100 ? 10 : 1}
        min={0}
      />
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:col-span-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            From
          </span>
          <select
            value={from.id}
            onChange={(e) => set("fromId", e.target.value)}
            className="min-h-[52px] w-full rounded-xl border border-border bg-zinc-900 px-3 text-sm font-bold text-zinc-100"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={swap}
          aria-label="Swap direction"
          className="mb-1 flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary transition active:scale-95"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </button>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            To
          </span>
          <select
            value={to.id}
            onChange={(e) => set("toId", e.target.value)}
            className="min-h-[52px] w-full rounded-xl border border-border bg-zinc-900 px-3 text-sm font-bold text-zinc-100"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Rule-of-thumb cards */}
      <div className="sm:col-span-2">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Quick reference
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {CONVERTER_RULES.map((r) => (
            <button
              key={r.rule}
              type="button"
              onClick={() => copy(r.rule)}
              className="rounded-xl border border-border bg-zinc-950/60 p-3 text-left transition hover:border-zinc-600"
            >
              <p className="font-mono text-sm font-bold text-primary">{r.rule}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{r.detail}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  /* ---------------- Results ---------------- */
  const results = (
    <div className="rounded-2xl border border-border bg-zinc-950/60 p-4">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        Result
      </p>
      <p className="break-words font-mono text-3xl font-black text-primary">
        {formatNumber(converted)}{" "}
        <span className="text-base font-bold text-primary/70">{to.short}</span>
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-500">
        {formatNumber(v.value)} {from.short} → {to.short}
      </p>

      <div className="mt-4 border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          All {DIM_LABELS[v.dimension].toLowerCase()} units
        </p>
        <ul className="space-y-1">
          {units.map((u) => (
            <li
              key={u.id}
              className={`flex justify-between font-mono text-xs ${
                u.id === to.id ? "font-bold text-primary" : "text-zinc-400"
              }`}
            >
              <span>{u.label}</span>
              <span>{formatNumber(convertUnits(v.value, from, u))}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => copy(`${formatNumber(converted)} ${to.short}`)}
          className="flex min-h-[44px] items-center justify-center gap-1 rounded-xl border border-border bg-zinc-900 text-xs font-bold text-zinc-200"
        >
          <Copy className="h-3.5 w-3.5" /> Copy value
        </button>
        <button
          type="button"
          onClick={pushToEstimate}
          className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground"
        >
          → Estimate
        </button>
      </div>
    </div>
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: `${formatNumber(converted)}`,
        unit: to.short,
        label: `${formatNumber(v.value)} ${from.short} converted`,
      }}
    />
  );
}
