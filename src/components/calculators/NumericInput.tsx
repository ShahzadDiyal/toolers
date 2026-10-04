/**
 * BuildCalc Pro — Job-site numeric input.
 *
 * Glare-proof architecture: oversized steppers, quick-preset chips
 * (16" O.C. vs 24" O.C., 4/12–8/12 pitches…), a glued-on unit badge,
 * and fraction-friendly parsing ("12' 3-3/8"", "3/8", "0.375").
 */
"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseArchitecturalLength } from "@/lib/math/units";
import { parseLooseNumber } from "@/lib/utils";

export interface PresetChip {
  label: string;
  value: number;
}

interface NumericInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Unit badge text: ft, in, sq ft, cu yd, bags, % … */
  unit: string;
  step?: number;
  min?: number;
  max?: number;
  /** Quick-preset chips rendered under the input (e.g. stud spacing). */
  presets?: PresetChip[];
  /**
   * When true, typed text like `12' 3-3/8"` or `3/8` is parsed to a decimal
   * on blur (length fields). When false, plain number parsing is used.
   */
  fractionFriendly?: boolean;
  hint?: string;
  disabled?: boolean;
}

export function NumericInput({
  id,
  label,
  value,
  onChange,
  unit,
  step = 1,
  min,
  max,
  presets,
  fractionFriendly = false,
  hint,
  disabled = false,
}: NumericInputProps) {
  const [text, setText] = React.useState<string>(String(value ?? ""));
  const [focused, setFocused] = React.useState(false);

  // Keep the text in sync when the value changes externally (presets, steppers).
  React.useEffect(() => {
    if (!focused) setText(String(value ?? ""));
  }, [value, focused]);

  const commit = (raw: string) => {
    let parsed: number | null = null;
    if (fractionFriendly) {
      const len = parseArchitecturalLength(raw);
      parsed = len ? len.feet : parseLooseNumber(raw);
    } else {
      parsed = parseLooseNumber(raw);
    }
    if (parsed === null) {
      setText(String(value ?? "")); // revert on garbage
      return;
    }
    let next = parsed;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onChange(next);
    setText(String(next));
  };

  const nudge = (dir: 1 | -1) => {
    const base = Number.isFinite(value) ? value : 0;
    let next = base + dir * step;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    // Avoid float drift: round to the step's precision.
    const decimals = (String(step).split(".")[1] ?? "").length;
    next = Number(next.toFixed(decimals));
    onChange(next);
    setText(String(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-stretch gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-lg"
          onClick={() => nudge(-1)}
          disabled={disabled}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-5 w-5" />
        </Button>

        <div className="relative flex-1">
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
              commit(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "ArrowUp") {
                e.preventDefault();
                nudge(1);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                nudge(-1);
              }
            }}
            className={cn(
              "h-11 pr-16 text-lg font-mono font-semibold",
              fractionFriendly && "font-mono",
            )}
            aria-describedby={hint ? `${id}-hint` : undefined}
          />
          <Badge
            variant="unit"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs"
          >
            {unit}
          </Badge>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-lg"
          onClick={() => nudge(1)}
          disabled={disabled}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${label} presets`}>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange(p.value);
                setText(String(p.value));
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold font-mono transition-colors",
                "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary",
                value === p.value &&
                  "border-primary bg-primary/15 text-primary",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {hint && (
        <p id={`${id}-hint`} className="text-xs text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Standalone preset-chip row (for non-numeric choices like pitch or grade). */
export function PresetChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: PresetChip[];
  value: number | string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-bold font-mono transition-colors min-h-[44px]",
              "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary",
              value === o.value && "border-primary bg-primary/15 text-primary",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
