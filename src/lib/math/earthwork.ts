/**
 * BuildCalc Pro — Earthwork, masonry & foundation math (Batch 4D).
 *
 * Pure functions only: no React, no storage, no I/O. All quantities are
 * rounded UP at the order step (suppliers don't split units); net values
 * stay fractional for the materials table.
 */

/* ------------------------------------------------------------------ */
/* 1. CMU block, mortar & core-fill grout                               */
/* ------------------------------------------------------------------ */

export type CmuBlockSize = "8x8x16" | "6x8x16" | "12x8x16";
export type CmuCoreFill = "none" | "solid" | "oc24" | "oc32" | "oc48";

/** Nominal block face is always 8" x 16" regardless of width. */
export const CMU_FACE_SQFT = (8 * 16) / 144; // 0.8889 sq ft
/** 80-lb mortar bags: blocks laid per bag (mid-range of mfr data sheets). */
const MORTAR_BLOCKS_PER_BAG = 15;
/** Cores sit on 8" centers along the wall (2 cores per 16" block). */
const CORE_SPACING_IN = 8;
/** Grout volume of one fully-grouted 8x8x16 block, cu ft.
 *  CMHA TEK 09-04A Table 2: 36.1 ft³ per 100 ft² of 8" wall ÷ 112.5 blocks
 *  = 0.32 ft³/block (includes waste allowance). Physical void ≈ 0.25 ft³. */
const GROUT_CUFT_PER_BLOCK_SOLID = 0.32;
/** Width scaling of grout volume vs the 8" reference, per CMHA TEK 09-04A
 *  (6" wall 25.6, 8" wall 36.1, 12" wall 58.9 ft³ per 100 ft² solid). */
const GROUT_WIDTH_FACTOR: Record<CmuBlockSize, number> = {
  "6x8x16": 25.6 / 36.1,
  "8x8x16": 1,
  "12x8x16": 58.9 / 36.1,
};
/** Grout volume of one bond-beam (knockout) block, cu ft. */
const GROUT_CUFT_PER_BOND_BEAM_BLOCK = 0.12;
/** Standard rebar stick length, ft. */
const REBAR_STICK_FT = 20;

export interface CmuTakeoffInput {
  wallLengthFt: number;
  wallHeightFt: number;
  /** Block width drives core-fill grout volume (see GROUT_WIDTH_FACTOR). */
  blockSize: CmuBlockSize;
  coreFill: CmuCoreFill;
  bondBeamCourses: number;
  blockWastePct: number;
  mortarWastePct: number;
}

export interface CmuTakeoff {
  wallAreaSqft: number;
  /** Fractional net blocks before waste. */
  netBlocks: number;
  /** Rounded-up order quantity incl. waste. */
  orderBlocks: number;
  /** 80-lb Type S/M bags, rounded up incl. waste. */
  mortarBags: number;
  /** Core-fill + bond-beam grout, cubic yards (2 decimals). */
  groutCuYd: number;
  /** 20-ft horizontal rebar sticks for bond beams (2 bars continuous). */
  bondBeamSticks: number;
  blocksPerCourse: number;
}

