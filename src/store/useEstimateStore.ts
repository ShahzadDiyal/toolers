/**
 * BuildCalc Pro — Master Estimate store.
 *
 * Zustand + persist to `localStorage` (key `contractor_active_estimate`).
 * Zero backend: no database, no auth, no network calls. If localStorage is
 * unavailable (SSR, private mode, quota exceeded) the store transparently
 * falls back to an in-memory copy so the app keeps working.
 */
"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import {
  createEmptyEstimate,
  computeBidSummary,
  type BidSummary,
  type Category,
  type ClientInfo,
  type CompanyInfo,
  type EstimateLineItem,
  type MasterEstimateState,
} from "@/types/estimator";
import { masterEstimateSchema } from "@/lib/schemas";
import { serializeEstimate, deserializeEstimate } from "@/lib/export";
import { newId, clamp } from "@/lib/utils";
import { roundTo } from "@/lib/math/units";

export const ESTIMATE_STORAGE_KEY = "contractor_active_estimate";

/* ------------------------------------------------------------------ */
/*  Storage with graceful degradation                                  */
/* ------------------------------------------------------------------ */

/** In-memory fallback used when localStorage throws or is missing. */
function createMemoryStorage(): StateStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

/**
 * Safe storage: tries localStorage first, degrades to memory on any error.
 * Also surfaces whether persistence is actually durable (for the UI badge).
 */
export const storageHealth = {
  durable: false as boolean,
};

function createSafeStorage(): StateStorage {
  const memory = createMemoryStorage();
  const isBrowser = typeof window !== "undefined";

  const local: StateStorage = {
    getItem: (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memory.getItem(key);
      }
    },
    setItem: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
        storageHealth.durable = true;
      } catch {
        // Quota / privacy mode — keep the session working in memory.
        memory.setItem(key, value);
        storageHealth.durable = false;
      }
    },
    removeItem: (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        memory.removeItem(key);
      }
    },
  };

  if (isBrowser) {
    try {
      const probe = "__buildcalc_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      storageHealth.durable = true;
    } catch {
      storageHealth.durable = false;
    }
  }
  return isBrowser ? local : memory;
}

/* ------------------------------------------------------------------ */
/*  Store shape                                                       */
/* ------------------------------------------------------------------ */

export type NewLineItem = Omit<EstimateLineItem, "id" | "timestamp" | "totalCost"> & {
  totalCost?: number;
};

interface EstimateActions {
  /** Add a line; computes totalCost when omitted. Returns the new item id. */
  addItem: (item: NewLineItem) => string;
  /** Patch a line; recomputes totalCost when quantity/unitCost change. */
  updateItem: (id: string, patch: Partial<EstimateLineItem>) => void;
  removeItem: (id: string) => void;
  clearEstimate: (opts?: { keepBranding?: boolean }) => void;
  updateClientInfo: (patch: Partial<ClientInfo>) => void;
  updateCompanyInfo: (patch: Partial<CompanyInfo>) => void;
  setMarkup: (percent: number) => void;
  setTax: (percent: number) => void;
  setContingency: (percent: number) => void;
  /** Serialize the current document to a clean JSON string. */
  exportEstimate: () => string;
  /**
   * Restore from an exported JSON string. Validates with Zod first.
   * Returns `{ ok: false, error }` instead of throwing on bad files.
   */
  importEstimate: (json: string) => { ok: boolean; error?: string };
}

type EstimateStore = MasterEstimateState & EstimateActions;

const touch = (state: MasterEstimateState): Partial<MasterEstimateState> => ({
  updatedAt: new Date().toISOString(),
});

