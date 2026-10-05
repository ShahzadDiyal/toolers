/**
 * BuildCalc Pro MEP, insulation & interior trim math (Batch 4F).
 *
 * Pure functions only: no React, no storage, no I/O. Order quantities
 * round UP; net values stay fractional for the materials table.
 *
 * NOTE: HVAC figures are Manual-J-style rules of thumb for budgeting and
 * bid scoping not a substitute for an ACCA Manual J load calculation.
 */

/* ------------------------------------------------------------------ */
/* 1. HVAC heating/cooling BTU & tonnage                                */
/* ------------------------------------------------------------------ */

export type ClimateZone = "zone12" | "zone34" | "zone57";
export type InsulationQuality = "poor" | "average" | "high";
export type SunExposure = "heavy" | "average" | "shaded";

export const CLIMATE_ZONES: Record<
  ClimateZone,
  { label: string; coolingBtuPerSqft: number; heatingBtuPerSqft: number }
> = {
  zone12: {
    label: "Zone 1–2 · Hot/Humid",
    coolingBtuPerSqft: 32.5,
    heatingBtuPerSqft: 22.5,
  },
  zone34: {
    label: "Zone 3–4 · Moderate",
    coolingBtuPerSqft: 27.5,
    heatingBtuPerSqft: 35,
  },
  zone57: {
    label: "Zone 5–7 · Cold",
    coolingBtuPerSqft: 22,
    heatingBtuPerSqft: 47.5,
  },
};

const INSULATION_MOD: Record<InsulationQuality, number> = {
  poor: 0.2,
  average: 0,
  high: -0.15,
};
const SUN_MOD: Record<SunExposure, number> = {
  heavy: 0.1,
  average: 0,
  shaded: -0.1,
};

export interface HvacTakeoffInput {
  floorAreaSqft: number;
  ceilingHeightFt: number;
  climateZone: ClimateZone;
  insulation: InsulationQuality;
  sun: SunExposure;
  occupants: number;
}

export interface HvacTakeoff {
  baseCoolingBtu: number;
  adjustedCoolingBtu: number;
  /** Rounded UP to the nearest half ton. */
  acTons: number;
  heatingBtu: number;
  /** ~400 CFM per ton of cooling. */
  cfm: number;
}

export function hvacTakeoff(i: HvacTakeoffInput): HvacTakeoff {
  const area = Math.max(0, i.floorAreaSqft);
  const heightF = Math.max(0, i.ceilingHeightFt) / 8;
  const zone = CLIMATE_ZONES[i.climateZone] ?? CLIMATE_ZONES.zone34;

  const baseCoolingBtu = area * zone.coolingBtuPerSqft * heightF;
  const adjustedCoolingBtu =
    baseCoolingBtu *
      (1 + (INSULATION_MOD[i.insulation] ?? 0) + (SUN_MOD[i.sun] ?? 0)) +
    Math.max(0, Math.round(i.occupants) - 2) * 400;
  const acTons = Math.ceil((adjustedCoolingBtu / 12000) * 2) / 2;
  const heatingBtu = area * zone.heatingBtuPerSqft * heightF;
  const cfm = acTons * 400;

  const r0 = (n: number) => Math.round(n);
  return {
    baseCoolingBtu: r0(baseCoolingBtu),
    adjustedCoolingBtu: r0(adjustedCoolingBtu),
    acTons,
    heatingBtu: r0(heatingBtu),
    cfm: r0(cfm),
  };
}

/* ------------------------------------------------------------------ */
/* 2. Insulation batts, blown cellulose & R-value                       */
/* ------------------------------------------------------------------ */

export type InsulationApp = "attic" | "wall2x4" | "wall2x6" | "crawlspace";
export type InsulationType = "batts" | "cellulose";
export type TargetR = 13 | 15 | 19 | 30 | 38 | 49;

export const INSULATION_APPS: Record<InsulationApp, { label: string }> = {
  attic: { label: "Attic floor / ceiling" },
  wall2x4: { label: "Exterior 2×4 walls" },
  wall2x6: { label: "Exterior 2×6 walls" },
  crawlspace: { label: "Crawlspace / floor joists" },
};

/** Batt bundle coverage, sq ft per bag, by R-value. */
const BATT_COVERAGE_PER_BAG: Record<TargetR, number> = {
  13: 125,
  15: 100,
  19: 88,
  30: 58,
  38: 42,
  49: 32,
};
/** Installed batt thickness, inches. */
const BATT_THICKNESS_IN: Record<TargetR, number> = {
  13: 3.5,
  15: 3.5,
  19: 6.25,
  30: 9.5,
  38: 12,
  49: 14,
};

export interface InsulationTakeoffInput {
  app: InsulationApp;
  insType: InsulationType;
  areaSqft: number;
  framingSpacingIn: 16 | 24;
  targetR: TargetR;
}

