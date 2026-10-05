/**
 * BuildCalc Pro DimensionInput (Phase 4A).
 *
 * The contractor's dimension field: toggle between "Decimal Feet",
 * "Inches", and "Feet + Inches + Fraction" entry. Always normalizes to
 * raw decimal feet for downstream math.
 *
 *   decimal:  14.625  → 14.625 ft
 *   inches:   175.5   → 14.625 ft
 *   fraction: 14' + 7 3/8" → 14.6146 ft
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseLooseNumber } from "@/lib/utils";
import { parseArchitecturalLength } from "@/lib/math/units";

type DimMode = "decimal" | "inches" | "fraction";

const MODES: { id: DimMode; label: string }[] = [
  { id: "decimal", label: "Decimal ft" },
  { id: "inches", label: "Inches" },
  { id: "fraction", label: "Ft + in" },
];

interface DimensionInputProps {
  id: string;
  label: string;
  /** Normalized decimal feet. */
  valueFeet: number;
  onChange: (feet: number) => void;
  presets?: { label: string; valueFeet: number }[];
  minFeet?: number;
  maxFeet?: number;
  hint?: string;
  disabled?: boolean;
  /** Which entry mode shows first. Default "decimal". */
  defaultMode?: DimMode;
}

export function DimensionInput({
  id,
  label,
  valueFeet,
  onChange,
  presets,
  minFeet,
  maxFeet,
  hint,
  disabled = false,
  defaultMode = "decimal",
}: DimensionInputProps) {
  const [mode, setMode] = React.useState<DimMode>(defaultMode);
  const [text, setText] = React.useState("");
  const [ftText, setFtText] = React.useState("");
  const [inText, setInText] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const clampFeet = (f: number) => {
    let n = f;
    if (minFeet !== undefined) n = Math.max(minFeet, n);
    if (maxFeet !== undefined) n = Math.min(maxFeet, n);
    return n;
  };

  // Sync display text when the value changes externally.
  React.useEffect(() => {
    if (focused) return;
    if (mode === "decimal") {
      setText(Number.isFinite(valueFeet) ? String(Math.round(valueFeet * 10000) / 10000) : "");
    } else if (mode === "inches") {
      setText(
        Number.isFinite(valueFeet) ? String(Math.round(valueFeet * 12 * 100) / 100) : "",
      );
    } else {
      const totalIn = valueFeet * 12;
      const ft = Math.floor(totalIn / 12);
      const inch = Math.round((totalIn - ft * 12) * 16) / 16;
      setFtText(Number.isFinite(ft) ? String(ft) : "");
      setInText(
        inch === 0 ? "" : String(inch),
      );
    }
  }, [valueFeet, mode, focused]);

  const commitDecimal = (raw: string) => {
    const n = parseLooseNumber(raw);
    if (n === null) {
      setText(String(valueFeet));
      return;
    }
    onChange(clampFeet(n));
  };

  const commitInches = (raw: string) => {
    const n = parseLooseNumber(raw);
    if (n === null) {
      setText(String(Math.round(valueFeet * 12 * 100) / 100));
      return;
    }
    onChange(clampFeet(n / 12));
  };

  const commitFraction = () => {
    const ft = parseLooseNumber(ftText) ?? 0;
    // Inches field is fraction-friendly: "7 3/8", "7-3/8", "7.375"
    const parsed = parseArchitecturalLength(inText.trim() === "" ? "0" : inText);
    const inchFeet = parsed ? parsed.feet : 0;
    onChange(clampFeet(Math.max(0, ft) + Math.max(0, inchFeet)));
  };

  const applyPreset = (feet: number) => {
    onChange(clampFeet(feet));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div
          className="flex rounded-xl border border-zinc-200 bg-[#F1F5F9] p-0.5"
          role="group"
          aria-label={`${label} entry mode`}
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              disabled={disabled}
              className={cn(
                "min-h-[32px] rounded-lg px-2.5 text-[11px] font-bold transition-colors",
                mode === m.id
                  ? "bg-[#14284A] text-white shadow-sm"
                  : "text-[#5A6C85] hover:text-[#14284A]",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "fraction" ? (
        <div className="flex items-stretch gap-1.5">
          <div className="relative w-24 shrink-0">
            <Input
              type="text"
              inputMode="numeric"
              disabled={disabled}
              value={ftText}
              onChange={(e) => setFtText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                commitFraction();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-11 pr-8 text-center font-mono text-lg font-semibold"
              aria-label={`${label} feet`}
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#5A6C85]">
              ′
            </span>
          </div>
          <div className="relative flex-1">
            <Input
              id={id}
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={inText}
              placeholder="7 3/8"
              onChange={(e) => setInText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                commitFraction();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-11 pr-8 text-center font-mono text-lg font-semibold"
              aria-label={`${label} inches and fraction`}
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#5A6C85]">
              ″
            </span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={disabled}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              setFocused(false);
              if (mode === "decimal") commitDecimal(e.target.value);
              else commitInches(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="h-11 pr-12 font-mono text-lg font-semibold"
            aria-describedby={hint ? `${id}-hint` : undefined}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-zinc-200 bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-xs font-bold text-[#5A6C85]">
            {mode === "decimal" ? "ft" : "in"}
          </span>
        </div>
      )}

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${label} presets`}>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(p.valueFeet)}
              className={cn(
                "min-h-[36px] rounded-full border px-3 py-1.5 font-mono text-xs font-bold transition-colors",
                "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]",
                Math.abs(valueFeet - p.valueFeet) < 1e-9 &&
                  "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {hint && (
        <p id={`${id}-hint`} className="text-xs text-[#5A6C85]">
          {hint}
        </p>
      )}
    </div>
  );
}