export const useEstimateStore = create<EstimateStore>()(
  persist(
    (set, get) => ({
      ...createEmptyEstimate(),

      addItem: (item) => {
        const id = newId("item");
        const quantity = Math.max(0, item.quantity || 0);
        const unitCost = Math.max(0, item.unitCost || 0);
        const totalCost =
          item.totalCost ?? roundTo(quantity * unitCost, 2);
        const line: EstimateLineItem = {
          ...item,
          id,
          quantity,
          unitCost,
          totalCost,
          wastePercent: clamp(item.wastePercent ?? 10, 0, 100),
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ items: [...s.items, line], ...touch(s) }));
        return id;
      },

      updateItem: (id, patch) => {
        set((s) => ({
          items: s.items.map((line) => {
            if (line.id !== id) return line;
            const next = { ...line, ...patch, id: line.id };
            if (
              patch.quantity !== undefined ||
              patch.unitCost !== undefined
            ) {
              next.totalCost = roundTo(
                Math.max(0, next.quantity) * Math.max(0, next.unitCost),
                2,
              );
            }
            if (patch.wastePercent !== undefined) {
              next.wastePercent = clamp(patch.wastePercent, 0, 100);
            }
            return next;
          }),
          ...touch(s),
        }));
      },

      removeItem: (id) => {
        set((s) => ({
          items: s.items.filter((line) => line.id !== id),
          ...touch(s),
        }));
      },

      clearEstimate: (opts) => {
        const current = get();
        const fresh = createEmptyEstimate();
        set({
          ...fresh,
          // Keep branding by default so clearing the bid doesn't wipe identity.
          company: opts?.keepBranding === false ? fresh.company : current.company,
          client: current.client,
          ...touch(fresh),
        });
      },

      updateClientInfo: (patch) => {
        set((s) => ({
          client: { ...s.client, ...patch },
          ...touch(s),
        }));
      },

      updateCompanyInfo: (patch) => {
        set((s) => ({
          company: { ...s.company, ...patch },
          ...touch(s),
        }));
      },

      setMarkup: (percent) => {
        set((s) => ({ markupPercent: clamp(percent, 0, 100), ...touch(s) }));
      },

      setTax: (percent) => {
        set((s) => ({ taxPercent: clamp(percent, 0, 100), ...touch(s) }));
      },

      setContingency: (percent) => {
        set((s) => ({
          contingencyPercent: clamp(percent, 0, 100),
          ...touch(s),
        }));
      },

      exportEstimate: () => {
        const s = get();
        const doc: MasterEstimateState = {
          version: s.version,
          items: s.items,
          company: s.company,
          client: s.client,
          markupPercent: s.markupPercent,
          contingencyPercent: s.contingencyPercent,
          taxPercent: s.taxPercent,
          updatedAt: s.updatedAt,
        };
        return serializeEstimate(doc);
      },

      importEstimate: (json) => {
        let data: unknown;
        try {
          data = deserializeEstimate<unknown>(json);
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : "Invalid JSON file.",
          };
        }
        const parsed = masterEstimateSchema.safeParse(data);
        if (!parsed.success) {
          const first = parsed.error.issues[0];
          const path = first.path.join(".") || "document";
          return {
            ok: false,
            error: `Import rejected — ${path}: ${first.message}`,
          };
        }
        const doc = parsed.data;
        set({ ...doc, updatedAt: new Date().toISOString() });
        return { ok: true };
      },
    }),
    {
      name: ESTIMATE_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => createSafeStorage()),
      // On version bump or corrupt payload, fall back to a fresh document
      // instead of crashing the whole app (error boundary fallback).
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          // eslint-disable-next-line no-console
          console.warn(
            "[buildcalc] Estimate rehydration failed; starting fresh.",
            error,
          );
          return;
        }
        // Merge defensively: older payloads may miss new fields.
        const fresh = createEmptyEstimate();
        Object.assign(state, {
          version: state.version ?? fresh.version,
          items: Array.isArray(state.items) ? state.items : [],
          company: { ...fresh.company, ...(state.company ?? {}) },
          client: { ...fresh.client, ...(state.client ?? {}) },
          markupPercent: Number.isFinite(state.markupPercent)
            ? state.markupPercent
            : fresh.markupPercent,
          contingencyPercent: Number.isFinite(state.contingencyPercent)
            ? state.contingencyPercent
            : fresh.contingencyPercent,
          taxPercent: Number.isFinite(state.taxPercent)
            ? state.taxPercent
            : fresh.taxPercent,
        });
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/*  Selectors                                                          */
/* ------------------------------------------------------------------ */

/** Pricing summary for the drawer / bid views. */
export function useBidSummary(): BidSummary {
  return useEstimateStore((s) =>
    computeBidSummary({
      items: s.items,
      markupPercent: s.markupPercent,
      contingencyPercent: s.contingencyPercent,
      taxPercent: s.taxPercent,
    }),
  );
}

/** Live count for the navbar "Master Bid Cart" badge. */
export function useEstimateCount(): number {
  return useEstimateStore((s) => s.items.length);
}

/** Items grouped by category (drawer + future export views). */
export function useItemsByCategory(): Map<Category, EstimateLineItem[]> {
  return useEstimateStore((s) => {
    const map = new Map<Category, EstimateLineItem[]>();
    for (const item of s.items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  });
}
