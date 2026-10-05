/**
 * BuildCalc Pro — Wall framing & drywall math (Phase 4B).
 *
 * Pure functions, unit-testable. All lengths in feet, areas in sq ft.
 * Inputs are sanitized: non-finite/negative values are treated as 0.
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

export interface FramingTakeoff {
  baseStuds: number;
  extraStuds: number;
  totalStuds: number;
  /** 16-ft plate boards (rounded up). */
  plateBoards: number;
  /** Plate runs: 3 = double top + bottom, 2 = single top + bottom. */
  plateRuns: number;
  netDrywallSqft: number;
  grossDrywallSqft: number;
  sheets: number;
  mudBuckets: number;
  tapeRolls: number;
}

export interface FramingInputs {
  lengthFt: number;
  heightFt: number;
  spacingIn: number;
  corners: number;
  doors: number;
  windows: number;
  doubleTopPlate: boolean;
  /** 32 (4×8) or 48 (4×12). */
  sheetSqft: number;
  sides: 1 | 2;
  /** Default 10. */
  drywallWastePct?: number;
}

export const DOOR_DEDUCT_SQFT = 21; // 3×7 door
export const WINDOW_DEDUCT_SQFT = 15; // 3×5 window
const PLATE_BOARD_FT = 16;
const DRYWALL_COVERAGE_SQFT = 500; // per mud bucket / tape roll

export function framingTakeoff(raw: FramingInputs): FramingTakeoff {
  const lengthFt = num(raw.lengthFt);
  const heightFt = num(raw.heightFt);
  const spacingIn = num(raw.spacingIn) || 16;
  const corners = Math.floor(num(raw.corners));
  const doors = Math.floor(num(raw.doors));
  const windows = Math.floor(num(raw.windows));
  const sheetSqft = num(raw.sheetSqft) || 32;
  const sides: 1 | 2 = raw.sides === 2 ? 2 : 1;
  const wastePct = num(raw.drywallWastePct ?? 10);

  // Studs = ceil((length × 12) ÷ spacing) + 1, plus kings/jacks.
  const baseStuds =
    lengthFt > 0 ? Math.ceil((lengthFt * 12) / spacingIn) + 1 : 0;
  const extraStuds = 2 * corners + 2 * doors;
  const totalStuds = baseStuds + extraStuds;

  // Plates: 3 runs (double top + bottom) or 2 runs, in 16-ft boards.
  const plateRuns = raw.doubleTopPlate ? 3 : 2;
  const plateBoards =
    lengthFt > 0 ? Math.ceil((lengthFt * plateRuns) / PLATE_BOARD_FT) : 0;

  // Drywall: gross wall area minus openings, plus cutting waste.
  const netDrywallSqft = Math.max(
    0,
    lengthFt * heightFt * sides -
      doors * DOOR_DEDUCT_SQFT -
      windows * WINDOW_DEDUCT_SQFT,
  );
  const grossDrywallSqft = netDrywallSqft * (1 + wastePct / 100);
  const sheets =
    grossDrywallSqft > 0 ? Math.ceil(grossDrywallSqft / sheetSqft) : 0;
  const mudBuckets =
    grossDrywallSqft > 0
      ? Math.ceil(grossDrywallSqft / DRYWALL_COVERAGE_SQFT)
      : 0;
  const tapeRolls =
    grossDrywallSqft > 0
      ? Math.ceil(grossDrywallSqft / DRYWALL_COVERAGE_SQFT)
      : 0;

  return {
    baseStuds,
    extraStuds,
    totalStuds,
    plateBoards,
    plateRuns,
    netDrywallSqft: Math.round(netDrywallSqft * 100) / 100,
    grossDrywallSqft: Math.round(grossDrywallSqft * 100) / 100,
    sheets,
    mudBuckets,
    tapeRolls,
  };
}