export function cmuTakeoff(i: CmuTakeoffInput): CmuTakeoff {
  const wallAreaSqft = Math.max(0, i.wallLengthFt) * Math.max(0, i.wallHeightFt);
  const netBlocks = wallAreaSqft / CMU_FACE_SQFT;
  const orderBlocks = Math.ceil(
    netBlocks * (1 + Math.max(0, i.blockWastePct) / 100),
  );
  // Mortar: 80-lb bags. Manufacturer data sheets (Quikrete 13, Sakrete 15,
  // Menards 12, TradeCraft 18, Best Materials 20 blocks per bag) — 15 is the
  // defensible mid-range. Based on NET blocks (broken blocks use no mortar),
  // then the user's mortar waste is applied once.
  const mortarBags = Math.ceil(
    (netBlocks / MORTAR_BLOCKS_PER_BAG) *
      (1 + Math.max(0, i.mortarWastePct) / 100),
  );
  const blocksPerCourse = Math.ceil(Math.max(0, i.wallLengthFt) / (16 / 12));

  // Grout: fraction of cores actually filled. Cores are on 8" centers, so
  // "every N inches O.C." fills 1 in (N / 8) cores. Bond-beam courses are
  // always grouted solid along their full length.
  let coreFraction = 0;
  if (i.coreFill === "solid") coreFraction = 1;
  else if (i.coreFill === "oc24") coreFraction = 1 / (24 / CORE_SPACING_IN);
  else if (i.coreFill === "oc32") coreFraction = 1 / (32 / CORE_SPACING_IN);
  else if (i.coreFill === "oc48") coreFraction = 1 / (48 / CORE_SPACING_IN);
  const coreGroutCuFt =
    netBlocks *
    GROUT_CUFT_PER_BLOCK_SOLID *
    (GROUT_WIDTH_FACTOR[i.blockSize] ?? 1) *
    coreFraction;
  const courses = Math.max(0, Math.round(i.bondBeamCourses));
  const bondBeamGroutCuFt =
    courses * blocksPerCourse * GROUT_CUFT_PER_BOND_BEAM_BLOCK;
  const groutCuYd =
    Math.round(((coreGroutCuFt + bondBeamGroutCuFt) / 27) * 100) / 100;

  // Two continuous bars per bond beam, 20-ft sticks, +10% lap allowance,
  // rounded up.
  const bondBeamSticks =
    courses > 0
      ? Math.ceil(
          (courses * Math.max(0, i.wallLengthFt) * 2 * 1.1) / REBAR_STICK_FT,
        )
      : 0;

  return {
    wallAreaSqft: Math.round(wallAreaSqft * 10) / 10,
    netBlocks: Math.round(netBlocks * 10) / 10,
    orderBlocks,
    mortarBags,
    groutCuYd,
    bondBeamSticks,
    blocksPerCourse,
  };
}

/* ------------------------------------------------------------------ */
/* 2. Excavation, swell & dirt haul                                     */
/* ------------------------------------------------------------------ */

export type SoilType = "common" | "sand" | "clayRock";

export const SOIL_SWELL: Record<SoilType, { label: string; pct: number }> = {
  common: { label: "Common earth / clay", pct: 25 },
  sand: { label: "Sand / gravel", pct: 15 },
  clayRock: { label: "Dense wet clay / rock", pct: 35 },
};

export interface ExcavationTakeoffInput {
  lengthFt: number;
  widthFt: number;
  depthFt: number;
  soilType: SoilType;
  truckCapacityYd: number;
}

export interface ExcavationTakeoff {
  /** In-situ bank volume, cubic yards (2 decimals). */
  bankCuYd: number;
  /** Expanded loose volume after swell, cubic yards (2 decimals). */
  looseCuYd: number;
  /** Heaped truckloads, rounded up. */
  truckLoads: number;
  swellPct: number;
}

export function excavationTakeoff(i: ExcavationTakeoffInput): ExcavationTakeoff {
  const bankCuYd =
    (Math.max(0, i.lengthFt) * Math.max(0, i.widthFt) * Math.max(0, i.depthFt)) /
    27;
  const swellPct = SOIL_SWELL[i.soilType]?.pct ?? 25;
  const looseCuYd = bankCuYd * (1 + swellPct / 100);
  const truckLoads =
    i.truckCapacityYd > 0 ? Math.ceil(looseCuYd / i.truckCapacityYd) : 0;
  return {
    bankCuYd: Math.round(bankCuYd * 100) / 100,
    looseCuYd: Math.round(looseCuYd * 100) / 100,
    truckLoads,
    swellPct,
  };
}

/* ------------------------------------------------------------------ */
/* 3. Segmental retaining wall & geogrid                                */
/* ------------------------------------------------------------------ */

export type SrwBlockSize = "6x16" | "8x18";

