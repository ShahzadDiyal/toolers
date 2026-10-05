/**
 * BuildCalc Pro Stair stringer geometry + IRC R311.7 checks (Phase 4B).
 *
 * Pure functions, unit-testable. All dimensions in inches unless noted.
 * Inputs are sanitized: non-finite/negative values are treated as 0.
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Stock 2×12 stringer board lengths (ft). */
export const STRINGER_STOCK_FT = [10, 12, 14, 16] as const;

export const IRC_MAX_RISER_IN = 7.75;
export const IRC_MIN_TREAD_IN = 10;
export const COMFORT_MIN_IN = 24;
export const COMFORT_MAX_IN = 25;

export interface StairLayout {
  riserCount: number;
  unitRiseIn: number;
  treadCount: number;
  /** Target tread run (unit run), inches. */
  unitRunIn: number;
  totalRunIn: number;
  /** True stringer cut length, inches. */
  stringerLengthIn: number;
  /** Smallest stock board (ft) that covers the stringer. */
  stringerBoardFt: number;
  /** True when the stringer exceeds 16-ft stock. */
  overStockLength: boolean;
  stringerQty: number;
  checks: {
    riserOk: boolean;
    treadOk: boolean;
    comfortOk: boolean;
    comfortValue: number;
  };
}

export function stairLayout(
  totalRiseInRaw: unknown,
  treadRunInRaw: unknown,
  widthInRaw: unknown,
): StairLayout {
  const totalRiseIn = num(totalRiseInRaw);
  const unitRunIn = num(treadRunInRaw);
  const widthIn = num(widthInRaw);

  if (totalRiseIn <= 0 || unitRunIn <= 0) {
    return {
      riserCount: 0,
      unitRiseIn: 0,
      treadCount: 0,
      unitRunIn,
      totalRunIn: 0,
      stringerLengthIn: 0,
      stringerBoardFt: 10,
      overStockLength: false,
      stringerQty: 3,
      checks: {
        riserOk: true,
        treadOk: unitRunIn === 0 || unitRunIn >= IRC_MIN_TREAD_IN,
        comfortOk: false,
        comfortValue: 0,
      },
    };
  }

  // Target riser count ≈ rise ÷ 7.5″, then solve the exact unit rise.
  const riserCount = Math.max(1, Math.round(totalRiseIn / 7.5));
  const unitRiseIn = totalRiseIn / riserCount;
  // Treads = risers − 1 (the top tread is the landing/deck).
  const treadCount = Math.max(0, riserCount - 1);
  const totalRunIn = treadCount * unitRunIn;
  const stringerLengthIn = Math.hypot(totalRiseIn, totalRunIn);

  const stock =
    STRINGER_STOCK_FT.find((ft) => ft * 12 >= stringerLengthIn) ?? 16;
  const overStockLength = stringerLengthIn > 16 * 12;

  // 3 stringers at ≤ 36″ wide; 4 beyond that.
  const stringerQty = widthIn > 36 ? 4 : 3;

  const comfortValue = 2 * unitRiseIn + unitRunIn;

  return {
    riserCount,
    unitRiseIn: Math.round(unitRiseIn * 100) / 100,
    treadCount,
    unitRunIn,
    totalRunIn: Math.round(totalRunIn * 100) / 100,
    stringerLengthIn: Math.round(stringerLengthIn * 100) / 100,
    stringerBoardFt: stock,
    overStockLength,
    stringerQty,
    checks: {
      riserOk: unitRiseIn <= IRC_MAX_RISER_IN,
      treadOk: unitRunIn >= IRC_MIN_TREAD_IN,
      comfortOk:
        comfortValue >= COMFORT_MIN_IN && comfortValue <= COMFORT_MAX_IN,
      comfortValue: Math.round(comfortValue * 100) / 100,
    },
  };
}
