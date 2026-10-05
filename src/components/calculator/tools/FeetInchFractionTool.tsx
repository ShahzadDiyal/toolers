/**
 * BuildCalc Pro — Architectural Feet-Inches-Fraction Keypad (Batch 4G).
 *
 * Touch keypad for fractional dimension math. All arithmetic runs in
 * 16ths-of-an-inch integers to avoid IEEE-754 drift.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import {
  parseArchTo16ths,
  formatArchFrom16ths,
  sixteenthsToDecimalIn,
  sixteenthsToMetric,
  applyKeypadOp,
  type KeypadOp,
} from "@/lib/math/financialAndUtilities";
import { formatNumber } from "@/lib/utils";
import { useToolActions } from "@/components/tools/useToolActions";
import { ToolShell } from "@/components/calculator/ToolShell";
import { Copy, Delete, Equal } from "lucide-react";

const SLUG = "feet-inch-fraction";

interface KeypadPersisted extends Record<string, unknown> {
  history: string[];
}

const DEFAULTS: KeypadPersisted = { history: [] };

const FRACTIONS = [
  "1/16", "1/8", "3/16", "1/4", "5/16", "3/8", "7/16", "1/2",
  "9/16", "5/8", "11/16", "3/4", "13/16", "7/8", "15/16",
];

interface Token {
  value16: number;
  display: string;
  op: KeypadOp | null; // operator AFTER this token
}

function KeyBtn({
  children,
  onClick,
  className = "",
  accent = false,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  accent?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label ?? (typeof children === "string" ? children : undefined)}
      onClick={onClick}
      className={`flex min-h-[52px] items-center justify-center rounded-xl border text-base font-bold transition active:scale-95 ${
        accent
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border bg-zinc-900 text-zinc-100 hover:border-zinc-600"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function FeetInchFractionTool() {
  const { values: v, set } = useToolAutoSave<KeypadPersisted>(SLUG, DEFAULTS);
  const addItem = useEstimateStore((s) => s.addItem);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  const [entry, setEntry] = React.useState("");
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const [result16, setResult16] = React.useState<number | null>(null);

  useToolActions({
    toolTitle: "Architectural Feet-Inches-Fraction Keypad",
    resetInputs: () => {
      setEntry("");
      setTokens([]);
      setResult16(null);
    },
    saveDraft: () => {
      toast.info("Keypad history is auto-saved", {
        description: "Your recent calculations persist on this device.",
      });
    },
  });

  /* ---------------- keypad logic ---------------- */
  const pushEntry = (op: KeypadOp | null): Token[] => {
    const trimmed = entry.trim();
    if (!trimmed) return tokens;
    const tok: Token = {
      value16: parseArchTo16ths(trimmed),
      display: trimmed,
      op,
    };
    const next = [...tokens, tok];
    setTokens(next);
    setEntry("");
    return next;
  };

  const pressOp = (op: KeypadOp) => {
    setResult16(null);
    // Chaining: start a new expression from the last result.
    if (tokens.length === 0 && entry.trim() === "" && lastResultRef.current !== null) {
      const r = lastResultRef.current;
      setTokens([{ value16: r, display: formatArchFrom16ths(r), op }]);
      return;
    }
    pushEntry(op);
  };

  const lastResultRef = React.useRef<number | null>(null);

  const pressEquals = () => {
    const all = pushEntry(null);
    if (all.length === 0) return;
    let acc = all[0].value16;
    for (let i = 0; i < all.length - 1; i++) {
      const op = all[i].op;
      if (!op) break;
      acc = applyKeypadOp(acc, op, all[i + 1].value16);
    }
    if (Number.isNaN(acc)) {
      toast.error("Cannot divide by zero");
      return;
    }
    setResult16(acc);
    lastResultRef.current = acc;
    setTokens([]);
    setEntry("");
    const expr = all
      .map((t, i) => t.display + (t.op && i < all.length - 1 ? ` ${t.op} ` : ""))
      .join("");
    const res = formatArchFrom16ths(acc);
    set("history", [`${expr} = ${res}`, ...v.history].slice(0, 12));
  };

  const pressClear = () => {
    setEntry("");
    setTokens([]);
    setResult16(null);
    lastResultRef.current = null;
  };

  const pressBack = () => {
    setResult16(null);
    setEntry((e) => e.trimEnd().slice(0, -1));
  };

  const exprText =
    tokens.map((t) => `${t.display} ${t.op ?? ""}`).join(" ").trim() +
    (entry ? (tokens.length ? " " : "") + entry : "");

  const resultText = result16 !== null ? formatArchFrom16ths(result16) : null;
  const decIn = result16 !== null ? sixteenthsToDecimalIn(result16) : null;
  const metric = result16 !== null ? sixteenthsToMetric(result16) : null;
  const decFt =
    result16 !== null ? Math.round((result16 / 16 / 12) * 10000) / 10000 : null;

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`, { description: text });
    } catch {
      toast.error("Copy failed — your browser blocked clipboard access");
    }
  };

  const pushToEstimate = () => {
    if (result16 === null) {
      toast.error("Nothing to push yet", {
        description: "Run a calculation first.",
      });
      return;
    }
    const hist = v.history[0] ?? `${resultText}`;
    addItem({
      toolSlug: SLUG,
      title: "Field measurement calc",
      category: "utilities",
      quantity: 1,
      unit: "calc",
      unitCost: 0,
      wastePercent: 0,
      notes: hist,
    });
    toast.success("Measurement saved to Master Bid Cart", {
      description: hist,
      action: { label: "View cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* ---------------- layout ---------------- */
  const keypad = (
    <div className="rounded-2xl border border-border bg-zinc-950/60 p-4 sm:col-span-2">
      {/* display */}
      <div className="mb-4 rounded-xl bg-[#0b1b33] p-4 shadow-[var(--shadow-readout)]">
        <p className="min-h-[1.5rem] break-words font-mono text-sm text-white/60">
          {exprText || " "}
        </p>
        <p className="mt-1 break-words font-mono text-3xl font-black text-white">
          {resultText ?? (entry ? parsePreview(entry) : "0\"")}
        </p>
        {result16 !== null && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-white/70">
            <span>{formatNumber(decIn ?? 0)} in</span>
            <span>{formatNumber(decFt ?? 0)} ft</span>
            <span>
              {formatNumber(metric?.mm ?? 0)} mm · {formatNumber(metric?.m ?? 0)} m
            </span>
          </div>
        )}
      </div>

      {/* dimensional + fraction row */}
      <div className="mb-2 grid grid-cols-5 gap-2">
        <KeyBtn onClick={() => setEntry((e) => e + "' ")} accent label="feet">
          ′ ft
        </KeyBtn>
        <KeyBtn onClick={() => setEntry((e) => e + '"')} accent label="inches">
          ″ in
        </KeyBtn>
        <KeyBtn onClick={pressBack} label="backspace">
          <Delete className="h-5 w-5" />
        </KeyBtn>
        <KeyBtn onClick={pressClear} label="clear" className="col-span-2">
          Clear
        </KeyBtn>
      </div>

      {/* digits */}
      <div className="mb-2 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <KeyBtn key={d} onClick={() => setEntry((e) => e + d)}>
            {d}
          </KeyBtn>
        ))}
        <KeyBtn onClick={() => setEntry((e) => e + "0")}>0</KeyBtn>
        <KeyBtn onClick={() => setEntry((e) => e + ".")}>.</KeyBtn>
        <KeyBtn onClick={() => setEntry((e) => e + " ")} label="space">
          ␣
        </KeyBtn>
      </div>

      {/* fractions */}
      <p className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        Fraction presets
      </p>
      <div className="mb-2 grid grid-cols-5 gap-2">
        {FRACTIONS.map((f) => (
          <KeyBtn
            key={f}
            onClick={() => setEntry((e) => e + " " + f + " ")}
            className="min-h-[44px] text-sm"
          >
            {f}
          </KeyBtn>
        ))}
      </div>

      {/* operators */}
      <div className="grid grid-cols-5 gap-2">
        {(["+", "-", "×", "÷"] as KeypadOp[]).map((op) => (
          <KeyBtn key={op} onClick={() => pressOp(op)} accent>
            {op}
          </KeyBtn>
        ))}
        <KeyBtn onClick={pressEquals} accent label="equals" className="bg-primary text-primary-foreground">
          <Equal className="h-5 w-5" />
        </KeyBtn>
      </div>

      {/* actions */}
      {result16 !== null && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => copy(resultText!, "Result")}
            className="flex min-h-[44px] items-center justify-center gap-1 rounded-xl border border-border bg-zinc-900 text-xs font-bold text-zinc-200"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
          <button
            type="button"
            onClick={() => copy(`${decFt} ft`, "Decimal feet")}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-zinc-900 text-xs font-bold text-zinc-200"
          >
            Copy {decFt} ft
          </button>
          <button
            type="button"
            onClick={pushToEstimate}
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground"
          >
            → Estimate
          </button>
        </div>
      )}
    </div>
  );

  const history = (
    <div className="rounded-2xl border border-border bg-zinc-950/60 p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        Recent calculations
      </p>
      {v.history.length === 0 ? (
        <p className="text-sm text-zinc-500">No calculations yet — results appear here.</p>
      ) : (
      <ul className="space-y-1.5">
        {v.history.map((h, i) => (
          <li key={i} className="flex items-center justify-between gap-2 font-mono text-xs text-zinc-400">
            <span className="break-words">{h}</span>
            <button
              type="button"
              onClick={() => copy(h.split(" = ")[1] ?? h, "Result")}
              className="shrink-0 rounded-lg border border-border px-2 py-1 text-[10px] font-bold text-zinc-300"
            >
              Copy
            </button>
          </li>
        ))}
      </ul>
      )}
    </div>
  );

  return (
    <ToolShell
      inputs={keypad}
      results={history}
      summary={{
        value: resultText ?? "—",
        unit: "",
        label: result16 !== null ? `${formatNumber(decIn ?? 0)} in · ${formatNumber(metric?.mm ?? 0)} mm` : "Tap keys to build a dimension",
      }}
    />
  );
}

/** Live preview of the in-progress entry as a dimension string. */
function parsePreview(entry: string): string {
  try {
    const v16 = parseArchTo16ths(entry);
    return formatArchFrom16ths(v16);
  } catch {
    return entry;
  }
}
