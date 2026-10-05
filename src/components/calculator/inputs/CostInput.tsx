/**
 * BuildCalc Pro CostInput (Phase 4A).
 *
 * Dollar input with currency formatting and an optional per-unit label
 * (e.g. $/cu yd, $/sq ft, $/bundle). Formats to 2 decimals on blur.
 */
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { parseLooseNumber } from "@/lib/utils";

interface CostInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Per-unit label, e.g. "$/cu yd", "$/bundle". */
  perUnit?: string;
  min?: number;
  max?: number;
  hint?: string;
  disabled?: boolean;
}

export function CostInput({
  id,
  label,
  value,
  onChange,
  perUnit,
  min = 0,
  max,
  hint,
  disabled = false,
}: CostInputProps) {
  const [text, setText] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const format = (v: number) =>
    Number.isFinite(v) ? v.toFixed(2) : "";

  React.useEffect(() => {
    if (!focused) setText(format(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    const n = parseLooseNumber(raw);
    if (n === null) {
      setText(format(value));
      return;
    }
    let next = Math.max(min, n);
    if (max !== undefined) next = Math.min(max, next);
    onChange(Math.round(next * 100) / 100);
    setText(format(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-[#5A6C85]">
          $
        </span>
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
          }}
          className="h-11 pl-8 pr-20 font-mono text-lg font-semibold"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {perUnit && (
          <Badge
            variant="unit"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs"
          >
            {perUnit}
          </Badge>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-[#5A6C85]">
          {hint}
        </p>
      )}
    </div>
  );
}
