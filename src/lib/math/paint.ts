/**
 * BuildCalc Pro Paint, primer & ceiling math (Phase 4C).
 * Pure functions, unit-testable. Inputs sanitized (non-finite → 0).
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

export const DOOR_DEDUCT_SQFT = 21;
export const WINDOW_DEDUCT_SQFT = 15;
export const PRIMER_SPREAD_SQFT = 350;

export interface PaintTakeoff {
  wallGrossSqft: number;
  deductionsSqft: number;
  netWallSqft: number;
  ceilingSqft: number;
  /** Net paintable surface (walls + ceiling if included). */
  netPaintableSqft: number;
  wallGallons: number;
  /** 5-gallon pails for the wall paint. */
  wallPails: number;
  ceilingGallons: number;
  primerGallons: number;
}

export interface PaintInputs {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  doors: number;
  windows: number;
  includeCeiling: boolean;
  includePrimer: boolean;
  coats: 1 | 2;
  spreadRate: number;
}

export function paintTakeoff(raw: PaintInputs): PaintTakeoff {
  const L = num(raw.lengthFt);
  const W = num(raw.widthFt);
  const H = num(raw.heightFt);
  const doors = Math.floor(num(raw.doors));
  const windows = Math.floor(num(raw.windows));
  const coats: 1 | 2 = raw.coats === 2 ? 2 : 1;
  const spread = num(raw.spreadRate) || 350;

  const wallGrossSqft = 2 * (L + W) * H;
  const deductionsSqft = doors * DOOR_DEDUCT_SQFT + windows * WINDOW_DEDUCT_SQFT;
  const netWallSqft = Math.max(0, wallGrossSqft - deductionsSqft);
  const ceilingSqft = raw.includeCeiling ? L * W : 0;
  const netPaintableSqft = netWallSqft + ceilingSqft;

  const wallGallons =
    netWallSqft > 0 ? Math.ceil((netWallSqft * coats) / spread) : 0;
  const ceilingGallons =
    ceilingSqft > 0 ? Math.ceil((ceilingSqft * coats) / spread) : 0;
  const primerGallons =
    raw.includePrimer && netPaintableSqft > 0
      ? Math.ceil(netPaintableSqft / PRIMER_SPREAD_SQFT)
      : 0;

  return {
    wallGrossSqft: Math.round(wallGrossSqft * 10) / 10,
    deductionsSqft: Math.round(deductionsSqft * 10) / 10,
    netWallSqft: Math.round(netWallSqft * 10) / 10,
    ceilingSqft: Math.round(ceilingSqft * 10) / 10,
    netPaintableSqft: Math.round(netPaintableSqft * 10) / 10,
    wallGallons,
    wallPails: wallGallons > 0 ? Math.ceil(wallGallons / 5) : 0,
    ceilingGallons,
    primerGallons,
  };
}
