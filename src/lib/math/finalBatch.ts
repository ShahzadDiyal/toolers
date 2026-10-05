/**
 * BuildCalc Pro — Final batch math (Batch 4H).
 *
 * Pure functions only: no React, no storage, no I/O.
 * Covers the last eight calculators: strip footings, sonotube piers,
 * stud-wall framing, board feet, recessed-light layout, business
 * break-even, change-order pricing, and right-triangle solving.
 */

import { roundTo } from "./units";

/* ------------------------------------------------------------------ */
/* 1. Strip footing concrete                                            */
/* ------------------------------------------------------------------ */

export interface FootingTakeoffInput {
  /** Length of one footing run, feet. */
  lengthFt: number;
  /** Footing width, inches. */
  widthIn: number;
  /** Footing depth, inches. */
  depthIn: number;
  /** Number of identical runs. */
  runs: number;
  /** Waste percent. */
  wastePercent: number;
}

export interface FootingTakeoff {
  cuFtPerRun: number;
  netYards: number;
  grossYards: number;
  wasteYards: number;
  truckloads: number;
  bags80: number;
  shortLoad: boolean;
}

export function footingTakeoff(i: FootingTakeoffInput): FootingTakeoff {
  const lengthFt = Math.max(0, i.lengthFt);
  const widthFt = Math.max(0, i.widthIn) / 12;
  const depthFt = Math.max(0, i.depthIn) / 12;
  const runs = Math.max(0, Math.floor(i.runs));
  const cuFtPerRun = roundTo(lengthFt * widthFt * depthFt, 4);
  const netYards = roundTo((cuFtPerRun * runs) / 27, 4);
  const grossYards = roundTo(netYards * (1 + Math.max(0, i.wastePercent) / 100), 4);
  const wasteYards = roundTo(grossYards - netYards, 4);
  return {
    cuFtPerRun,
    netYards,
    grossYards,
    wasteYards,
    truckloads: grossYards > 0 ? Math.ceil(grossYards / 10) : 0,
    bags80: Math.ceil(grossYards * 45),
    shortLoad: grossYards > 0 && grossYards < 4,
  };
}

/* ------------------------------------------------------------------ */
/* 2. Sonotube / pier concrete                                          */
/* ------------------------------------------------------------------ */

export interface PierTakeoffInput {
  /** Tube diameter, inches. */
  diameterIn: number;
  /** Pier depth, feet. */
  depthFt: number;
  /** Number of piers. */
  pierCount: number;
  /** Waste percent. */
  wastePercent: number;
}

export interface PierTakeoff {
  cuFtPerPier: number;
  netYards: number;
  grossYards: number;
  wasteYards: number;
  bags80: number;
  bagsPerPier: number;
}

export function pierTakeoff(i: PierTakeoffInput): PierTakeoff {
  const radiusFt = Math.max(0, i.diameterIn) / 12 / 2;
  const depthFt = Math.max(0, i.depthFt);
  const count = Math.max(0, Math.floor(i.pierCount));
  const cuFtPerPier = roundTo(Math.PI * radiusFt * radiusFt * depthFt, 4);
  const netYards = roundTo((cuFtPerPier * count) / 27, 4);
  const grossYards = roundTo(netYards * (1 + Math.max(0, i.wastePercent) / 100), 4);
  const wasteYards = roundTo(grossYards - netYards, 4);
  const bags80 = Math.ceil(grossYards * 45);
  return {
    cuFtPerPier,
    netYards,
    grossYards,
    wasteYards,
    bags80,
    bagsPerPier: count > 0 ? roundTo(bags80 / count, 1) : 0,
  };
}

/* ------------------------------------------------------------------ */
/* 3. Stud wall framing                                                 */
/* ------------------------------------------------------------------ */

export interface StudWallTakeoffInput {
  /** Wall length, feet. */
  wallLengthFt: number;
  /** Stud spacing on center, inches (16 or 24). */
  spacingIn: number;
  /** Door/window openings. */
  openings: number;
}

export interface StudWallTakeoff {
  studs: number;
  /** Total plate lineal feet (bottom + double top). */
  plateLF: number;
  headers: number;
  kingStuds: number;
  cripples: number;
  /** Extra studs for corners / intersections allowance. */
  cornerStuds: number;
  totalStuds: number;
}

