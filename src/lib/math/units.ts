/**
 * BuildCalc Pro — Precision math & architectural unit conversions.
 *
 * Construction math is unforgiving: 0.1 + 0.2 ≠ 0.3, and 12' 3-3/8" must parse
 * back to exactly 12.28125 ft. Everything here uses integer-backed rounding
 * and exact fraction tables so calculators never drift.
 */

/* ------------------------------------------------------------------ */
/*  Precision arithmetic (decimal-safe multiply/divide/round)          */
/* ------------------------------------------------------------------ */

/** Count decimals in a JS number (handles exponent notation). */
function decimalPlaces(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = n.toString().toLowerCase();
  if (s.includes("e")) {
    const [mantissa, exp] = s.split("e");
    const e = Number(exp);
    const frac = (mantissa.split(".")[1] ?? "").length;
    return Math.max(0, frac - e);
  }
  return (s.split(".")[1] ?? "").length;
}

/** Exact multiply: converts to integers first, then scales back. */
export function mulPrecise(a: number, b: number): number {
  const d = decimalPlaces(a) + decimalPlaces(b);
  const ai = Math.round(a * 10 ** decimalPlaces(a));
  const bi = Math.round(b * 10 ** decimalPlaces(b));
  return ai * bi * 10 ** -d;
}

/** Round to `decimals` places using half-up (epsilon-corrected). */
export function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  // Epsilon nudge kills representation errors like 1.005 -> 1.00.
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Add with exactness (avoids 0.1 + 0.2 = 0.30000000000000004). */
export function addPrecise(...values: number[]): number {
  return roundTo(
    values.reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0),
    10,
  );
}

/* ------------------------------------------------------------------ */
/*  Feet / inches / fractions                                          */
/* ------------------------------------------------------------------ */

/** Standard architectural fraction denominators (1/16" is the job-site norm). */
export const FRACTION_STEPS = [2, 4, 8, 16, 32] as const;
export type FractionStep = (typeof FRACTION_STEPS)[number];

/**
 * Format a decimal FEET value as an architectural string.
 * @example 12.28125 -> `12' 3-3/8"`
 * @example 0.5       -> `6"`
 * @example 8         -> `8'`
 */