export interface RetainingWallInput {
  lengthFt: number;
  exposedHeightFt: number;
  buriedCourses: number;
  blockSize: SrwBlockSize;
  /** Drainage stone column width behind the wall, inches. */
  drainageWidthIn: number;
  blockWastePct: number;
}

export interface RetainingWallTakeoff {
  totalHeightFt: number;
  courses: number;
  blocksPerCourse: number;
  /** Rounded up incl. waste. */
  totalBlocks: number;
  /** Cap units, rounded up incl. waste. */
  capUnits: number;
  /** 3/4" drainage stone, tons (1 decimal). */
  drainageTons: number;
  /** Geogrid required by the 4-ft rule. */
  geogridRequired: boolean;
  /** Geogrid layers (every 2 courses). */
  geogridLayers: number;
  /** Geogrid fabric, sq ft, rounded up. */
  geogridSqft: number;
  /** Base leveling pad crusher run, tons (1 decimal). */
  baseTons: number;
}

const TONS_PER_CUYD_DRAINAGE = 1.4;
const TONS_PER_CUYD_CRUSHER_RUN = 1.62;

export function retainingWallTakeoff(i: RetainingWallInput): RetainingWallTakeoff {
  const blockHeightFt = i.blockSize === "6x16" ? 6 / 12 : 8 / 12;
  const blockLengthFt = i.blockSize === "6x16" ? 16 / 12 : 18 / 12;
  const lengthFt = Math.max(0, i.lengthFt);
  const exposedFt = Math.max(0, i.exposedHeightFt);
  const buriedFt = Math.max(0, Math.round(i.buriedCourses)) * blockHeightFt;
  const totalHeightFt = exposedFt + buriedFt;

  const courses = Math.ceil(totalHeightFt / blockHeightFt);
  const blocksPerCourse = Math.ceil(lengthFt / blockLengthFt);
  const wasteF = 1 + Math.max(0, i.blockWastePct) / 100;
  const totalBlocks = Math.ceil(courses * blocksPerCourse * wasteF);
  const capUnits = Math.ceil(blocksPerCourse * wasteF);

  // Drainage column: full exposed height x specified width, 3/4" stone.
  // Suppliers sell by the half-ton — round the order quantity up.
  const drainageTons =
    Math.ceil(
      (((lengthFt * (Math.max(0, i.drainageWidthIn) / 12) * exposedFt) / 27) *
        TONS_PER_CUYD_DRAINAGE) /
        0.5,
    ) * 0.5;

  // Base leveling pad: 6" deep x 24" wide crusher run under the first course.
  const baseTons =
    Math.round(
      ((lengthFt * 0.5 * 2) / 27) * TONS_PER_CUYD_CRUSHER_RUN * 10,
    ) / 10;

  // Geogrid: walls over 4 ft get grid every 2 courses, embedment 0.7 x height.
  const geogridRequired = exposedFt > 4;
  const geogridLayers = geogridRequired ? Math.floor(courses / 2) : 0;
  const geogridSqft = geogridRequired
    ? Math.ceil(geogridLayers * lengthFt * totalHeightFt * 0.7)
    : 0;

  return {
    totalHeightFt: Math.round(totalHeightFt * 100) / 100,
    courses,
    blocksPerCourse,
    totalBlocks,
    capUnits,
    drainageTons,
    geogridRequired,
    geogridLayers,
    geogridSqft,
    baseTons,
  };
}

/* ------------------------------------------------------------------ */
/* 4. Aggregate & stone tonnage                                         */
/* ------------------------------------------------------------------ */

export type AggregateMaterial =
  | "gravel57"
  | "crusherRun"
  | "masonSand"
  | "decomposedGranite";

export const AGGREGATE_MATERIALS: Record<
  AggregateMaterial,
  { label: string; tonsPerCuYd: number; defaultCompactionPct: number }
