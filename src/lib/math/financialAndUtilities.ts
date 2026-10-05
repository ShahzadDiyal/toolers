/**
 * BuildCalc Pro Business financials & jobsite utilities math (Batch 4G).
 *
 * Pure functions only: no React, no storage, no I/O.
 */

/* ------------------------------------------------------------------ */
/* 1. True burdened labor rate                                          */
/* ------------------------------------------------------------------ */

export interface BurdenTakeoffInput {
  baseWage: number;
  ficaPct: number;
  unemploymentPct: number;
  workersCompPer100: number;
  /** General liability as % of payroll (0 = use annual premium instead). */
  glMode: "pct" | "annual";
  glPctOfPayroll: number;
  glAnnualPremium: number;
  ptoDays: number;
  annualBenefits: number;
  billableEfficiencyPct: number;
}

export interface BurdenTakeoff {
  annualBasePay: number;
  statutoryTaxes: number;
  workersComp: number;
  glCost: number;
  ptoCost: number;
  totalAnnualCost: number;
  billableHours: number;
  /** True employer cost per billable hour. */
  burdenedRate: number;
  /** (burdened − base) / base × 100. */
  burdenPct: number;
  /** For the breakdown display. */
  breakdown: { label: string; amount: number }[];
}

const ANNUAL_HOURS = 2080;

export function burdenTakeoff(i: BurdenTakeoffInput): BurdenTakeoff {
  const baseWage = Math.max(0, i.baseWage);
  const annualBasePay = baseWage * ANNUAL_HOURS;
  const statutoryTaxes =
    annualBasePay *
    (Math.max(0, i.ficaPct) / 100 + Math.max(0, i.unemploymentPct) / 100);
  const workersComp =
    (annualBasePay / 100) * Math.max(0, i.workersCompPer100);
  const glPct = Math.max(0, i.glPctOfPayroll);
  const glCost =
    i.glMode === "annual"
      ? Math.max(0, i.glAnnualPremium)
      : annualBasePay * (glPct / 100);
  const ptoDays = Math.max(0, i.ptoDays);
  const ptoCost = ptoDays * 8 * baseWage;
  const benefits = Math.max(0, i.annualBenefits) + ptoCost;
  const totalAnnualCost =
    annualBasePay + statutoryTaxes + workersComp + glCost + benefits;

  const efficiency = Math.min(100, Math.max(0, i.billableEfficiencyPct)) / 100;
  const billableHours = Math.max(
    1,
    ANNUAL_HOURS * efficiency - ptoDays * 8,
  );
  const burdenedRate = totalAnnualCost / billableHours;
  const burdenPct =
    baseWage > 0 ? ((burdenedRate - baseWage) / baseWage) * 100 : 0;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    annualBasePay: r2(annualBasePay),
    statutoryTaxes: r2(statutoryTaxes),
    workersComp: r2(workersComp),
    glCost: r2(glCost),
    ptoCost: r2(ptoCost),
    totalAnnualCost: r2(totalAnnualCost),
    billableHours: Math.round(billableHours),
    burdenedRate: r2(burdenedRate),
    burdenPct: r2(burdenPct),
    breakdown: [
      { label: "Base wages", amount: r2(annualBasePay) },
      { label: "Payroll taxes (FICA + unemp.)", amount: r2(statutoryTaxes) },
      { label: "Workers' comp", amount: r2(workersComp) },
      { label: "General liability", amount: r2(glCost) },
      { label: "PTO + benefits", amount: r2(benefits) },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 2. Subcontractor piece-work                                          */
/* ------------------------------------------------------------------ */

export type PieceUnit =
  | "roofing-square"
  | "drywall-sheet"
  | "flooring-sqft"
  | "trim-lf"
  | "framing-unit";

export const PIECE_UNITS: Record<PieceUnit, { label: string; unit: string }> = {
  "roofing-square": { label: "Roofing (per square)", unit: "squares" },
  "drywall-sheet": { label: "Drywall (per sheet)", unit: "sheets" },
  "flooring-sqft": { label: "Flooring / tile (per sq ft)", unit: "sq ft" },
  "trim-lf": { label: "Trim (per linear ft)", unit: "lin ft" },
  "framing-unit": { label: "Framing (per stud / foot)", unit: "units" },
};

export interface PieceRateInput {
  unit: PieceUnit;
  quantity: number;
  pieceRate: number;
  crewSize: number;
  /** Total crew hours (days × 8 if entered as days). */
  totalHours: number;
}

export interface PieceRateTakeoff {
  totalPayout: number;
  manHours: number;
  /** Effective $/hr per worker. */
  effectiveHourly: number;
  /** Units per man-hour. */
  velocity: number;
}

export function pieceRateTakeoff(i: PieceRateInput): PieceRateTakeoff {
  const quantity = Math.max(0, i.quantity);
  const totalPayout = quantity * Math.max(0, i.pieceRate);
  const manHours = Math.max(0.01, i.crewSize) * Math.max(0, i.totalHours);
  // No hours logged → no hourly rate or velocity to report (avoid Infinity).
  const effectiveHourly = manHours > 0 ? totalPayout / manHours : 0;
  const velocity = manHours > 0 ? quantity / manHours : 0;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    totalPayout: r2(totalPayout),
    manHours: r2(manHours),
    effectiveHourly: r2(effectiveHourly),
    velocity: r2(velocity),
  };
}

/* ------------------------------------------------------------------ */
/* 3. Daily jobsite overhead & breakeven                                */
/* ------------------------------------------------------------------ */

export interface BreakevenInput {
  vehicleCost: number;
  insuranceCost: number;
  officeCost: number;
  adminSalary: number;
  professionalFees: number;
  billableDays: number;
  profitTargetPct: number;
}

export interface BreakevenTakeoff {
  annualOverhead: number;
  /** Zero-profit daily cost. */
  dailyOverhead: number;
  hourlyOverhead: number;
  /** Daily rate that also hits the profit target. */
  survivalRate: number;
  breakdown: { label: string; amount: number }[];
}

export function breakevenTakeoff(i: BreakevenInput): BreakevenTakeoff {
  const parts = [
    { label: "Vehicles, fuel & maintenance", amount: Math.max(0, i.vehicleCost) },
    { label: "Liability & umbrella insurance", amount: Math.max(0, i.insuranceCost) },
    { label: "Office, software & phone", amount: Math.max(0, i.officeCost) },
    { label: "Owner / admin salary", amount: Math.max(0, i.adminSalary) },
    { label: "Legal, bookkeeping & tax", amount: Math.max(0, i.professionalFees) },
  ];
  const annualOverhead = parts.reduce((s, p) => s + p.amount, 0);
  const billableDays = Math.max(1, i.billableDays);
  const dailyOverhead = annualOverhead / billableDays;
  const hourlyOverhead = dailyOverhead / 8;
  const profitF = Math.min(90, Math.max(0, i.profitTargetPct)) / 100;
  const survivalRate = dailyOverhead / (1 - profitF);

  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    annualOverhead: r2(annualOverhead),
    dailyOverhead: r2(dailyOverhead),
    hourlyOverhead: r2(hourlyOverhead),
    survivalRate: r2(survivalRate),
    breakdown: parts.map((p) => ({ ...p, amount: r2(p.amount) })),
  };
}

