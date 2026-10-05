/**
 * BuildCalc Pro Rebar & wire-mesh math (Phase 4B).
 *
 * Pure functions, unit-testable. Inputs sanitized (non-finite → 0).
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Standard bar weights, lb per linear foot. */
export const REBAR_WEIGHT_LB_PER_FT: Record<string, number> = {
  "#3": 0.376,
  "#4": 0.668,
  "#5": 1.043,
};

export const REBAR_STICK_FT = 20;
export const MESH_ROLL_SQFT = 750; // 5 × 150 ft
export const TIES_PER_BAG = 1000;

export interface RebarTakeoff {
  /** Runs spanning the length direction. */
  runsLength: number;
  /** Runs spanning the width direction. */
  runsWidth: number;
  linearFeet: number;
  linearFeetWithLap: number;
  sticks20: number;
  /** One tie per grid intersection. */
  ties: number;
  tieBags: number;
  weightLb: number;
  weightTons: number;
}

export interface RebarInputs {
  lengthFt: number;
  widthFt: number;
  spacingIn: number;
  /** Edge clear cover, inches. */
  clearIn: number;
  /** Lap-splice allowance, %. */
  lapPct: number;
  barSize: "#3" | "#4" | "#5";
}

export function rebarTakeoff(raw: RebarInputs): RebarTakeoff {
  const lengthFt = num(raw.lengthFt);
  const widthFt = num(raw.widthFt);
  const spacingIn = num(raw.spacingIn) || 12;
  const clearIn = num(raw.clearIn);
  const lapPct = num(raw.lapPct);
  const lbPerFt = REBAR_WEIGHT_LB_PER_FT[raw.barSize] ?? REBAR_WEIGHT_LB_PER_FT["#4"];

  const lengthIn = lengthFt * 12;
  const widthIn = widthFt * 12;

  // Runs = floor((span − 2 × cover) ÷ spacing) + 1 per direction.
  const runsLength =
    widthIn > 0
      ? Math.max(0, Math.floor((widthIn - 2 * clearIn) / spacingIn) + 1)
      : 0;
  const runsWidth =
    lengthIn > 0
      ? Math.max(0, Math.floor((lengthIn - 2 * clearIn) / spacingIn) + 1)
      : 0;

  const linearFeet = runsLength * lengthFt + runsWidth * widthFt;
  const linearFeetWithLap = linearFeet * (1 + lapPct / 100);
  const sticks20 =
    linearFeetWithLap > 0 ? Math.ceil(linearFeetWithLap / REBAR_STICK_FT) : 0;
  const ties = runsLength * runsWidth;
  const tieBags = ties > 0 ? Math.ceil(ties / TIES_PER_BAG) : 0;
  const weightLb = linearFeetWithLap * lbPerFt;

  return {
    runsLength,
    runsWidth,
    linearFeet: Math.round(linearFeet * 100) / 100,
    linearFeetWithLap: Math.round(linearFeetWithLap * 100) / 100,
    sticks20,
    ties,
    tieBags,
    weightLb: Math.round(weightLb * 10) / 10,
    weightTons: Math.round((weightLb / 2000) * 1000) / 1000,
  };
}

export interface MeshTakeoff {
  netSqft: number;
  grossSqft: number;
  rolls: number;
}

export function meshTakeoff(
  lengthFtRaw: unknown,
  widthFtRaw: unknown,
  overlapPctRaw: unknown = 10,
): MeshTakeoff {
  const lengthFt = num(lengthFtRaw);
  const widthFt = num(widthFtRaw);
  const overlapPct = num(overlapPctRaw);
  const netSqft = lengthFt * widthFt;
  const grossSqft = netSqft * (1 + overlapPct / 100);
  return {
    netSqft: Math.round(netSqft * 100) / 100,
    grossSqft: Math.round(grossSqft * 100) / 100,
    rolls: grossSqft > 0 ? Math.ceil(grossSqft / MESH_ROLL_SQFT) : 0,
  };
}