export function studWallTakeoff(i: StudWallTakeoffInput): StudWallTakeoff {
  const lengthIn = Math.max(0, i.wallLengthFt) * 12;
  const spacingIn = Math.max(1, i.spacingIn);
  const openings = Math.max(0, Math.floor(i.openings));
  // Field studs: one per spacing bay plus the starter.
  const studs = lengthIn > 0 ? Math.ceil(lengthIn / spacingIn) + 1 : 0;
  // Bottom plate + double top plate = 3 runs of wall length.
  const plateLF = roundTo(Math.max(0, i.wallLengthFt) * 3, 1);
  // Each opening: 1 header, 2 king studs, 2 cripples (sill + header cripple).
  const headers = openings;
  const kingStuds = openings * 2;
  const cripples = openings * 2;
  // Corners / T-intersections: 2 extra studs per wall as a rule of thumb.
  const cornerStuds = lengthIn > 0 ? 2 : 0;
  return {
    studs,
    plateLF,
    headers,
    kingStuds,
    cripples,
    cornerStuds,
    totalStuds: studs + kingStuds + cripples + cornerStuds,
  };
}

/* ------------------------------------------------------------------ */
/* 4. Board feet                                                        */
/* ------------------------------------------------------------------ */

export interface BoardFeetInput {
  /** Nominal thickness, inches. */
  thicknessIn: number;
  /** Nominal width, inches. */
  widthIn: number;
  /** Length, feet. */
  lengthFt: number;
  /** Piece count. */
  pieces: number;
}

export interface BoardFeetTakeoff {
  bfPerPiece: number;
  totalBF: number;
}

export function boardFeetTakeoff(i: BoardFeetInput): BoardFeetTakeoff {
  const t = Math.max(0, i.thicknessIn);
  const w = Math.max(0, i.widthIn);
  const l = Math.max(0, i.lengthFt);
  const pieces = Math.max(0, Math.floor(i.pieces));
  const bfPerPiece = roundTo((t * w * l) / 12, 2);
  return { bfPerPiece, totalBF: roundTo(bfPerPiece * pieces, 2) };
}

/* ------------------------------------------------------------------ */
/* 5. Recessed light layout                                             */
/* ------------------------------------------------------------------ */

export interface RecessedLightInput {
  /** Room length, feet. */
  roomLengthFt: number;
  /** Room width, feet. */
  roomWidthFt: number;
  /** Target on-center spacing, feet. */
  spacingFt: number;
}

export interface RecessedLightLayout {
  cols: number;
  rows: number;
  fixtures: number;
  /** Actual column spacing after even division, feet. */
  actualSpacingL: number;
  /** Actual row spacing after even division, feet. */
  actualSpacingW: number;
  /** Suggested distance from walls (half the actual spacing), feet. */
  edgeOffsetFt: number;
}

export function recessedLightLayout(i: RecessedLightInput): RecessedLightLayout {
  const L = Math.max(0, i.roomLengthFt);
  const W = Math.max(0, i.roomWidthFt);
  const target = Math.max(0.5, i.spacingFt);
  // Even grid: round to the nearest whole count, minimum 1 per direction.
  const cols = L > 0 ? Math.max(1, Math.round(L / target)) : 0;
  const rows = W > 0 ? Math.max(1, Math.round(W / target)) : 0;
  const actualSpacingL = cols > 0 ? roundTo(L / cols, 2) : 0;
  const actualSpacingW = rows > 0 ? roundTo(W / rows, 2) : 0;
  const edgeOffsetFt = roundTo(Math.min(actualSpacingL, actualSpacingW) / 2, 2);
  return { cols, rows, fixtures: cols * rows, actualSpacingL, actualSpacingW, edgeOffsetFt };
}

/* ------------------------------------------------------------------ */
/* 6. Business break-even (revenue)                                     */
/* ------------------------------------------------------------------ */

export interface BusinessBreakevenInput {
  /** Total fixed costs per month, $. */
  monthlyFixedCosts: number;
  /** Gross margin percent (0-100, exclusive of 0). */
  grossMarginPct: number;
  /** Average job value, $. */
  avgJobValue: number;
}

export interface BusinessBreakeven {
  /** Monthly revenue needed to break even. */
  monthlyBreakeven: number;
  annualBreakeven: number;
  /** Jobs per month needed at the average job value. */
  jobsPerMonth: number;
  jobsPerYear: number;
  valid: boolean;
}

