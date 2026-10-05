/**
 * BuildCalc Pro Contractor bid math: margin vs markup (Phase 4C).
 *
 * The #1 pricing mistake in contracting is treating markup as margin.
 * Pure functions, unit-testable. Inputs sanitized (non-finite → 0).
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface BidMath {
  directCost: number;
  bidPrice: number;
  /** The markup % that produces this price. */
  equivalentMarkup: number;
  /** The margin % that produces this price. */
  equivalentMargin: number;
  grossProfit: number;
  overheadRecovery: number;
  netProfit: number;
}

export interface BidInputs {
  materials: number;
  labor: number;
  subs: number;
  equipment: number;
  overheadPct: number;
}

function base(inputs: BidInputs) {
  const directCost =
    num(inputs.materials) +
    num(inputs.labor) +
    num(inputs.subs) +
    num(inputs.equipment);
  const overheadPct = Math.min(100, num(inputs.overheadPct));
  return { directCost, overheadPct };
}

function finalize(directCost: number, bidPrice: number, overheadPct: number): BidMath {
  const grossProfit = bidPrice - directCost;
  const overheadRecovery = bidPrice * (overheadPct / 100);
  return {
    directCost: round2(directCost),
    bidPrice: round2(bidPrice),
    equivalentMarkup:
      directCost > 0 ? round2((grossProfit / directCost) * 100) : 0,
    equivalentMargin:
      bidPrice > 0 ? round2((grossProfit / bidPrice) * 100) : 0,
    grossProfit: round2(grossProfit),
    overheadRecovery: round2(overheadRecovery),
    netProfit: round2(grossProfit - overheadRecovery),
  };
}

/** Price = cost ÷ (1 − margin). Margin must be < 100%. */
export function bidFromMargin(
  inputs: BidInputs,
  marginPctRaw: unknown,
): BidMath {
  const { directCost, overheadPct } = base(inputs);
  const m = Math.min(99.99, num(marginPctRaw));
  const bidPrice = directCost > 0 ? directCost / (1 - m / 100) : 0;
  return finalize(directCost, bidPrice, overheadPct);
}

/** Price = cost × (1 + markup). */
export function bidFromMarkup(
  inputs: BidInputs,
  markupPctRaw: unknown,
): BidMath {
  const { directCost, overheadPct } = base(inputs);
  const k = num(markupPctRaw);
  const bidPrice = directCost * (1 + k / 100);
  return finalize(directCost, bidPrice, overheadPct);
}
