/**
 * BuildCalc Pro — Ephemeral UI state (not persisted).
 * Drawer / command-palette open state lives here so any component
 * (navbar badge, calculator card toast actions) can open them.
 */
"use client";

import { create } from "zustand";

interface UiState {
  estimateDrawerOpen: boolean;
  setEstimateDrawerOpen: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  estimateDrawerOpen: false,
  setEstimateDrawerOpen: (open) => set({ estimateDrawerOpen: open }),
  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}));