export interface InsulationTakeoff {
  /** Cavity area after framing deduction (walls × 0.90). */
  netAreaSqft: number;
  /** Bags/bundles to order, rounded up. */
  bags: number;
  /** Installed thickness, inches. */
  thicknessIn: number;
  achievedR: number;
  unitLabel: string;
}

export function insulationTakeoff(i: InsulationTakeoffInput): InsulationTakeoff {
  const area = Math.max(0, i.areaSqft);
  const isWall = i.app === "wall2x4" || i.app === "wall2x6";
  const netAreaSqft = area * (isWall ? 0.9 : 1);

  let bags: number;
  let thicknessIn: number;
  let unitLabel: string;
  if (i.insType === "batts") {
    const coverage = BATT_COVERAGE_PER_BAG[i.targetR] ?? 88;
    bags = Math.ceil((netAreaSqft * 1.05) / coverage);
    thicknessIn = BATT_THICKNESS_IN[i.targetR] ?? 6.25;
    unitLabel = "batt bundles";
  } else {
    // Blown cellulose: ~1.13 bags per 1k sq ft per R point (≈43 bags/1k @ R-38,
    // inside the 38–45 manufacturer band: Insulmax 1.14 lb/ft² @ R-38,
    // GreenFiber coverage charts). Settled depth ≈ R-3.6 per inch.
    const bagsPer1k = i.targetR * 1.13;
    bags = Math.ceil((netAreaSqft / 1000) * bagsPer1k * 1.05);
    thicknessIn = Math.round((i.targetR / 3.6) * 10) / 10;
    unitLabel = "30-lb cellulose bags";
  }

  return {
    netAreaSqft: Math.round(netAreaSqft * 10) / 10,
    bags,
    thicknessIn,
    achievedR: i.targetR,
    unitLabel,
  };
}

/* ------------------------------------------------------------------ */
/* 3. PEX plumbing runs & WSFU main sizing                               */
/* ------------------------------------------------------------------ */

export type PexSystem = "homerun" | "trunk";

export interface PexTakeoffInput {
  system: PexSystem;
  fullBaths: number;
  halfBaths: number;
  kitchens: number;
  laundry: number;
  hoseBibbs: number;
  avgRunFt: number;
}

export interface PexTakeoff {
  /** IPC water supply fixture units. */
  totalWsfu: number;
  mainSizeIn: string;
  coldConnections: number;
  hotConnections: number;
  coldFt: number;
  hotFt: number;
  /** 100-ft coils. */
  coldCoils: number;
  hotCoils: number;
  /** 3/4" (or 1") main trunk footage allowance. */
  mainTrunkFt: number;
  /** Manifold ports (home-run). */
  manifoldPorts: number;
  /** Fitting packs (10-pack). */
  fittingPacks: number;
}

/** IPC WSFU per fixture group (private use). Half-bath = WC 2.5 + lav 0.7. */
const WSFU = {
  fullBath: 3.5,
  halfBath: 3.2,
  kitchen: 2.0,
  laundry: 2.0,
  hoseBibb: 2.5,
} as const;

export function pexTakeoff(i: PexTakeoffInput): PexTakeoff {
  const n = (v: number) => Math.max(0, Math.round(v));
  const fullBaths = n(i.fullBaths);
  const halfBaths = n(i.halfBaths);
  const kitchens = n(i.kitchens);
  const laundry = n(i.laundry);
  const hoseBibbs = n(i.hoseBibbs);
  const avgRunFt = Math.max(0, i.avgRunFt);

  const totalWsfu =
    Math.round(
      (fullBaths * WSFU.fullBath +
        halfBaths * WSFU.halfBath +
        kitchens * WSFU.kitchen +
        laundry * WSFU.laundry +
        hoseBibbs * WSFU.hoseBibb) *
        10,
    ) / 10;
  const mainSizeIn = totalWsfu <= 14 ? '3/4"' : '1"';

  // Fixture connections: toilet = cold; lav/sink = hot+cold; tub/shower =
  // hot+cold; dishwasher = hot; washer = hot+cold; hose bibb = cold.
  const coldConnections =
    fullBaths * 3 + halfBaths * 2 + kitchens * 1 + laundry * 2 + hoseBibbs * 1;
  const hotConnections =
    fullBaths * 2 + halfBaths * 1 + kitchens * 2 + laundry * 2;

  const coldFt = Math.round(coldConnections * avgRunFt * 1.15);
  const hotFt = Math.round(hotConnections * avgRunFt * 1.15);
  const coldCoils = Math.ceil(coldFt / 100);
  const hotCoils = Math.ceil(hotFt / 100);

  // Main trunk allowance: source→manifold for home-run; roughly double
  // for trunk-and-branch which traverses the house.
  const mainTrunkFt = Math.round(
    avgRunFt * (i.system === "homerun" ? 1 : 2) * 1.15,
  );
  const manifoldPorts =
    i.system === "homerun" ? coldConnections + hotConnections : 0;
  const fittingPacks = Math.ceil((coldConnections + hotConnections) / 10);

  return {
    totalWsfu,
    mainSizeIn,
    coldConnections,
    hotConnections,
    coldFt,
    hotFt,
    coldCoils,
    hotCoils,
    mainTrunkFt,
    manifoldPorts,
    fittingPacks,
  };
}