export function businessBreakeven(i: BusinessBreakevenInput): BusinessBreakeven {
  const fixed = Math.max(0, i.monthlyFixedCosts);
  const margin = Math.max(0, Math.min(99.99, i.grossMarginPct)) / 100;
  const avgJob = Math.max(0, i.avgJobValue);
  const valid = margin > 0 && fixed > 0;
  const monthlyBreakeven = valid ? roundTo(fixed / margin, 2) : 0;
  const jobsPerMonth = valid && avgJob > 0 ? roundTo(monthlyBreakeven / avgJob, 1) : 0;
  return {
    monthlyBreakeven,
    annualBreakeven: roundTo(monthlyBreakeven * 12, 2),
    jobsPerMonth,
    jobsPerYear: roundTo(jobsPerMonth * 12, 1),
    valid,
  };
}

/* ------------------------------------------------------------------ */
/* 7. Change order pricing                                              */
/* ------------------------------------------------------------------ */

export interface ChangeOrderInput {
  /** Direct cost of the extra work, $. */
  directCost: number;
  /** Markup percent applied to cost. */
  markupPct: number;
}

export interface ChangeOrderPrice {
  price: number;
  profit: number;
  /** Achieved margin percent on the price. */
  marginPct: number;
  valid: boolean;
}

export function changeOrderPrice(i: ChangeOrderInput): ChangeOrderPrice {
  const cost = Math.max(0, i.directCost);
  const markup = Math.max(0, i.markupPct) / 100;
  const valid = cost > 0;
  const price = valid ? roundTo(cost * (1 + markup), 2) : 0;
  const profit = roundTo(price - cost, 2);
  const marginPct = price > 0 ? roundTo((profit / price) * 100, 1) : 0;
  return { price, profit, marginPct, valid };
}

/* ------------------------------------------------------------------ */
/* 8. Right triangle solver                                             */
/* ------------------------------------------------------------------ */

export type TriangleMode = "two-legs" | "leg-hyp";

export interface RightTriangleInput {
  mode: TriangleMode;
  /** Leg a (rise), any unit — output matches input unit. */
  a: number;
  /** Leg b (run) for two-legs mode, or hypotenuse c for leg-hyp mode. */
  b: number;
}

export interface RightTriangleSolution {
  a: number;
  b: number;
  c: number;
  /** Angle opposite side a, degrees. */
  angleA: number;
  /** Angle opposite side b, degrees. */
  angleB: number;
  /** True when sides are within 1% of a 3-4-5 ratio (square check). */
  is345: boolean;
  valid: boolean;
  error?: string;
}

export function solveRightTriangle(i: RightTriangleInput): RightTriangleSolution {
  const a = Math.max(0, i.a);
  if (i.mode === "two-legs") {
    const b = Math.max(0, i.b);
    if (a <= 0 || b <= 0) {
      return { a, b, c: 0, angleA: 0, angleB: 0, is345: false, valid: false };
    }
    const c = Math.sqrt(a * a + b * b);
    return finishTriangle(a, b, c);
  }
  // leg + hypotenuse
  const c = Math.max(0, i.b);
  if (a <= 0 || c <= 0) {
    return { a, b: 0, c, angleA: 0, angleB: 0, is345: false, valid: false };
  }
  if (c <= a) {
    return {
      a, b: 0, c, angleA: 0, angleB: 0, is345: false, valid: false,
      error: "Hypotenuse must be longer than the leg.",
    };
  }
  const b = Math.sqrt(c * c - a * a);
  return finishTriangle(a, b, c);
}

function finishTriangle(a: number, b: number, c: number): RightTriangleSolution {
  const angleA = (Math.atan2(a, b) * 180) / Math.PI;
  const angleB = 90 - angleA;
  // 3-4-5 check: scale so the shortest side = 3, then compare to 3:4:5.
  const sides = [a, b, c].sort((x, y) => x - y);
  const s = sides[0];
  const norm = sides.map((x) => (x / s) * 3);
  const is345 =
    s > 0 &&
    Math.abs(norm[0] - 3) / 3 < 0.01 &&
    Math.abs(norm[1] - 4) / 4 < 0.01 &&
    Math.abs(norm[2] - 5) / 5 < 0.01;
  return {
    a: roundTo(a, 3),
    b: roundTo(b, 3),
    c: roundTo(c, 3),
    angleA: roundTo(angleA, 2),
    angleB: roundTo(angleB, 2),
    is345,
    valid: true,
  };
}
