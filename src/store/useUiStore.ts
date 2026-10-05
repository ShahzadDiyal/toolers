/**
 * BuildCalc Pro Ephemeral UI state (not persisted).
 * Drawer / command-menu open state lives here so any component
 * (navbar badge, calculator card toast actions, hero search) can open them.
 */
"use client";

import { create } from "zustand";

interface UiState {
  estimateDrawerOpen: boolean;
  setEstimateDrawerOpen: (open: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  estimateDrawerOpen: false,
  setEstimateDrawerOpen: (open) => set({ estimateDrawerOpen: open }),
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
}));
