/**
 * BuildCalc Pro PresetStepper (Phase 4A).
 *
 * Ergonomic numeric input for dusty/gloved hands: 44px+ stepper buttons,
 * quick-preset chips, unit badge, keyboard arrows. The standard numeric
 * input for every calculator in the universal shell.
 */
"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseLooseNumber } from "@/lib/utils";

export interface PresetOption {
  label: string;
  value: number;
}

interface PresetStepperProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Unit badge, e.g. "ft", "%", "cu yd". */
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  /** Display decimals for the text field. */
  decimals?: number;
  presets?: PresetOption[];
  hint?: string;
  disabled?: boolean;
}

export function PresetStepper({
  id,
  label,
  value,
  onChange,
  unit,
  step = 1,
  min,
  max,
  decimals,
  presets,
  hint,
  disabled = false,
}: PresetStepperProps) {
  const [text, setText] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const format = React.useCallback(
    (v: number) => {
      if (!Number.isFinite(v)) return "";
      if (decimals !== undefined) return v.toFixed(decimals);
      return String(Math.round(v * 10000) / 10000);
    },
    [decimals],
  );

  React.useEffect(() => {
    if (!focused) setText(format(value));
  }, [value, focused, format]);

  const clampVal = (n: number) => {
    let next = n;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  const commit = (raw: string) => {
    const parsed = parseLooseNumber(raw);
    if (parsed === null) {
      setText(format(value));
      return;
    }
    const next = clampVal(parsed);
    onChange(next);
    setText(format(next));
  };

  const nudge = (dir: 1 | -1) => {
    const base = Number.isFinite(value) ? value : 0;
    const d = (String(step).split(".")[1] ?? "").length;
    const next = clampVal(Number((base + dir * step).toFixed(d)));
    onChange(next);
    setText(format(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-stretch gap-1.5">
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-11 shrink-0 rounded-lg px-0"
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
            placeholder={format(0)}
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
            className="h-11 pr-14 font-mono text-lg font-semibold"
            aria-describedby={hint ? `${id}-hint` : undefined}
          />
          {unit && (
            <Badge
              variant="unit"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs"
            >
              {unit}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-11 shrink-0 rounded-lg px-0"
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
                const next = clampVal(p.value);
                onChange(next);
                setText(format(next));
              }}
              className={cn(
                "min-h-[36px] rounded-full border px-3 py-1.5 font-mono text-xs font-bold transition-colors",
                "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#ED7D22] hover:text-[#ED7D22]",
                value === p.value && "border-[#ED7D22] bg-[#ED7D22]/10 text-[#ED7D22]",
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
