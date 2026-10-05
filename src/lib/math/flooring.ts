/**
 * BuildCalc Pro — Flooring & trim math (Phase 4C).
 * Pure functions, unit-testable. Inputs sanitized (non-finite → 0).
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

export const UNDERLAYMENT_ROLL_SQFT = 100;
export const BASEBOARD_STICK_FT = 16;
export const TRIM_WASTE_PCT = 10;

export interface FlooringTakeoff {
  netSqft: number;
  grossSqft: number;
  boxes: number;
  underlaymentRolls: number;
  /** 0 when L×W are unknown (sq-ft-only mode). */
  perimeterFt: number;
  trimSticks: number;
}

export interface FlooringInputs {
  netSqft: number;
  wastePct: number;
  sqftPerBox: number;
  lengthFt?: number;
  widthFt?: number;
}

export function flooringTakeoff(raw: FlooringInputs): FlooringTakeoff {
  const netSqft = num(raw.netSqft);
  const wastePct = num(raw.wastePct);
  const sqftPerBox = num(raw.sqftPerBox) || 1;
  const L = num(raw.lengthFt);
  const W = num(raw.widthFt);

  const grossSqft = netSqft * (1 + wastePct / 100);
  const boxes = grossSqft > 0 ? Math.ceil(grossSqft / sqftPerBox) : 0;
  const underlaymentRolls =
    netSqft > 0 ? Math.ceil(netSqft / UNDERLAYMENT_ROLL_SQFT) : 0;
  const perimeterFt = L > 0 && W > 0 ? 2 * (L + W) : 0;
  const trimSticks =
    perimeterFt > 0
      ? Math.ceil((perimeterFt * (1 + TRIM_WASTE_PCT / 100)) / BASEBOARD_STICK_FT)
      : 0;

  return {
    netSqft: Math.round(netSqft * 100) / 100,
    grossSqft: Math.round(grossSqft * 100) / 100,
    boxes,
    underlaymentRolls,
    perimeterFt: Math.round(perimeterFt * 100) / 100,
    trimSticks,
  };
}
