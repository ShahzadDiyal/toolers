/**
 * BuildCalc Pro Exterior, decking & framing math (Batch 4E).
 *
 * Pure functions only: no React, no storage, no I/O. Order quantities
 * round UP; net values stay fractional for the materials table.
 */

/* ------------------------------------------------------------------ */
/* 1. Deck, joist & post estimator                                      */
/* ------------------------------------------------------------------ */

export type DeckBoardType = "composite" | "pt2x6";

export interface DeckTakeoffInput {
  widthFt: number;
  projectionFt: number;
  joistSpacingIn: 12 | 16;
  boardType: DeckBoardType;
  postSpacingFt: number;
  postHoleDepthIn: number;
}

export interface DeckTakeoff {
  /** Field joists (excludes rim/ledger), count. */
  fieldJoists: number;
  /** Rim + ledger boards in 16-ft stock lengths. */
  rimLedgerBoards: number;
  /** Decking planks (each `widthFt` long), incl. 10% cut waste. */
  deckingPlanks: number;
  /** Total linear feet of decking surface. */
  deckingLF: number;
  /** Support posts. */
  posts: number;
  /** 80-lb post concrete bags, from hole volume (rounded up per post). */
  concreteBags: number;
  /** 80-lb bags per post used to price the footing dispatch line. */
  concreteBagsPerPost: number;
  /** Fastener packs (1 per 100 sq ft). */
  fastenerPacks: number;
  deckAreaSqft: number;
}

/** Actual board width + 1/4" gap, inches. Composite 5/4x6 = 5.5" face. */
const DECK_BOARD_PITCH_IN: Record<DeckBoardType, number> = {
  composite: 5.75,
  pt2x6: 5.75, // nominal 2x6 dresses to 5.5" + 1/4" gap
};

export function deckTakeoff(i: DeckTakeoffInput): DeckTakeoff {
  const widthFt = Math.max(0, i.widthFt);
  const projFt = Math.max(0, i.projectionFt);
  const spacingIn = i.joistSpacingIn === 12 ? 12 : 16;

  const fieldJoists = Math.ceil((widthFt * 12) / spacingIn) + 1;
  const rimLedgerBoards = Math.ceil((2 * widthFt + 2 * projFt) / 16);
  const pitchIn = DECK_BOARD_PITCH_IN[i.boardType] ?? 5.75;
  // Courses first, then waste, then round up never under-order boards.
  const deckingPlanks = Math.ceil(Math.ceil((projFt * 12) / pitchIn) * 1.1);
  const deckingLF = Math.round(deckingPlanks * widthFt * 10) / 10;

  const postSpacingFt = Math.max(1, i.postSpacingFt);
  const posts =
    (Math.ceil(widthFt / postSpacingFt) + 1) *
    Math.max(1, Math.ceil(projFt / postSpacingFt));
  // Concrete from the actual hole volume: 12"-dia auger hole (standard),
  // 80-lb bag yields 0.6 ft³. Bags per post are rounded up suppliers
  // don't split bags.
  const holeDepthFt = Math.max(0, i.postHoleDepthIn) / 12;
  const holeVolFt3 = Math.PI * 0.25 * holeDepthFt; // π × (6"/12)² × depth
  const concreteBagsPerPost = Math.ceil(holeVolFt3 / 0.6);
  const concreteBags = posts * concreteBagsPerPost;
  const deckAreaSqft = widthFt * projFt;
  const fastenerPacks = Math.ceil(deckAreaSqft / 100);

  return {
    fieldJoists,
    rimLedgerBoards,
    deckingPlanks,
    deckingLF,
    posts,
    concreteBags,
    concreteBagsPerPost,
    fastenerPacks,
    deckAreaSqft: Math.round(deckAreaSqft * 10) / 10,
  };
}

/* ------------------------------------------------------------------ */
/* 2. Wood & chain-link fence estimator                                 */
/* ------------------------------------------------------------------ */

export type FenceType = "wood" | "chainlink";

export interface FenceTakeoffInput {
  fenceType: FenceType;
  totalLF: number;
  heightFt: 4 | 6 | 8;
  postSpacingFt: 6 | 8;
  picketWidthIn: 3.5 | 5.5;
  /** Horizontal 2x4 rails per section (wood). */
  railCount: number;
  singleGates: number;
  doubleGates: number;
}