/* ------------------------------------------------------------------ */
/* 4. Architectural fraction keypad 16ths integer arithmetic          */
/* ------------------------------------------------------------------ */

/**
 * Parse one architectural term (e.g. `14' 7 3/8"`, `9' 11-1/2"`, `3/4"`)
 * into 16ths of an inch. Integer math avoids IEEE-754 drift.
 */
export function parseArchTo16ths(term: string): number {
  let t = term
    .trim()
    .replace(/[′’]/g, "'")
    .replace(/[″”]/g, '"')
    .replace(/-/g, " ");
  if (!t) return 0;
  let sixteenths = 0;

  const ft = t.match(/(\d+(?:\.\d+)?)\s*'/);
  if (ft) {
    sixteenths += Math.round(parseFloat(ft[1]) * 12 * 16);
    t = t.replace(ft[0], " ");
  }
  const frac = t.match(/(\d+)\s*\/\s*(\d+)/);
  if (frac) {
    const denom = parseInt(frac[2], 10);
    if (denom > 0) {
      sixteenths += Math.round((parseInt(frac[1], 10) / denom) * 16);
    }
    t = t.replace(frac[0], " ");
  }
  const inch = t.match(/(\d+(?:\.\d+)?)/);
  if (inch) {
    sixteenths += Math.round(parseFloat(inch[1]) * 16);
  }
  return sixteenths;
}

/** Format 16ths back to `F' I-N/D"` with reduced fractions. */
export function formatArchFrom16ths(sixteenths: number): string {
  const sign = sixteenths < 0 ? "-" : "";
  const abs = Math.abs(Math.round(sixteenths));
  const ft = Math.floor(abs / (12 * 16));
  const rem = abs - ft * 12 * 16;
  const inch = Math.floor(rem / 16);
  const six = rem - inch * 16;
  const g = gcd(six, 16);
  const frac = six === 0 ? "" : ` ${six / g}/${16 / g}`;
  if (ft === 0 && inch === 0 && six === 0) return `0"`;
  if (ft === 0) return `${sign}${inch}${frac}"`;
  return `${sign}${ft}' ${inch}${frac}"`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Decimal inches from 16ths. */
export function sixteenthsToDecimalIn(s: number): number {
  return Math.round((s / 16) * 10000) / 10000;
}

/** Metric equivalents for a 16ths value. */
export function sixteenthsToMetric(s: number): { mm: number; m: number } {
  const mm = (s / 16) * 25.4;
  return {
    mm: Math.round(mm * 10) / 10,
    m: Math.round((mm / 1000) * 10000) / 10000,
  };
}

export type KeypadOp = "+" | "-" | "×" | "÷";

/** Apply an operator in 16ths integer space. */
export function applyKeypadOp(a16: number, op: KeypadOp, b16: number): number {
  switch (op) {
    case "+":
      return a16 + b16;
    case "-":
      return a16 - b16;
    case "×":
      return Math.round((a16 * b16) / 16);
    case "÷":
      return b16 === 0 ? NaN : Math.round((a16 * 16) / b16);
  }
}

/* ------------------------------------------------------------------ */
/* 5. Construction unit converter                                       */
/* ------------------------------------------------------------------ */

export type ConverterDimension = "area" | "volume" | "weight";

export interface ConverterUnit {
  id: string;
  label: string;
  short: string;
  /** Factor to the dimension's base unit. */
  toBase: number;
}

export const CONVERTER_UNITS: Record<ConverterDimension, ConverterUnit[]> = {
  area: [
    { id: "sqft", label: "Square feet", short: "sq ft", toBase: 1 },
    { id: "sqyd", label: "Square yards", short: "sq yd", toBase: 9 },
    { id: "squares", label: "Roofing squares", short: "sq", toBase: 100 },
    { id: "acres", label: "Acres", short: "ac", toBase: 43560 },
    { id: "sqm", label: "Square meters", short: "m²", toBase: 10.7639 },
  ],
  volume: [
    { id: "cuft", label: "Cubic feet", short: "cu ft", toBase: 1 },
    { id: "cuyd", label: "Cubic yards", short: "cu yd", toBase: 27 },
    { id: "gal", label: "Gallons (US)", short: "gal", toBase: 0.133681 },
    { id: "cum", label: "Cubic meters", short: "m³", toBase: 35.3147 },
    { id: "liter", label: "Liters", short: "L", toBase: 0.0353147 },
  ],
  weight: [
    { id: "lb", label: "Pounds", short: "lb", toBase: 1 },
    { id: "ton", label: "Tons (2,000 lb)", short: "tn", toBase: 2000 },
    { id: "tonne", label: "Metric tonnes", short: "t", toBase: 2204.62 },
    { id: "kg", label: "Kilograms", short: "kg", toBase: 2.20462 },
  ],
};

/** Convert a value between two units of the same dimension. */
export function convertUnits(
  value: number,
  from: ConverterUnit,
  to: ConverterUnit,
): number {
  if (!from || !to || from.toBase === 0) return NaN;
  const base = value * from.toBase;
  const out = base / to.toBase;
  return Math.abs(out) >= 10000 || (Math.abs(out) < 0.001 && out !== 0)
    ? Number(out.toPrecision(6))
    : Math.round(out * 1000000) / 1000000;
}

/** Rule-of-thumb reference cards shown under the converter. */
export const CONVERTER_RULES: { rule: string; detail: string }[] = [
  { rule: "1 cu yd = 27 cu ft", detail: "The concrete and dirt conversion." },
  { rule: "1 roofing square = 100 sq ft", detail: "…= 3 shingle bundles (3-tab)." },
  { rule: "1 cu yd concrete ≈ 2 tons", detail: "~4,000 lbs per yard, standard mix." },
  { rule: "1 acre = 43,560 sq ft", detail: "…= 4,840 sq yd." },
  { rule: "1 gal = 231 cu in", detail: "7.48 gal per cubic foot." },
  { rule: "1 m = 3.28084 ft", detail: "1 in = 25.4 mm exactly." },
];