/* ------------------------------------------------------------------ */
/* 4. Crown molding, baseboard & miter cuts                             */
/* ------------------------------------------------------------------ */

export type TrimProfile = "crown" | "baseboard" | "chairRail";

export const TRIM_PROFILES: Record<TrimProfile, { label: string }> = {
  crown: { label: "Crown molding" },
  baseboard: { label: "Tall baseboard" },
  chairRail: { label: "Chair rail / picture frame" },
};

export interface TrimTakeoffInput {
  perimeterLF: number;
  insideCorners: number;
  outsideCorners: number;
  stockLengthFt: 8 | 12 | 16;
  profile: TrimProfile;
  wastePct: number;
}

export interface TrimTakeoff {
  netLF: number;
  /** Gross linear feet incl. waste. */
  grossLF: number;
  /** Stock boards to order. */
  boards: number;
  /** Estimated scarf joints on long runs. */
  scarfJoints: number;
  /** Total miter/bevel cuts. */
  miterCuts: number;
  /** 10-oz caulk tubes (1 per 75 LF). */
  caulkTubes: number;
}

export function trimTakeoff(i: TrimTakeoffInput): TrimTakeoff {
  const netLF = Math.max(0, i.perimeterLF);
  const grossLF = netLF * (1 + Math.max(0, i.wastePct) / 100);
  const stockFt = i.stockLengthFt === 8 ? 8 : i.stockLengthFt === 12 ? 12 : 16;
  const boards = Math.ceil(grossLF / stockFt);

  const corners =
    Math.max(0, Math.round(i.insideCorners)) +
    Math.max(0, Math.round(i.outsideCorners));
  // Runs longer than one stock board need scarf joints; assume ~4 runs
  // for a simple room, more as corners multiply.
  const runs = Math.max(4, corners);
  const scarfJoints = Math.max(0, boards - runs);
  const miterCuts = corners * 2 + scarfJoints * 2;
  const caulkTubes = Math.ceil(grossLF / 75);

  return {
    netLF: Math.round(netLF * 10) / 10,
    grossLF: Math.round(grossLF * 10) / 10,
    boards,
    scarfJoints,
    miterCuts,
    caulkTubes,
  };
}

/* ------------------------------------------------------------------ */
/* 5. Acoustic texture, popcorn & drywall mud                            */
/* ------------------------------------------------------------------ */

export type TextureStyle = "smooth" | "orangePeel" | "knockdown" | "popcorn";
export type TextureDepth = "light" | "medium" | "heavy";

export const TEXTURE_STYLES: Record<
  TextureStyle,
  { label: string; unit: string; unitSize: string; coverageSqft: number; dryMix: boolean }
> = {
  smooth: {
    label: "Smooth finish (Level 4/5 skim)",
    unit: "buckets",
    unitSize: "4.5-gal",
    coverageSqft: 375,
    dryMix: false,
  },
  orangePeel: {
    label: "Orange peel / splatter",
    unit: "bags",
    unitSize: "50-lb",
    coverageSqft: 550,
    dryMix: true,
  },
  knockdown: {
    label: "Knockdown",
    unit: "bags",
    unitSize: "50-lb",
    coverageSqft: 550,
    dryMix: true,
  },
  popcorn: {
    label: "Acoustic popcorn",
    unit: "bags",
    unitSize: "40-lb",
    coverageSqft: 350,
    dryMix: true,
  },
};

const DEPTH_FACTOR: Record<TextureDepth, number> = {
  light: 1.25,
  medium: 1,
  heavy: 0.8,
};

export interface TextureTakeoffInput {
  areaSqft: number;
  style: TextureStyle;
  depth: TextureDepth;
}

export interface TextureTakeoff {
  areaSqft: number;
  /** Bags or buckets to order. */
  units: number;
  unitLabel: string;
  /** PVA primer gallons (350 sq ft/gal). */
  primerGal: number;
  /** Mixing water gallons (dry-mix styles, ~5 gal/bag). */
  waterGal: number;
}

export function textureTakeoff(i: TextureTakeoffInput): TextureTakeoff {
  const areaSqft = Math.max(0, i.areaSqft);
  const style = TEXTURE_STYLES[i.style] ?? TEXTURE_STYLES.knockdown;
  const coverage = style.coverageSqft * (DEPTH_FACTOR[i.depth] ?? 1);
  const units = Math.ceil((areaSqft * 1.1) / coverage);
  const primerGal = Math.ceil(areaSqft / 350);
  const waterGal = style.dryMix ? units * 5 : 0;

  return {
    areaSqft: Math.round(areaSqft * 10) / 10,
    units,
    unitLabel: `${style.unitSize} ${style.unit}`,
    primerGal,
    waterGal,
  };
}