export interface FenceTakeoff {
  sections: number;
  posts: number;
  /** 60-lb fast-set concrete bags (2 per post). */
  concreteBags: number;
  /** 2x4 rails (wood only), 8-ft stock, incl. 5% waste. */
  rails: number;
  /** Pickets (wood only), incl. 10% cut waste. */
  pickets: number;
  /** Chain-link fabric rolls, 50-ft rolls (chain-link only). */
  fabricRolls: number;
  gateKits: number;
}

/** Picket gap allowance, inches (privacy fences run near-tight). */
const PICKET_GAP_IN = 0.25;

export function fenceTakeoff(i: FenceTakeoffInput): FenceTakeoff {
  const totalLF = Math.max(0, i.totalLF);
  const spacingFt = i.postSpacingFt === 6 ? 6 : 8;
  const sections = totalLF / spacingFt;
  const singleGates = Math.max(0, Math.round(i.singleGates));
  const doubleGates = Math.max(0, Math.round(i.doubleGates));
  const posts =
    Math.ceil(sections) + 1 + singleGates * 1 + doubleGates * 2;
  const concreteBags = posts * 2;
  const gateKits = singleGates + doubleGates;

  let rails = 0;
  let pickets = 0;
  let fabricRolls = 0;
  if (i.fenceType === "wood") {
    rails = Math.ceil(sections * Math.max(0, i.railCount) * 1.05);
    pickets = Math.ceil(
      ((totalLF * 12) / (i.picketWidthIn + PICKET_GAP_IN)) * 1.1,
    );
  } else {
    fabricRolls = Math.ceil(totalLF / 50);
  }

  return {
    sections: Math.round(sections * 10) / 10,
    posts,
    concreteBags,
    rails,
    pickets,
    fabricRolls,
    gateKits,
  };
}

/* ------------------------------------------------------------------ */
/* 3. Interlocking paver, bedding & polymeric sand                      */
/* ------------------------------------------------------------------ */

export type PaverSize = "4x8" | "6x6" | "6x9" | "12x12";
export type PaverJoint = "narrow" | "wide";

export const PAVER_SIZES: Record<PaverSize, { label: string; lIn: number; wIn: number }> = {
  "4x8": { label: "4×8 brick pavers", lIn: 4, wIn: 8 },
  "6x6": { label: "6×6 cobble", lIn: 6, wIn: 6 },
  "6x9": { label: "6×9 modern", lIn: 6, wIn: 9 },
  "12x12": { label: "12×12 architectural slab", lIn: 12, wIn: 12 },
};

/** Sq ft covered by one 50-lb polymeric sand bag. */
const POLY_SAND_COVERAGE: Record<PaverJoint, number> = {
  narrow: 75, // 1/8" joints
  wide: 35, // 3/8" / textured false joints
};

export interface PaverTakeoffInput {
  areaSqft: number;
  paverSize: PaverSize;
  baseDepthIn: number;
  joint: PaverJoint;
  wastePct: number;
}

export interface PaverTakeoff {
  netAreaSqft: number;
  grossAreaSqft: number;
  /** Individual paver units, rounded up. */
  paverCount: number;
  /** Compacted #57/road-base tons (1 decimal). */
  baseTons: number;
  /** 1" screed bedding sand tons (1 decimal). */
  beddingTons: number;
  /** 50-lb polymeric sand bags. */
  polySandBags: number;
}

export function paverTakeoff(i: PaverTakeoffInput): PaverTakeoff {
  const netAreaSqft = Math.max(0, i.areaSqft);
  const wasteF = 1 + Math.max(0, i.wastePct) / 100;
  const grossAreaSqft = netAreaSqft * wasteF;
  const size = PAVER_SIZES[i.paverSize] ?? PAVER_SIZES["4x8"];
  const paverCount = Math.ceil(grossAreaSqft / ((size.lIn * size.wIn) / 144));
  const baseTons =
    Math.round(
      ((netAreaSqft * (Math.max(0, i.baseDepthIn) / 12)) / 27) * 1.6 * 1.1 * 10,
    ) / 10;
  // Bedding sand: 1" screed layer at 1.35 tons/cu yd, +10% screeding overage.
  const beddingTons =
    Math.round((((netAreaSqft * (1 / 12)) / 27) * 1.35 * 1.1 * 10)) / 10;
  const polySandBags = Math.ceil(
    grossAreaSqft / (POLY_SAND_COVERAGE[i.joint] ?? 75),
  );
  return {
    netAreaSqft: Math.round(netAreaSqft * 10) / 10,
    grossAreaSqft: Math.round(grossAreaSqft * 10) / 10,
    paverCount,
    baseTons,
    beddingTons,
    polySandBags,
  };
}