export function decimalFeetToArchitectural(
  feet: number,
  step: FractionStep = 16,
): string {
  if (!Number.isFinite(feet)) return `0'`;
  const sign = feet < 0 ? "-" : "";
  const abs = Math.abs(feet);

  let wholeFeet = Math.floor(abs);
  const inches = roundTo((abs - wholeFeet) * 12, 6);

  // Snap total inches to the nearest 1/step, then split whole + fraction.
  const snapped = roundTo(Math.round(inches * step) / step, 6);
  let wholeInches = Math.floor(snapped + 1e-9);
  let fracNum = Math.round(roundTo(snapped - wholeInches, 6) * step);

  // Carry overflow: 11-16/16" -> 12"
  if (fracNum >= step) {
    wholeInches += 1;
    fracNum = 0;
  }
  if (wholeInches >= 12) {
    wholeFeet += 1;
    wholeInches -= 12;
  }

  // Reduce the fraction (e.g. 8/16 -> 1/2).
  let fracStr = "";
  if (fracNum > 0) {
    const g = gcd(fracNum, step);
    fracStr = `${fracNum / g}/${step / g}`;
  }

  const parts: string[] = [];
  if (wholeFeet > 0 || (wholeInches === 0 && fracStr === "")) {
    parts.push(`${wholeFeet}'`);
  }
  if (wholeInches > 0 || fracStr !== "") {
    const inchBody =
      wholeInches > 0 && fracStr !== ""
        ? `${wholeInches}-${fracStr}`
        : fracStr !== ""
          ? fracStr
          : `${wholeInches}`;
    parts.push(`${inchBody}"`);
  }
  return sign + parts.join(" ");
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export interface ParsedLength {
  /** Total in decimal feet. */
  feet: number;
  /** Total in decimal inches. */
  inches: number;
}

/**
 * Parse architectural / colloquial length strings into decimal feet.
 * Accepts: `12' 3-3/8"`, `12'3-3/8"`, `12' 3 3/8"`, `147 3/8"`, `147.375"`,
 * `3/8"`, `12.28125`, `12'`, `12ft`, `3-3/8`, mixed with spaces/dashes.
 */
export function parseArchitecturalLength(raw: string): ParsedLength | null {
  const input = raw.trim().toLowerCase();
  if (!input) return null;

  // Plain decimal number -> treat as feet
  if (/^-?\d+(\.\d+)?$/.test(input)) {
    const feet = Number(input);
    return Number.isFinite(feet) ? { feet, inches: feet * 12 } : null;
  }

  // Split off the feet component if a ' or ft/feet marker exists.
  // NOTE: no \b after the apostrophe — there is no word boundary between
  // `'` and a following space, so `\b` would reject the common `12' 6"` form.
  const feetMatch = input.match(/^(-?\d+(?:\.\d+)?)\s*(?:'|ft\b|feet\b)/);
  let feet = 0;
  let rest = input;
  if (feetMatch) {
    feet = Number(feetMatch[1]);
    rest = input.slice(feetMatch[0].length).trim();
  }

  // Remaining text is inches: possibly `3-3/8"`, `3 3/8"`, `3.375"`, `3"`
  const cleaned = rest.replace(/["”]|in\b|inch(es)?\b/g, "").trim();
  let inches = 0;
  if (cleaned) {
    // fraction forms: `3-3/8`, `3 3/8`, `3/8`
    const fracMatch = cleaned.match(/^(-?\d+)?[-\s]?(\d+)\s*\/\s*(\d+)$/);
    if (fracMatch) {
      const whole = fracMatch[1] ? Number(fracMatch[1]) : 0;
      const num = Number(fracMatch[2]);
      const den = Number(fracMatch[3]);
      if (den === 0) return null;
      inches = whole + num / den;
    } else {
      const n = Number(cleaned);
      if (!Number.isFinite(n)) return null;
      inches = n;
    }
  }

  const totalFeet = feet + inches / 12;
  if (!Number.isFinite(totalFeet)) return null;
  return { feet: roundTo(totalFeet, 6), inches: roundTo(totalFeet * 12, 4) };
}

/* ------------------------------------------------------------------ */
/*  Area conversions                                                   */
/* ------------------------------------------------------------------ */

export const SQFT_PER_SQYD = 9;
export const SQFT_PER_ROOFING_SQUARE = 100;

/** Convert square feet to square yards. */
export function sqftToSqyd(sqft: number): number {
  return roundTo(sqft / SQFT_PER_SQYD, 4);
}

/** Convert square yards to square feet. */
export function sqydToSqft(sqyd: number): number {
  return roundTo(sqyd * SQFT_PER_SQYD, 4);
}

/** Convert square feet to roofing squares (1 square = 100 sq ft). */
export function sqftToRoofingSquares(sqft: number): number {
  return roundTo(sqft / SQFT_PER_ROOFING_SQUARE, 4);
}

/** Convert roofing squares to square feet. */
export function roofingSquaresToSqft(squares: number): number {
  return roundTo(squares * SQFT_PER_ROOFING_SQUARE, 4);
}

/* ------------------------------------------------------------------ */
/*  Volume conversions                                                 */
/* ------------------------------------------------------------------ */

export const CUFT_PER_CUYD = 27;

/** Convert cubic feet to cubic yards. */
export function cuftToCuyd(cuft: number): number {
  return roundTo(cuft / CUFT_PER_CUYD, 4);
}

/** Convert cubic yards to cubic feet. */
export function cuydToCuft(cuyd: number): number {
  return roundTo(cuyd * CUFT_PER_CUYD, 4);
}

/* ------------------------------------------------------------------ */
/*  Waste buffer                                                       */
/* ------------------------------------------------------------------ */

/**
 * Standard contractor waste buffer.
 * @param quantity Net quantity.
 * @param wastePercent 0–100 (typical 10–15).
 * @returns `{ net, wasteAmount, gross }` — all rounded to 4 decimals.
 */
export function calculateWithWaste(
  quantity: number,
  wastePercent: number,
): { net: number; wasteAmount: number; gross: number } {
  const net = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  const pct =
    Number.isFinite(wastePercent) ? Math.min(100, Math.max(0, wastePercent)) : 0;
  const wasteAmount = roundTo(mulPrecise(net, pct / 100), 4);
  const gross = roundTo(net + wasteAmount, 4);
  return { net: roundTo(net, 4), wasteAmount, gross };
}

/* ------------------------------------------------------------------ */
/*  Roof pitch helpers (used by framing-roofing tools)                 */
/* ------------------------------------------------------------------ */

export interface PitchInfo {
  /** Rise over 12" run, e.g. 6 for 6/12. */
  rise: number;
  /** Rafter length factor: hypotenuse of rise/12 per foot of run. */
  rafterFactor: number;
  /** Slope angle in degrees. */
  angleDeg: number;
  /** Multiplier for roof area vs. plan area. */
  areaMultiplier: number;
}

/** Convert a rise-over-12 pitch to rafter factors + angle. */
export function pitchToFactors(rise: number): PitchInfo {
  const r = Number.isFinite(rise) ? Math.max(0, rise) : 0;
  const hyp = Math.sqrt(r * r + 144);
  const rafterFactor = roundTo(hyp / 12, 4);
  const angleDeg = roundTo((Math.atan(r / 12) * 180) / Math.PI, 2);
  return { rise: r, rafterFactor, angleDeg, areaMultiplier: rafterFactor };
}

/* ------------------------------------------------------------------ */
/*  Misc helpers                                                       */
/* ------------------------------------------------------------------ */

/** Board feet: (thickness_in × width_in × length_ft) / 12. */
export function boardFeet(
  thicknessIn: number,
  widthIn: number,
  lengthFt: number,
): number {
  return roundTo(mulPrecise(mulPrecise(thicknessIn, widthIn), lengthFt) / 12, 2);
}

/** Concrete 80lb bags per cubic yard (standard yield ≈ 0.6 cu ft/bag → 45 bags). */
export const BAGS_80LB_PER_CUYD = 45;
/** Concrete 60lb bags per cubic yard (≈ 60 bags). */
export const BAGS_60LB_PER_CUYD = 60;

/** Round UP to the nearest whole unit (you can't buy 0.7 of a bag). */
export function roundUp(value: number): number {
  return Math.ceil(value - 1e-9);
}
