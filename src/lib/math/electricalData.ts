/**
 * BuildCalc Pro — NEC reference data + raceway/voltage-drop math (Phase 4C).
 *
 * Sources: NEC Chapter 9 Table 1 (fill %), Table 4 (conduit areas),
 * Table 5 (THHN conductor areas), Table 8 (conductor properties).
 * Pure functions, unit-testable. This is a sizing aid, not a substitute
 * for the adopted code and AHJ requirements.
 */

function num(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

/* ---------------- Conductor data (THHN/THWN-2 copper, in²) ---------------- */
export const THHN_AREA_IN2: Record<string, number> = {
  "#14": 0.0097,
  "#12": 0.0133,
  "#10": 0.0211,
  "#8": 0.0366,
  "#6": 0.0507,
  "#4": 0.0824,
};
export const WIRE_GAUGES_FILL = ["#14", "#12", "#10", "#8", "#6", "#4"] as const;

/* ---------------- Conduit internal area (in²), NEC Ch.9 Table 4 ---------------- */
export type ConduitType = "EMT" | "PVC40" | "PVC80" | "RMC";
export const CONDUIT_TYPES: { id: ConduitType; label: string }[] = [
  { id: "EMT", label: "EMT" },
  { id: "PVC40", label: "PVC Sch 40" },
  { id: "PVC80", label: "PVC Sch 80" },
  { id: "RMC", label: "Rigid (RMC)" },
];
export const TRADE_SIZES = ['1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"'] as const;

export const CONDUIT_AREA_IN2: Record<ConduitType, Record<string, number>> = {
  EMT: { '1/2"': 0.304, '3/4"': 0.533, '1"': 0.864, '1-1/4"': 1.496, '1-1/2"': 2.036, '2"': 3.356 },
  PVC40: { '1/2"': 0.285, '3/4"': 0.508, '1"': 0.832, '1-1/4"': 1.453, '1-1/2"': 1.97, '2"': 3.199 },
  PVC80: { '1/2"': 0.217, '3/4"': 0.409, '1"': 0.688, '1-1/4"': 1.237, '1-1/2"': 1.689, '2"': 2.874 },
  RMC: { '1/2"': 0.314, '3/4"': 0.549, '1"': 0.887, '1-1/4"': 1.526, '1-1/2"': 2.071, '2"': 3.408 },
};

/* ---------------- Circular mils, NEC Ch.9 Table 8 ---------------- */
export const CIRCULAR_MILS: Record<string, number> = {
  "#14": 4110, "#12": 6530, "#10": 10380, "#8": 16510, "#6": 26240,
  "#4": 41740, "#3": 52620, "#2": 66360, "#1": 83690,
  "1/0": 105600, "2/0": 133100, "3/0": 167800, "4/0": 211600,
};
export const WIRE_GAUGES_VD = Object.keys(CIRCULAR_MILS);

/** K factor: copper 12.9, aluminum 21.2 (NEC Ch.9 Table 8). */
export const K_FACTOR = { copper: 12.9, aluminum: 21.2 } as const;

/* ---------------- Conduit fill ---------------- */

/** NEC Ch.9 Table 1 fill limit: 53% (1 wire), 31% (2), 40% (3+). */
export function fillLimitPct(wireCount: number): number {
  if (wireCount <= 1) return 53;
  if (wireCount === 2) return 31;
  return 40;
}

export interface ConduitFillResult {
  wireCount: number;
  totalWireArea: number;
  conduitArea: number;
  fillPct: number;
  limitPct: number;
  /** True when fill exceeds the NEC limit. */
  violation: boolean;
  /** Smallest trade size (same type) that clears the limit, if any. */
  recommendedSize: string | null;
}

export function conduitFill(
  conduitType: ConduitType,
  tradeSize: string,
  qtyByGauge: Record<string, number>,
): ConduitFillResult {
  const areas = CONDUIT_AREA_IN2[conduitType] ?? {};
  const conduitArea = areas[tradeSize] ?? 0;
  let wireCount = 0;
  let totalWireArea = 0;
  for (const [gauge, qty] of Object.entries(qtyByGauge)) {
    const q = Math.floor(num(qty));
    const a = THHN_AREA_IN2[gauge] ?? 0;
    wireCount += q;
    totalWireArea += q * a;
  }
  const fillPct =
    conduitArea > 0 ? (totalWireArea / conduitArea) * 100 : 0;
  const limitPct = fillLimitPct(wireCount);
  const violation = fillPct > limitPct;

  let recommendedSize: string | null = null;
  if (wireCount > 0) {
    for (const size of TRADE_SIZES) {
      const area = areas[size] ?? 0;
      if (area > 0 && (totalWireArea / area) * 100 <= limitPct) {
        recommendedSize = size;
        break;
      }
    }
  }

  return {
    wireCount,
    totalWireArea: Math.round(totalWireArea * 10000) / 10000,
    conduitArea,
    fillPct: Math.round(fillPct * 10) / 10,
    limitPct,
    violation,
    recommendedSize,
  };
}

/* ---------------- Voltage drop ---------------- */

export type Phase = "1P" | "3P";

export interface VoltageDropResult {
  voltsDropped: number;
  dropPct: number;
  voltsAtLoad: number;
  /** True when drop exceeds the 3% branch-circuit guideline. */
  warning: boolean;
  /** Smallest gauge (same material) that clears 3%, if any. */
  recommendedGauge: string | null;
}

export function voltageDrop(
  sourceVoltsRaw: unknown,
  ampsRaw: unknown,
  oneWayFtRaw: unknown,
  material: "copper" | "aluminum",
  gauge: string,
  phase: Phase = "1P",
): VoltageDropResult {
  const V = num(sourceVoltsRaw);
  const I = num(ampsRaw);
  const L = num(oneWayFtRaw);
  const K = K_FACTOR[material] ?? K_FACTOR.copper;
  const cm = CIRCULAR_MILS[gauge] ?? 0;

  if (V <= 0 || I <= 0 || L <= 0 || cm <= 0) {
    return {
      voltsDropped: 0, dropPct: 0, voltsAtLoad: V,
      warning: false, recommendedGauge: null,
    };
  }

  // 1-phase: Vd = 2·K·I·L / CM ··· 3-phase: Vd = √3·K·I·L / CM
  const factor = phase === "3P" ? Math.sqrt(3) : 2;
  const voltsDropped = (factor * K * I * L) / cm;
  const dropPct = (voltsDropped / V) * 100;

  let recommendedGauge: string | null = null;
  // Search from the selected gauge toward larger conductors.
  const order = WIRE_GAUGES_VD;
  const startIdx = Math.max(0, order.indexOf(gauge));
  for (let i = startIdx; i < order.length; i++) {
    const g = order[i];
    const vd = (factor * K * I * L) / (CIRCULAR_MILS[g] ?? 1);
    if ((vd / V) * 100 <= 3) {
      recommendedGauge = g;
      break;
    }
  }

  return {
    voltsDropped: Math.round(voltsDropped * 100) / 100,
    dropPct: Math.round(dropPct * 100) / 100,
    voltsAtLoad: Math.round((V - voltsDropped) * 100) / 100,
    warning: dropPct > 3,
    recommendedGauge,
  };
}