/* ------------------------------------------------------------------ */
/* 4. Exterior siding & housewrap                                       */
/* ------------------------------------------------------------------ */

export type SidingMaterial = "vinyl" | "fiberCement" | "engineeredWood";

export const SIDING_MATERIALS: Record<SidingMaterial, { label: string }> = {
  vinyl: { label: "Vinyl lap siding" },
  fiberCement: { label: "Fiber cement (HardiePlank 8.25″)" },
  engineeredWood: { label: "Engineered wood / LP SmartSide" },
};

export interface SidingTakeoffInput {
  perimeterFt: number;
  wallHeightFt: number;
  gableCount: number;
  gableBaseFt: number;
  gablePeakFt: number;
  windowsCount: number;
  garageDoorsCount: number;
  entryDoorsCount: number;
  sidingMaterial: SidingMaterial;
  outsideCornerCount: number;
  wastePct: number;
}

export interface SidingTakeoff {
  wallAreaSqft: number;
  gableAreaSqft: number;
  deductionsSqft: number;
  netAreaSqft: number;
  /** Coverage squares (100 sq ft), rounded up incl. waste. */
  squares: number;
  /** 9x100-ft housewrap rolls, incl. 15% overlap. */
  housewrapRolls: number;
  /** 10-ft starter strips. */
  starterStrips: number;
  /** 10-ft corner post pieces. */
  cornerPcs: number;
}

export function sidingTakeoff(i: SidingTakeoffInput): SidingTakeoff {
  const perimeterFt = Math.max(0, i.perimeterFt);
  const wallHeightFt = Math.max(0, i.wallHeightFt);
  const wallAreaSqft = perimeterFt * wallHeightFt;
  const gableAreaSqft =
    Math.max(0, Math.round(i.gableCount)) *
    0.5 *
    Math.max(0, i.gableBaseFt) *
    Math.max(0, i.gablePeakFt);
  const deductionsSqft =
    Math.max(0, Math.round(i.windowsCount)) * 15 +
    Math.max(0, Math.round(i.garageDoorsCount)) * 120 +
    Math.max(0, Math.round(i.entryDoorsCount)) * 21;
  const netAreaSqft = Math.max(0, wallAreaSqft + gableAreaSqft - deductionsSqft);
  const wasteF = 1 + Math.max(0, i.wastePct) / 100;

  const squares = Math.ceil((netAreaSqft * wasteF) / 100);
  const housewrapRolls = Math.ceil((netAreaSqft * 1.15) / 900);
  const starterStrips = Math.ceil(perimeterFt / 10);
  const cornerPcs =
    Math.max(0, Math.round(i.outsideCornerCount)) *
    Math.max(1, Math.ceil(wallHeightFt / 10));

  return {
    wallAreaSqft: Math.round(wallAreaSqft * 10) / 10,
    gableAreaSqft: Math.round(gableAreaSqft * 10) / 10,
    deductionsSqft: Math.round(deductionsSqft * 10) / 10,
    netAreaSqft: Math.round(netAreaSqft * 10) / 10,
    squares,
    housewrapRolls,
    starterStrips,
    cornerPcs,
  };
}

/* ------------------------------------------------------------------ */
/* 5. Rafter & truss cut lengths                                        */
/* ------------------------------------------------------------------ */

export interface RafterTakeoffInput {
  /** Building span, wall to wall, feet. */
  spanFt: number;
  /** Roof pitch, rise per 12 (e.g. 6 = 6/12). */
  pitch: number;
  ridgeThicknessIn: 1.5 | 0.75;
  /** Horizontal eave overhang past the plate, inches. */
  overhangIn: number;
  rafterStock: "2x6" | "2x8";
  /** Ridge (building) length, feet for rafter count. */
  ridgeLengthFt: number;
  rafterSpacingIn: 16 | 24;
}

