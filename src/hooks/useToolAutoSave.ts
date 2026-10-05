/**
 * BuildCalc Pro — Universal tool state hook (Phase 4A).
 *
 * `useToolAutoSave<T>(toolSlug, initialValues)`:
 * - Restores the contractor's last inputs from localStorage on mount
 *   (key `tool_state_<slug>`; migrates legacy `buildcalc_draft_<slug>` once).
 * - Debounces writes by 300ms — typing never thrashes storage.
 * - Exposes `values`, `setValues` (partial merge), `resetToDefaults()`,
 *   `isDirty`, and `flush()` for an immediate write.
 *
 * T must be a flat record of JSON-safe primitives.
 */
"use client";

import * as React from "react";

export function toolStateKey(slug: string): string {
  return `tool_state_${slug}`;
}

function legacyDraftKey(slug: string): string {
  return `buildcalc_draft_${slug}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Merge stored values over defaults: known keys only, sane primitives only. */
function sanitize<T extends Record<string, unknown>>(
  stored: unknown,
  defaults: T,
): T {
  if (!isRecord(stored)) return { ...defaults };
  const out: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const sv = stored[key];
    const dv = defaults[key];
    if (typeof sv !== typeof dv) continue;
    if (typeof sv === "number" && !Number.isFinite(sv)) continue;
    out[key] = sv;
  }
  return out as T;
}

function readInitial<T extends Record<string, unknown>>(
  slug: string,
  defaults: T,
): T {
  if (typeof window === "undefined") return { ...defaults };
  try {
    // 1. Current autosave key.
    const raw = window.localStorage.getItem(toolStateKey(slug));
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isRecord(parsed) && parsed.app === "buildcalc-pro") {
        const values = isRecord(parsed.values) ? parsed.values : parsed;
        return sanitize(values, defaults);
      }
      return sanitize(parsed, defaults);
    }
    // 2. One-time migration from the Phase 2 manual-draft format.
    const legacy = window.localStorage.getItem(legacyDraftKey(slug));
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      if (
        isRecord(parsed) &&
        parsed.app === "buildcalc-pro" &&
        isRecord(parsed.inputs)
      ) {
        const migrated = sanitize(parsed.inputs, defaults);
        window.localStorage.setItem(
          toolStateKey(slug),
          JSON.stringify({
            app: "buildcalc-pro",
            kind: "tool-state",
            slug,
            savedAt: new Date().toISOString(),
            values: migrated,
          }),
        );
        window.localStorage.removeItem(legacyDraftKey(slug));
        return migrated;
      }
    }
  } catch {
    /* corrupt payload → defaults */
  }
  return { ...defaults };
}

export interface ToolAutoSave<T extends Record<string, unknown>> {
  values: T;
  /** Merge a partial patch into values (autosaved, debounced). */
  setValues: (patch: Partial<T>) => void;
  /** Set a single field. */
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  resetToDefaults: () => void;
  /** True when values differ from the defaults. */
  isDirty: boolean;
  /** Write to localStorage immediately (bypasses debounce). */
  flush: () => void;
}

export function useToolAutoSave<T extends Record<string, unknown>>(
  toolSlug: string,
  initialValues: T,
  opts?: { debounceMs?: number },
): ToolAutoSave<T> {
  const debounceMs = opts?.debounceMs ?? 300;
  const defaultsRef = React.useRef<T>(initialValues);
  const slugRef = React.useRef(toolSlug);
  const [values, setValuesState] = React.useState<T>(() =>
    readInitial(toolSlug, initialValues),
  );
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const valuesRef = React.useRef(values);
  valuesRef.current = values;

  const write = React.useCallback(() => {
    try {
      window.localStorage.setItem(
        toolStateKey(slugRef.current),
        JSON.stringify({
          app: "buildcalc-pro",
          kind: "tool-state",
          slug: slugRef.current,
          savedAt: new Date().toISOString(),
          values: valuesRef.current,
        }),
      );
    } catch {
      /* private mode / quota — the tool still works in-memory */
    }
  }, []);

  const flush = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    write();
  }, [write]);

  // Debounced persist on every change.
  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      write();
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [values, write, debounceMs]);

  // Flush on unmount so no keystroke is lost.
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        write();
      }
    };
  }, [write]);

  const setValues = React.useCallback((patch: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...patch }));
  }, []);

  const set = React.useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetToDefaults = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setValuesState({ ...defaultsRef.current });
    // Write defaults immediately so a stale draft can't resurrect.
    try {
      window.localStorage.setItem(
        toolStateKey(slugRef.current),
        JSON.stringify({
          app: "buildcalc-pro",
          kind: "tool-state",
          slug: slugRef.current,
          savedAt: new Date().toISOString(),
          values: { ...defaultsRef.current },
        }),
      );
    } catch {
      /* noop */
    }
  }, []);

  const isDirty = React.useMemo(
    () =>
      JSON.stringify(values) !== JSON.stringify(defaultsRef.current),
    [values],
  );

  return { values, setValues, set, resetToDefaults, isDirty, flush };
}