> = {
  gravel57: {
    label: "Crushed stone / gravel #57",
    tonsPerCuYd: 1.42,
    defaultCompactionPct: 10,
  },
  crusherRun: {
    label: "Dense graded road base / crusher run",
    tonsPerCuYd: 1.62,
    defaultCompactionPct: 15,
  },
  masonSand: {
    label: "Mason / bedding sand",
    tonsPerCuYd: 1.35,
    defaultCompactionPct: 10,
  },
  decomposedGranite: {
    label: "Decomposed granite / fines",
    tonsPerCuYd: 1.55,
    defaultCompactionPct: 20,
  },
};

export interface AggregateTakeoffInput {
  areaSqft: number;
  thicknessIn: number;
  material: AggregateMaterial;
  compactionPct: number;
}

export interface AggregateTakeoff {
  areaSqft: number;
  /** Loose cubic yards before compaction allowance (2 decimals). */
  looseCuYd: number;
  /** Cubic yards incl. compaction allowance (2 decimals). */
  compactedCuYd: number;
  /** Order tons, rounded up to the half ton. */
  tons: number;
  tonsPerCuYd: number;
}

export function aggregateTakeoff(i: AggregateTakeoffInput): AggregateTakeoff {
  const areaSqft = Math.max(0, i.areaSqft);
  const looseCuYd = (areaSqft * (Math.max(0, i.thicknessIn) / 12)) / 27;
  const compactedCuYd = looseCuYd * (1 + Math.max(0, i.compactionPct) / 100);
  const tonsPerCuYd = AGGREGATE_MATERIALS[i.material]?.tonsPerCuYd ?? 1.42;
  const tons = Math.ceil(compactedCuYd * tonsPerCuYd * 2) / 2;
  return {
    areaSqft: Math.round(areaSqft * 10) / 10,
    looseCuYd: Math.round(looseCuYd * 100) / 100,
    compactedCuYd: Math.round(compactedCuYd * 100) / 100,
    tons,
    tonsPerCuYd,
  };
}

/* ------------------------------------------------------------------ */
/* 5. Asphalt paving & driveway                                         */
/* ------------------------------------------------------------------ */

export interface AsphaltTakeoffInput {
  areaSqft: number;
  /** Compacted asphalt thickness, inches. */
  asphaltThicknessIn: number;
  /** Compacted aggregate base thickness, inches. */
  baseThicknessIn: number;
  wastePct: number;
}

export interface AsphaltTakeoff {
  areaSqft: number;
  /** Square yards of coverage (2 decimals). */
  sqYd: number;
  /** Hot-mix asphalt, tons incl. waste (2 decimals). */
  asphaltTons: number;
  /** Aggregate sub-base, tons incl. 10% compaction allowance (½-ton orders). */
  baseTons: number;
}

/**
 * 110 lbs of HMA per square yard per inch of compacted thickness
 * (= 0.75 cu ft x 145 pcf, the standard hot-mix unit weight).
 */
const HMA_LBS_PER_SQYD_PER_IN = 110;

export function asphaltTakeoff(i: AsphaltTakeoffInput): AsphaltTakeoff {
  const areaSqft = Math.max(0, i.areaSqft);
  const sqYd = areaSqft / 9;
  const wasteF = 1 + Math.max(0, i.wastePct) / 100;
  const asphaltTons =
    Math.round(
      ((sqYd * HMA_LBS_PER_SQYD_PER_IN * Math.max(0, i.asphaltThicknessIn)) /
        2000) *
        wasteF *
        100,
    ) / 100;
  // Base stone is ordered by the half-ton.
  const baseTons =
    Math.ceil(
      (((areaSqft * (Math.max(0, i.baseThicknessIn) / 12)) / 27) *
        TONS_PER_CUYD_CRUSHER_RUN *
        1.1) /
        0.5,
    ) * 0.5;
  return {
    areaSqft: Math.round(areaSqft * 10) / 10,
    sqYd: Math.round(sqYd * 100) / 100,
    asphaltTons,
    baseTons,
  };
}