export interface RafterTakeoff {
  /** Horizontal run of the rafter, inches. */
  runIn: number;
  /** Pitch angle, degrees. */
  pitchAngleDeg: number;
  /** Common rafter line length (ridge to plate), inches. */
  lineLengthIn: number;
  /** Overhang rafter length, inches. */
  overhangLengthIn: number;
  /** Total blank length, inches. */
  totalLengthIn: number;
  /** Plumb cut angle = pitch angle, degrees. */
  plumbCutDeg: number;
  /** Seat cut angle = 90 - pitch angle, degrees. */
  seatCutDeg: number;
  /** Bird's-mouth plumb depth for a 3.5" seat, inches. */
  birdsMouthDepthIn: number;
  /** True when the mouth exceeds 1/3 of rafter depth. */
  birdsMouthWarning: boolean;
  /** Recommended stock length, feet. */
  stockLengthFt: number;
  /** True when the blank exceeds 24-ft stock (falls back to 24 silently). */
  overStockLength: boolean;
  /** Total rafters (both slopes). */
  rafterCount: number;
  rafterDepthIn: number;
}

const RAFTER_DEPTH_IN: Record<"2x6" | "2x8", number> = {
  "2x6": 5.5,
  "2x8": 7.25,
};
const STOCK_LENGTHS_FT = [10, 12, 14, 16, 18, 20, 22, 24];

/** Format inches as Ft - In - sixteenths, e.g. 14' 7-3/8". */
export function formatRafterLength(totalIn: number): string {
  const sign = totalIn < 0 ? "-" : "";
  const abs = Math.abs(totalIn);
  const ft = Math.floor(abs / 12);
  const remIn = abs - ft * 12;
  const wholeIn = Math.floor(remIn);
  let sixteenths = Math.round((remIn - wholeIn) * 16);
  let f = ft;
  let wIn = wholeIn;
  if (sixteenths === 16) {
    sixteenths = 0;
    wIn += 1;
  }
  if (wIn === 12) {
    wIn = 0;
    f += 1;
  }
  const frac =
    sixteenths === 0
      ? ""
      : (() => {
          const g = gcd(sixteenths, 16);
          return `-${sixteenths / g}/${16 / g}`;
        })();
  return `${sign}${f}′ ${wIn}${frac}″`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function rafterTakeoff(i: RafterTakeoffInput): RafterTakeoff {
  const spanIn = Math.max(0, i.spanFt) * 12;
  const runIn = spanIn / 2 - i.ridgeThicknessIn / 2;
  const pitch = Math.max(0, i.pitch);
  const riseIn = runIn * (pitch / 12);
  const lineLengthIn = Math.hypot(runIn, riseIn);
  const pitchAngleDeg = (Math.atan(pitch / 12) * 180) / Math.PI;

  const overhangIn = Math.max(0, i.overhangIn);
  const overhangLengthIn = Math.hypot(overhangIn, overhangIn * (pitch / 12));
  const totalLengthIn = lineLengthIn + overhangLengthIn;

  const plumbCutDeg = pitchAngleDeg;
  const seatCutDeg = 90 - pitchAngleDeg;
  // 3.5" level seat on the plate; plumb depth = seat x tan(pitch angle).
  const birdsMouthDepthIn = 3.5 * Math.tan((pitchAngleDeg * Math.PI) / 180);
  const rafterDepthIn = RAFTER_DEPTH_IN[i.rafterStock] ?? 7.25;
  const birdsMouthWarning = birdsMouthDepthIn > rafterDepthIn / 3;

  const totalFt = totalLengthIn / 12;
  const stockLengthFt = STOCK_LENGTHS_FT.find((s) => s >= totalFt) ?? 24;
  const overStockLength = totalFt > 24;

  const spacingIn = i.rafterSpacingIn === 24 ? 24 : 16;
  const pairs =
    Math.ceil((Math.max(0, i.ridgeLengthFt) * 12) / spacingIn) + 1;
  const rafterCount = pairs * 2;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    runIn: r2(runIn),
    pitchAngleDeg: r2(pitchAngleDeg),
    lineLengthIn: r2(lineLengthIn),
    overhangLengthIn: r2(overhangLengthIn),
    totalLengthIn: r2(totalLengthIn),
    plumbCutDeg: r2(plumbCutDeg),
    seatCutDeg: r2(seatCutDeg),
    birdsMouthDepthIn: r2(birdsMouthDepthIn),
    birdsMouthWarning,
    stockLengthFt,
    overStockLength,
    rafterCount,
    rafterDepthIn,
  };
}
