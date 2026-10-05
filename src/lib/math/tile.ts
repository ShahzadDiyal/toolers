/**
 * BuildCalc Pro — Tile, thinset & grout math (Phase 4B).
 *
 * Pure functions, unit-testable. Inputs sanitized (non-finite → 0).
 * Grout weight uses the standard dry-grout density formula:
 *   lbs = area(sqft) × (L+W)/(L×W) × joint(in) × thickness(in) × 7.9
 * (7.9 lb per ft²·in ≈ 95 lb/ft³ bulk density; the quoted 1.4 is kg/L metric.)
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

export const THINSET_COVERAGE_SQFT = 50; // per 50-lb bag, ¼×⅜″ notch
export const THINSET_BAG_LB = 50;
export const GROUT_BAG_LB = 25;
export const SPACER_COVERAGE_SQFT = 200; // heuristic: 1 bag per 200 sq ft

/**
 * Dry sanded-grout bulk density for (sq ft × inches) units.
 *
 * The joint-volume structure Area × (L+W)/(L×W) × joint × thickness is the
 * industry-standard (Mapei) formula — but its published K = 1.4–1.6 is
 * **kg per litre, metric units only**. For area in sq ft and dimensions in
 * inches, K must be the bulk density in lb per (ft²·in) of joint volume:
 * ≈ 95 lb/ft³ ÷ 12 in/ft ≈ 7.9. Using 1.4 here underestimates grout ~5.6×.
 */
export const GROUT_DENSITY_LB_PER_FT2_IN = 7.9;

export type GroutType = "Sanded" | "Unsanded";

/** Sanded for joints ≥ 1/8″, unsanded below. */
export function groutTypeForJoint(jointIn: number): GroutType {
  return jointIn >= 1 / 8 ? "Sanded" : "Unsanded";
}

export interface TileTakeoff {
  netSqft: number;
  grossSqft: number;
  boxes: number;
  thinsetBags: number;
  groutWeightLb: number;
  groutBags: number;
  spacerBags: number;
  groutType: GroutType;
}

export interface TileInputs {
  netSqft: number;
  wastePct: number;
  sqftPerBox: number;
  tileLengthIn: number;
  tileWidthIn: number;
  jointIn: number;
  thicknessIn: number;
}

export function tileTakeoff(raw: TileInputs): TileTakeoff {
  const netSqft = num(raw.netSqft);
  const wastePct = num(raw.wastePct);
  const sqftPerBox = num(raw.sqftPerBox) || 1;
  const tileL = num(raw.tileLengthIn);
  const tileW = num(raw.tileWidthIn);
  const jointIn = num(raw.jointIn);
  const thicknessIn = num(raw.thicknessIn);

  const grossSqft = netSqft * (1 + wastePct / 100);
  const boxes = grossSqft > 0 ? Math.ceil(grossSqft / sqftPerBox) : 0;
  const thinsetBags =
    grossSqft > 0 ? Math.ceil(grossSqft / THINSET_COVERAGE_SQFT) : 0;

  // Standard dry grout density formula (see GROUT_DENSITY_LB_PER_FT2_IN).
  const tileArea = tileL * tileW;
  const groutWeightLb =
    grossSqft > 0 && tileArea > 0
      ? grossSqft *
        ((tileL + tileW) / tileArea) *
        jointIn *
        thicknessIn *
        GROUT_DENSITY_LB_PER_FT2_IN
      : 0;
  const groutBags =
    groutWeightLb > 0 ? Math.ceil(groutWeightLb / GROUT_BAG_LB) : 0;
  const spacerBags =
    grossSqft > 0 ? Math.ceil(grossSqft / SPACER_COVERAGE_SQFT) : 0;

  return {
    netSqft: Math.round(netSqft * 100) / 100,
    grossSqft: Math.round(grossSqft * 100) / 100,
    boxes,
    thinsetBags,
    groutWeightLb: Math.round(groutWeightLb * 10) / 10,
    groutBags,
    spacerBags,
    groutType: groutTypeForJoint(jointIn),
  };
}
