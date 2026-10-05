/**
 * BuildCalc Pro Tool page action bridge (ephemeral, not persisted).
 *
 * The /tools/[slug] layout renders the quick-action bar (Reset Inputs,
 * Save JSON Draft, Open Master Cart), but the actual input state lives
 * inside each calculator component. Tools register their callbacks here on
 * mount via `useToolActions()`; the bar enables/disables accordingly.
 */
"use client";

import { create } from "zustand";

export interface ToolActions {
  /** Reset all inputs to defaults. */
  resetInputs: () => void;
  /** Persist current inputs as a JSON draft (localStorage). */
  saveDraft: () => void;
  /** Human label for toasts, e.g. "Concrete Slab Calculator". */
  toolTitle: string;
}

interface ToolPageState {
  actions: ToolActions | null;
  registerActions: (actions: ToolActions) => void;
  clearActions: () => void;
}

export const useToolPageStore = create<ToolPageState>()((set) => ({
  actions: null,
  registerActions: (actions) => set({ actions }),
  clearActions: () => set({ actions: null }),
}));
