/**
 * BuildCalc Pro Conduit Fill & Voltage Drop Sizer (Phase 4C).
 *
 * Sub-modes: NEC Chapter 9 raceway fill (40%/31%/53%) and voltage-drop
 * sizing (3% branch-circuit guideline). Dispatches one package line:
 * "Conduit Raceway & Conductor Package".
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  CONDUIT_TYPES,
  TRADE_SIZES,
  WIRE_GAUGES_FILL,
  WIRE_GAUGES_VD,
  conduitFill,
  voltageDrop,
  type ConduitType,
  type Phase,
} from "@/lib/math/electricalData";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { CostInput } from "@/components/calculator/inputs/CostInput";
import { ResultsCard, type MaterialRow } from "@/components/calculator/results/ResultsCard";
import { ToolShell } from "@/components/calculator/ToolShell";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";
import { cn } from "@/lib/utils";

const SLUG = "conduit-fill-voltage-drop";

const VOLTAGES = [
  { label: "120V · 1φ", volts: 120, phase: "1P" as Phase },
  { label: "240V · 1φ", volts: 240, phase: "1P" as Phase },
  { label: "208V · 3φ", volts: 208, phase: "3P" as Phase },
  { label: "480V · 3φ", volts: 480, phase: "3P" as Phase },
];

interface ElectricalInputs extends Record<string, unknown> {
  subMode: "fill" | "vd";
  conduitType: ConduitType;
  tradeSize: string;
  qty14: number;
  qty12: number;
  qty10: number;
  qty8: number;
  qty6: number;
  qty4: number;
  voltageIdx: number;
  amps: number;
  distanceFt: number;
  material: "copper" | "aluminum";
  gauge: string;
  runLengthFt: number;
  costPerConduitFt: number;
  costPerWireFt: number;
}

const DEFAULTS: ElectricalInputs = {
  subMode: "fill",
  conduitType: "EMT",
  tradeSize: '3/4"',
  qty14: 0,
  qty12: 3,
  qty10: 0,
  qty8: 0,
  qty6: 0,
  qty4: 0,
  voltageIdx: 0,
  amps: 20,
  distanceFt: 75,
  material: "copper",
  gauge: "#12",
  runLengthFt: 100,
  costPerConduitFt: 1.85,
  costPerWireFt: 0.42,
};

function FillMeter({ pct, limit }: { pct: number; limit: number }) {
  const over = pct > limit;
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          NEC fill meter
        </p>
        <p
          className={cn(
            "font-mono text-2xl font-extrabold",
            over ? "text-red-400" : "text-green-400",
          )}
        >
          {pct.toFixed(1)}%
        </p>
      </div>
      <div className="relative mt-2 h-4 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            over ? "bg-red-500" : "bg-green-500",
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        {/* limit marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white/80"
          style={{ left: `${Math.min(100, limit)}%` }}
          title={`${limit}% NEC limit`}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-zinc-500">
        <span>
          Limit <span className="font-mono font-bold text-zinc-300">{limit}%</span>{" "}
          (NEC Ch.9 Table 1)
        </span>
        {over ? (
          <span className="flex items-center gap-1 font-bold text-red-400">
            <ShieldAlert className="h-3.5 w-3.5" /> OVERFILL
          </span>
        ) : (
          <span className="flex items-center gap-1 font-bold text-green-400">
            <ShieldCheck className="h-3.5 w-3.5" /> COMPLIANT
          </span>
        )}
      </div>
    </div>
  );
}

export function ConduitFillVoltageDropTool() {
  const { values: v, set, resetToDefaults } = useToolAutoSave<ElectricalInputs>(
    SLUG,
    DEFAULTS,
  );
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  useToolActions({
    toolTitle: "Conduit Fill & Voltage Drop",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `${SLUG}-inputs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify({ app: "buildcalc-pro", slug: SLUG, values: v }, null, 2),
      ),
  });

  const isFill = v.subMode === "fill";

  /* ---------------- Fill math ---------------- */
  const fill = conduitFill(v.conduitType, v.tradeSize, {
    "#14": v.qty14,
    "#12": v.qty12,
    "#10": v.qty10,
    "#8": v.qty8,
    "#6": v.qty6,
    "#4": v.qty4,
  });

  /* ---------------- Voltage-drop math ---------------- */
  const volt = VOLTAGES[v.voltageIdx] ?? VOLTAGES[0];
  const vd = voltageDrop(
    volt.volts,
    v.amps,
    v.distanceFt,
    v.material,
    v.gauge,
    volt.phase,
  );

  /* ---------------- Package pricing ---------------- */
  const conduitCost = v.runLengthFt * v.costPerConduitFt;
  const conductorFt =
    (isFill ? fill.wireCount : volt.phase === "3P" ? 3 : 2) * v.runLengthFt;
  const wireCost = conductorFt * v.costPerWireFt;
  const materialCost = conduitCost + wireCost;

  const valid = isFill
    ? fill.wireCount > 0
    : v.amps > 0 && v.distanceFt > 0;

  /* ---------------- Results ---------------- */
  const materials: MaterialRow[] = isFill
    ? [
        {
          label: `${v.conduitType} ${v.tradeSize} raceway`,
          net: `${fill.wireCount} conductors`,
          waste: "—",
          order: `${fill.fillPct.toFixed(1)}% fill`,
          note: fill.violation
            ? `OVERFILL exceeds ${fill.limitPct}% NEC limit`
            : `Within ${fill.limitPct}% NEC limit (Ch.9 Table 1)`,
          highlight: !fill.violation,
        },
        {
          label: "Recommended conduit",
          net: "—",
          waste: "—",
          order: fill.recommendedSize ?? "—",
          note: fill.recommendedSize
            ? `Smallest ${v.conduitType} that clears the limit`
            : "Enter conductors to size",
        },
        {
          label: "Conductor package",
          net: `${fill.wireCount} × ${formatNumber(v.runLengthFt)} ft`,
          waste: "—",
          order: `${formatNumber(conductorFt)} ft`,
          note: "THHN/THWN-2 copper",
        },
      ]
    : [
        {
          label: "Voltage drop",
          net: `${vd.voltsDropped} V`,
          waste: "—",
          order: `${vd.dropPct.toFixed(2)}%`,
          note: vd.warning
            ? "Exceeds 3% branch-circuit guideline"
            : "Within 3% guideline",
          highlight: !vd.warning,
        },
        {
          label: "Voltage at load",
          net: "—",
          waste: "—",
          order: `${vd.voltsAtLoad} V`,
          note: `of ${volt.volts} V source`,
        },
        {
          label: "Recommended wire",
          net: "—",
          waste: "—",
          order: vd.recommendedGauge ?? "—",
          note: vd.recommendedGauge
            ? `Smallest ${v.material} gauge ≤ 3% drop`
            : "Enter circuit details to size",
        },
      ];

  const handleAdd = () => {
    if (!valid) {
      toast.error("Check your inputs", {
        description: isFill
          ? "Enter at least one conductor."
          : "Current and distance must be greater than zero.",
      });
      return;
    }
    const summary = isFill
      ? `${v.conduitType} ${v.tradeSize} · ${fill.wireCount} conductors · ${fill.fillPct.toFixed(1)}% fill`
      : `${volt.label} · ${v.amps}A · ${v.distanceFt} ft · ${vd.dropPct.toFixed(2)}% drop (${v.material} ${v.gauge})`;
    addItem({
      toolSlug: SLUG,
      title: "Conduit Raceway & Conductor Package",
      category: "mep",
      quantity: 1,
      unit: "lot",
      unitCost: Math.round(materialCost * 100) / 100,
      wastePercent: 0,
      notes: `${summary} · ${formatNumber(v.runLengthFt)} ft raceway + ${formatNumber(conductorFt)} ft conductor. Verify against adopted NEC and AHJ.`,
    });
    toast.success("Added to Master Bid Cart", {
      description: `${summary} ${formatMoney(materialCost)}`,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- Inputs ---------------- */
  const qtyFields = [
    { key: "qty14", gauge: "#14" },
    { key: "qty12", gauge: "#12" },
    { key: "qty10", gauge: "#10" },
    { key: "qty8", gauge: "#8" },
    { key: "qty6", gauge: "#6" },
    { key: "qty4", gauge: "#4" },
  ] as const;

  const inputs = (
    <>
      <div className="sm:col-span-2">
        <TradeFilterTabs
          subtrades={["Conduit fill NEC 40% max", "Voltage drop 3% max"]}
          active={
            isFill ? "Conduit fill NEC 40% max" : "Voltage drop 3% max"
          }
          onChange={(l) =>
            set("subMode", l.startsWith("Conduit fill") ? "fill" : "vd")
          }
        />
      </div>

      {isFill ? (
        <>
          <div className="sm:col-span-2">
            <TradeFilterTabs
              subtrades={CONDUIT_TYPES.map((c) => c.label)}
              active={
                CONDUIT_TYPES.find((c) => c.id === v.conduitType)?.label ?? ""
              }
              onChange={(l) =>
                set(
                  "conduitType",
                  CONDUIT_TYPES.find((c) => c.label === l)?.id ?? "EMT",
                )
              }
            />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
              Trade size
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Conduit trade size">
              {TRADE_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("tradeSize", s)}
                  aria-pressed={v.tradeSize === s}
                  className={cn(
                    "min-h-[44px] rounded-lg border px-4 font-mono text-sm font-bold transition-colors",
                    v.tradeSize === s
                      ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                      : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
              Conductors THHN/THWN-2 copper
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {qtyFields.map(({ key, gauge }) => (
                <PresetStepper
                  key={key}
                  id={`e-${key}`}
                  label={gauge}
                  value={v[key]}
                  onChange={(n) => set(key, n)}
                  unit="ea"
                  step={1}
                  min={0}
                  max={50}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="sm:col-span-2">
            <TradeFilterTabs
              subtrades={VOLTAGES.map((x) => x.label)}
              active={volt.label}
              onChange={(l) =>
                set(
                  "voltageIdx",
                  VOLTAGES.findIndex((x) => x.label === l),
                )
              }
            />
          </div>
          <PresetStepper
            id="e-amps"
            label="Circuit current"
            value={v.amps}
            onChange={(n) => set("amps", n)}
            unit="A"
            step={5}
            min={0}
            presets={[
              { label: "15A", value: 15 },
              { label: "20A", value: 20 },
              { label: "30A", value: 30 },
              { label: "50A", value: 50 },
            ]}
          />
          <PresetStepper
            id="e-dist"
            label="One-way distance"
            value={v.distanceFt}
            onChange={(n) => set("distanceFt", n)}
            unit="ft"
            step={5}
            min={0}
          />
          <div className="sm:col-span-2">
            <TradeFilterTabs
              subtrades={["Copper (K=12.9)", "Aluminum (K=21.2)"]}
              active={v.material === "copper" ? "Copper (K=12.9)" : "Aluminum (K=21.2)"}
              onChange={(l) =>
                set("material", l.startsWith("Copper") ? "copper" : "aluminum")
              }
            />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
              Wire gauge (AWG)
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Wire gauge">
              {WIRE_GAUGES_VD.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("gauge", g)}
                  aria-pressed={v.gauge === g}
                  className={cn(
                    "min-h-[44px] min-w-[52px] rounded-lg border px-3 font-mono text-sm font-bold transition-colors",
                    v.gauge === g
                      ? "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]"
                      : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="sm:col-span-2 rounded-xl border border-border bg-[#F8FAFC] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Raceway package for the estimate
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PresetStepper
            id="e-run"
            label="Raceway length"
            value={v.runLengthFt}
            onChange={(n) => set("runLengthFt", n)}
            unit="ft"
            step={10}
            min={0}
          />
          <CostInput
            id="e-conduitcost"
            label="Conduit"
            value={v.costPerConduitFt}
            onChange={(n) => set("costPerConduitFt", n)}
            perUnit="$/ft"
          />
          <CostInput
            id="e-wirecost"
            label="Conductor"
            value={v.costPerWireFt}
            onChange={(n) => set("costPerWireFt", n)}
            perUnit="$/ft"
          />
        </div>
      </div>
    </>
  );

  const results = (
    <div className="space-y-4">
      {isFill && <FillMeter pct={fill.fillPct} limit={fill.limitPct} />}
      <ResultsCard
        primaryMetric={
          isFill
            ? {
                value: `${fill.fillPct.toFixed(1)}%`,
                unit: "FILL",
                label: "Raceway fill",
              }
            : {
                value: `${vd.dropPct.toFixed(2)}%`,
                unit: "DROP",
                label: "Voltage drop",
              }
        }
        wastePercent={0}
        materials={materials}
        materialCosts={[
          {
            label: `Raceway ${formatNumber(v.runLengthFt)} ft × ${formatMoney(v.costPerConduitFt)}`,
            amount: Math.round(conduitCost * 100) / 100,
          },
          {
            label: `Conductors ${formatNumber(conductorFt)} ft × ${formatMoney(v.costPerWireFt)}`,
            amount: Math.round(wireCost * 100) / 100,
          },
        ]}
        total={Math.round(materialCost * 100) / 100}
        onAddToEstimate={handleAdd}
        onReset={resetToDefaults}
      shareValues={v}
      />
      <p className="-mt-1 px-1 text-[11px] text-zinc-600">
        Sizing aid only verify against the adopted NEC edition and your AHJ.
      </p>
    </div>
  );

  return (
    <ToolShell
      inputs={inputs}
      results={results}
      summary={{
        value: isFill ? `${fill.fillPct.toFixed(1)}%` : `${vd.dropPct.toFixed(2)}%`,
        unit: isFill ? "fill" : "drop",
        label: `Total · ${formatMoney(Math.round(materialCost * 100) / 100)}`,
      }}
    />
  );
}
