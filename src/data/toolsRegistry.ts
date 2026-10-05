/**
 * BuildCalc Pro — Central Tool Registry (Phase 2).
 *
 * THE single source of truth for categories and calculators. Everything
 * downstream renders from here: navbar menus, the ⌘K command menu, the
 * homepage dashboard, /tools, /categories hubs, and tool pages.
 *
 * To ship a Phase 3/4 tool: add a ToolMetadata entry below with
 * `available: true`, build the calculator with useToolAutoSave + ToolShell +
 * ResultsCard (see src/components/calculator/tools/), and register the
 * component in TOOL_COMPONENTS at src/app/tools/[slug]/page.tsx.
 * Nothing else changes.
 */
import type {
  Category,
  CategoryMetadata,
  ToolMetadata,
} from "@/types/estimator";

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export const CATEGORIES: CategoryMetadata[] = [
  {
    id: "concrete",
    label: "Concrete, Masonry & Earthwork",
    tagline: "Slabs, footings, rebar, block",
    blurb:
      "Cubic-yard quantities, sack math, rebar and block counts — priced with waste before you pour.",
    iconName: "Layers",
    subtrades: ["Flatwork", "Footings & Walls", "Reinforcement", "Masonry"],
  },
  {
    id: "framing-roofing",
    label: "Framing, Carpentry & Roofing",
    tagline: "Lumber, stairs, pitch, shingles",
    blurb:
      "Stud walls, stair stringers, rafter lengths, board feet and roofing squares for the whole envelope.",
    iconName: "Hammer",
    subtrades: ["Wall Framing", "Roofing", "Stairs", "Lumber Math"],
  },
  {
    id: "finishes",
    label: "Drywall, Tile & Finishes",
    tagline: "Drywall, paint, flooring, tile",
    blurb:
      "Sheet goods, paint gallons, flooring and tile box counts with layout waste built in.",
    iconName: "Paintbrush",
    subtrades: ["Drywall", "Paint", "Flooring", "Tile"],
  },
  {
    id: "site-exterior",
    label: "Site Work, Decks & Fencing",
    tagline: "Excavation, gravel, decks, fences",
    blurb:
      "Cut/fill dirt, aggregate tonnage, deck boards, fence runs and paver quantities for the site.",
    iconName: "Shovel",
    subtrades: ["Earthwork", "Decks", "Fencing", "Hardscape"],
  },
  {
    id: "mep",
    label: "MEP Quick-Check Estimators",
    tagline: "Electrical, plumbing, HVAC",
    blurb:
      "Wire and conduit runs, light layouts, and BTU sizing sanity-checks for the trades.",
    iconName: "Zap",
    subtrades: ["Electrical", "HVAC", "Plumbing"],
  },
  {
    id: "financial-business",
    label: "Bidding, Markup & Financials",
    tagline: "Markup, margin, overhead, bids",
    blurb:
      "Turn job costs into bid prices: markup vs margin, overhead recovery, and break-even math.",
    iconName: "Calculator",
    subtrades: ["Pricing", "Overhead", "Bidding"],
  },
  {
    id: "utilities",
    label: "Field Converters & Master Proposal",
    tagline: "Converters, fractions, trig",
    blurb:
      "Feet-inches-fractions converters, unit conversions, and right-triangle helpers that live on every job.",
    iconName: "Ruler",
    subtrades: ["Converters", "Layout Math", "Proposal"],
  },
];

export const TOOL_CATEGORIES: Category[] = CATEGORIES.map((c) => c.id);

export function getCategory(id: Category): CategoryMetadata {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}

/* ------------------------------------------------------------------ */
/*  Tools                                                              */
/* ------------------------------------------------------------------ */

export const TOOLS: ToolMetadata[] = [
  /* ---------------- Concrete, Masonry & Earthwork ---------------- */
  {
    id: "concrete-slab",
    slug: "concrete-slab",
    title: "Concrete Slab Calculator",
    shortDescription:
      "Cubic yards, 80/60-lb bags, and order quantities for slabs, pads, and flatwork.",
    category: "concrete",
    subtrade: "Flatwork",
    tags: ["slab", "flatwork", "cubic yards", "bags", "ready mix", "pad", "pour"],
    iconName: "Layers",
    formulaSummary: "V = L × W × D ÷ 27 → +waste",
    inputsSummary: "L × W × thickness",
    outputs: ["Cubic yards", "80/60-lb bags", "Order quantity"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Volume = length × width × (thickness ÷ 12) gives cubic feet; divide by 27 for cubic yards — the unit ready-mix is sold in.",
      "Order quantity = net yards × (1 + waste%). The 10–15% default covers spillage, over-excavation, and uneven subgrade.",
      "An 80-lb bag yields ≈ 0.6 cu ft, so one cubic yard needs about 45 bags (60 for 60-lb bags). Counts round up — suppliers don't split bags.",
    ],
    faqs: [
      { q: "How many cubic yards of concrete do I need for a 20x12 slab at 4 inches?", a: "A 20x12 ft slab at 4 in thick needs 2.96 cubic yards net (20 x 12 x (4/12) / 27). Order about 3.26 yards with 10% waste. Loads under 4 yards usually trigger a short-load fee." },
      { q: "How many 80-lb bags of concrete are in a cubic yard?", a: "One cubic yard takes about 45 80-lb bags (or 60 60-lb bags). A 20x12x4-inch slab needs roughly 147 80-lb bags including 10% waste." },
      { q: "How many cubic yards fit in a concrete truck?", a: "A standard ready-mix truck carries about 10 cubic yards. Anything under 4 yards typically incurs a short-load fee, so small pours are often cheaper in bags." },
    ],
    howTo: "Pick a shape, enter dimensions, set waste and your supplier rate — the order quantity, bags, truckloads, and cost update live.",
  },
  {
    id: "concrete-footing",
    slug: "concrete-footing",
    title: "Footing Concrete Estimator",
    shortDescription:
      "Yards and truckloads for strip footings, stem walls, and foundations.",
    category: "concrete",
    subtrade: "Footings & Walls",
    tags: ["footing", "rebar", "ready mix", "pour", "yards", "foundation", "stem wall", "footer"],
    iconName: "Layers",
    formulaSummary: "V = L × W × D ÷ 27",
    inputsSummary: "L × W × D per run",
    outputs: ["Cubic yards", "Truckloads", "Bags"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "rebar-mesh-estimator",
    slug: "rebar-mesh-estimator",
    title: "Rebar & Mesh Estimator",
    shortDescription:
      "Bar counts, spacing grids, and lap lengths for slabs and footings.",
    category: "concrete",
    subtrade: "Reinforcement",
    tags: ["rebar", "mesh", "spacing", "laps", "steel", "grid", "wire mesh"],
    iconName: "Grid3x3",
    formulaSummary: "Bars = span ÷ spacing + 1",
    inputsSummary: "Slab/footing dims + spacing",
    outputs: ["Linear feet", "20-ft sticks", "Steel weight", "Tie count"],
    badge: "IRC Code Compliant",
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Enter slab dimensions, pick rebar or wire mesh, set spacing and lap — sticks, weight, and tie counts update live.",
    details: [
      "Bar runs = floor((span − 2 × cover) ÷ spacing) + 1 per direction; total footage includes the lap-splice allowance for bar joints.",
      "Weight uses standard bar weights (#3 = 0.376, #4 = 0.668, #5 = 1.043 lb/ft) so you can price by the ton.",
      "Tie count = one tie per grid intersection — budget a 1,000-count bag per ~1,000 intersections.",
    ],
    faqs: [
      { q: "What spacing should rebar be in a concrete slab?", a: "12 inches on center each way is the common residential default; 18 to 24 inches suits light-duty work. Keep 3 inches of clear cover from form edges." },
      { q: "How much does #4 rebar weigh per foot?", a: "#4 (1/2-inch) bar weighs 0.668 lb per foot, so 500 linear feet is about 334 lbs." },
      { q: "How many 20-foot sticks of rebar do I need?", a: "Divide total linear feet including your lap-splice allowance (typically 15%) by 20 and round up." },
    ],
  },
  {
    id: "concrete-column",
    slug: "concrete-column",
    title: "Sonotube & Pier Calculator",
    shortDescription:
      "Yards and bags for round piers, columns, and deck footings.",
    category: "concrete",
    subtrade: "Footings & Walls",
    tags: ["pier", "sonotube", "column", "round", "post base", "deck footing"],
    iconName: "Cylinder",
    formulaSummary: "V = π r² h ÷ 27",
    inputsSummary: "Diameter × depth × count",
    outputs: ["Cubic yards", "Bags per pier"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "cmu-block-mortar",
    slug: "cmu-block-mortar",
    title: "CMU Block, Mortar & Core-Fill Grout",
    shortDescription:
      "Block count, Type S mortar bags, core-fill grout yards, and bond-beam rebar for masonry walls.",
    category: "concrete",
    subtrade: "Masonry",
    tags: ["cmu", "cinder", "mortar", "wall", "block", "grout", "masonry", "bond beam", "rebar"],
    iconName: "BrickWall",
    formulaSummary: "Blocks = wall sq ft ÷ 0.89 → +waste",
    inputsSummary: "Wall L × H · block size · grout fill",
    outputs: ["Block count", "Mortar bags", "Grout yards", "Rebar sticks"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "A standard 8×16 in block face covers 0.8889 sq ft, so a wall needs about 112.5 blocks per 100 sq ft before waste — the same for 6, 8, and 12 in widths.",
      "Type S mortar runs about 1 eighty-pound bag per 30 blocks. The 10% default waste covers joints, cuts, and spills.",
      "Cores sit on 8 in centers, so grouting every 24 in O.C. fills every 3rd core, 32 in O.C. every 4th, and 48 in O.C. every 6th. A solid-grouted 8×8×16 block holds about 0.16 cu ft of grout.",
      "Bond-beam courses are grouted solid along their full length with 2 continuous bars — counted in 20-ft sticks.",
    ],
    faqs: [
      { q: "How many CMU blocks do I need for a 40x8 ft wall?", a: "A 40x8 ft wall is 320 sq ft, needing about 360 blocks net (320 / 0.8889). Order 378 blocks with 5% waste for cuts and breakage." },
      { q: "How many 80-lb bags of mortar per 100 blocks?", a: "About 1 bag of Type S mortar per 30 blocks — roughly 3.5 bags per 100 blocks, or 4 with 10% waste. A 378-block wall needs about 14 bags." },
      { q: "How much grout fills CMU cores?", a: "A solid-grouted 8x8x16 block holds about 0.16 cu ft. Grouting every 32 in O.C. fills every 4th core (cores are on 8 in centers), so divide the solid volume by 4." },
    ],
    howTo: "Enter wall dimensions, pick block size and core-fill spacing, add bond-beam courses — blocks, mortar, grout, and rebar price themselves live.",
  },

  /* ---------------- Framing, Carpentry & Roofing ---------------- */
  {
    id: "roof-pitch-shingles",
    slug: "roof-pitch-shingles",
    title: "Roof Pitch & Shingle Calculator",
    shortDescription:
      "Pitch-adjusted roofing squares, bundles, and underlayment from plan dimensions.",
    category: "framing-roofing",
    subtrade: "Roofing",
    tags: ["roof", "shingle", "squares", "pitch", "bundles", "underlayment", "felt"],
    iconName: "House",
    formulaSummary: "Area × pitch factor ÷ 100",
    inputsSummary: "Plan L × W + pitch",
    outputs: ["Roofing squares", "Bundles", "Underlayment rolls"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter the roof footprint, pick a pitch and roof complexity — squares, bundles, and underlayment price themselves instantly.",
    details: [
      "Pitch multiplier M = √(rise² + 12²) ÷ 12 converts plan area to true surface area — a 6/12 roof has ~11.8% more surface than its footprint.",
      "Waste follows complexity: 10% simple gable, 15% hip/valley, 20% cut-up. Valleys and hips eat shingles.",
      "Bundles = squares × 3 (rounded up); underlayment rolls = waste-adjusted area ÷ 1,000 (10-square synthetic rolls).",
    ],
    faqs: [
      { q: "How do you calculate roofing squares from footprint area?", a: "Multiply the footprint (plan) area by the pitch multiplier M = sqrt(rise^2 + 12^2) / 12, add waste, then divide by 100. A 2,000 sq ft footprint at 6/12 with 10% waste is about 24.6 squares." },
      { q: "How many bundles of shingles per square?", a: "Three bundles per square for both architectural and 3-tab shingles, rounded up. 24.6 squares needs 74 bundles." },
      { q: "How much waste should I add for a hip roof?", a: "10% for a simple gable, 15% for hips and valleys, 20% for a complex cut-up roof with dormers and crickets." },
    ],
  },
  {
    id: "stair-stringer-layout",
    slug: "stair-stringer-layout",
    title: "Stair Stringer Layout",
    shortDescription:
      "Riser counts, tread depths, and stringer cuts that meet IRC stair code.",
    category: "framing-roofing",
    subtrade: "Stairs",
    tags: ["stair", "stringer", "rise", "run", "tread", "riser", "code", "steps"],
    iconName: "TrendingUp",
    formulaSummary: "Risers = total rise ÷ 7",
    inputsSummary: "Total rise + run",
    outputs: ["Riser count", "Unit rise/run", "Stringer boards", "IRC checks"],
    badge: "IRC Code Compliant",
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Enter total rise and target tread run — the layout solves risers, stringer length, and live IRC code checks instantly.",
    details: [
      "Riser count = round(total rise ÷ 7.5); unit rise = total rise ÷ count. Treads = risers − 1 (the top tread is the landing).",
      "IRC R311.7: risers ≤ 7¾″, treads ≥ 10″. The comfort rule 2R + T should land between 24″ and 25″.",
      "Stringer boards round up to stock 10/12/14/16-ft 2×12s; widths over 36″ get a fourth stringer.",
    ],
    faqs: [
      { q: "What is the maximum riser height allowed by code?", a: "IRC R311.7.5.1 limits residential risers to 7-3/4 inches maximum, with treads at least 10 inches deep (R311.7.5.2)." },
      { q: "How many steps do I need for a 9-foot ceiling?", a: "Divide total rise by about 7.5 and round: 108 / 7.5 = 14.4, so 14 risers at 7.71 in each, with 13 treads (the top tread is the landing)." },
      { q: "What is the 2R+T stair rule?", a: "Twice the riser height plus the tread run should fall between 24 and 25 inches for a comfortable stair. It is a comfort guideline, not a code requirement." },
    ],
  },
  {
    id: "stud-wall",
    slug: "stud-wall",
    title: "Stud Wall Framing",
    shortDescription:
      "Studs at 16\" or 24\" O.C. plus plates, headers, and cripples.",
    category: "framing-roofing",
    subtrade: "Wall Framing",
    tags: ["stud", "wall", "lumber", "16 oc", "24 oc", "plates", "header", "framing"],
    iconName: "Ruler",
    formulaSummary: "Studs = L ÷ spacing + 1",
    inputsSummary: "Wall length + spacing",
    outputs: ["Stud count", "Plates", "Headers"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "rafter-truss-cuts",
    slug: "rafter-truss-cuts",
    title: "Rafter & Truss Cut Length Calculator",
    shortDescription:
      "Common rafter lengths, bird's-mouth seat cuts, and plumb cut angles from span and pitch.",
    category: "framing-roofing",
    subtrade: "Roofing",
    tags: ["rafter", "pitch", "ridge", "span", "birdsmouth", "plumb cut", "seat cut", "overhang", "truss"],
    iconName: "Triangle",
    formulaSummary: "L = run × √(1 + (rise/12)²)",
    inputsSummary: "Span + pitch + overhang",
    outputs: ["Rafter length", "Cut angles", "Stock length"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "The rafter run is half the building span minus half the ridge board thickness; line length = √(run² + rise²), where rise = run × (pitch ÷ 12).",
      "The plumb cut angle equals the pitch angle (arctan(pitch ÷ 12)); the seat cut is 90° minus the pitch angle.",
      "A 3.5 in level seat on the plate cuts a plumb depth of 3.5 × tan(pitch angle) — it must stay under one-third of the rafter depth or the rafter is overcut.",
      "Eave overhang is measured horizontally past the plate; its rafter length is √(overhang² + (overhang × pitch ÷ 12)²).",
    ],
    faqs: [
      { q: "How long is a common rafter for a 28 ft span at 6/12 pitch?", a: "The run is 168 in minus half the ridge (167.25 in). Rise = 167.25 × 0.5 = 83.6 in. Line length = √(167.25² + 83.6²) = 187 in ≈ 15′ 7″. Add the overhang cut and buy 18-ft stock." },
      { q: "What angle do I cut a bird's mouth for a 6/12 roof?", a: "The plumb cut is the pitch angle — 26.57° for 6/12 — and the seat cut is 90 − 26.57 = 63.43°. A 3.5 in seat cuts 1.75 in deep, safely under the 1.83 in limit for 2×6 stock." },
      { q: "How many rafters do I need for a 40 ft ridge at 16 in O.C.?", a: "Ceil(480 ÷ 16) + 1 = 31 pairs, or 62 rafters for both slopes, plus a starter pair at each gable end in practice." },
    ],
    howTo: "Enter span, ridge length, pitch, and overhang — rafter lengths in ft-in-fractions, cut angles, and stock size solve live.",
  },
  {
    id: "board-feet",
    slug: "board-feet",
    title: "Board Feet Calculator",
    shortDescription:
      "Board-foot totals for lumber and hardwood pricing.",
    category: "framing-roofing",
    subtrade: "Lumber Math",
    tags: ["board feet", "lumber", "hardwood", "bf", "thickness", "width"],
    iconName: "Logs",
    formulaSummary: "BF = T × W × L ÷ 12",
    inputsSummary: "T × W × L + count",
    outputs: ["Board feet", "Piece count"],
    estimatedTime: "< 1 min",
    available: false,
  },

  /* ---------------- Drywall, Tile & Finishes ---------------- */
  {
    id: "framing-drywall-pack",
    slug: "framing-drywall-pack",
    title: "Wall Framing & Drywall Pack",
    shortDescription:
      "Studs, plates, sheets, mud, and tape — the full wall package in one pass.",
    category: "finishes",
    subtrade: "Drywall",
    tags: ["drywall", "sheetrock", "sheets", "mud", "tape", "screws", "pack"],
    iconName: "Square",
    formulaSummary: "Sheets = area ÷ 32 (4×8)",
    inputsSummary: "Room dims + openings",
    outputs: ["Stud count", "Plate boards", "Drywall sheets", "Mud & tape"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter wall length and height, set spacing and openings — studs, plates, sheets, mud, and tape price themselves live.",
    details: [
      "Studs = ceil(length ÷ spacing) + 1, plus 2 per corner and 2 per door for kings/jacks. Plates = 3 runs (double top) or 2, in 16-ft boards.",
      "Net drywall = wall area × sides − door/window deductions (21 / 15 sq ft), plus 10% cutting waste.",
      "One 4.5-gal mud bucket and one 250-ft tape roll cover ~500 sq ft of board each.",
    ],
    faqs: [
      { q: "How many studs do I need for a 40-foot wall at 16 inches on center?", a: "31 studs for the run (40x12/16 rounded up, plus one), plus 2 per corner and 2 per door for kings and jacks - 43 total for a 40-ft wall with 4 corners and 2 doors." },
      { q: "How many drywall sheets for a 12x16 room with 8-ft ceilings?", a: "Wall area is 2 x (12+16) x 8 = 448 sq ft. After deducting a door (21 sq ft) and two windows (30 sq ft) and adding 10% waste, you need about 13 4x8 sheets per side." },
      { q: "How much joint compound do I need per sheet of drywall?", a: "Budget one 4.5-gallon bucket of mud and one 250-ft roll of tape per 500 sq ft of installed board." },
    ],
  },
  {
    id: "paint-primer-coverage",
    slug: "paint-primer-coverage",
    title: "Paint, Primer & Ceiling Coverage",
    shortDescription:
      "Wall, ceiling, and primer gallons with doors and windows deducted.",
    category: "finishes",
    subtrade: "Paint",
    tags: ["paint", "gallons", "coverage", "primer", "walls", "ceiling", "coats"],
    iconName: "Paintbrush",
    formulaSummary: "Gal = net area ÷ 350",
    inputsSummary: "Wall/ceiling area + coats",
    outputs: ["Wall gallons", "Ceiling gallons", "Primer gallons"],
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter room dimensions and openings, toggle ceiling and primer — gallons for every coat update live.",
    details: [
      "Net wall area = 2 × (L + W) × H minus 21 sq ft per door and 15 per window. Ceiling = L × W.",
      "Gallons always round up — paint is sold by the gallon, and a short gallon stops the job.",
      "Primer covers ~350 sq ft/gal on bare drywall; two finish coats is the standard for fresh work.",
    ],
    faqs: [
      { q: "How much paint do I need for a 12x16 room?", a: "Wall area is 2 x (12+16) x 8 = 448 sq ft; minus a door (21) and two windows (30) = 397 sq ft net. Two coats at 350 sq ft per gallon = 3 gallons." },
      { q: "How many square feet does a gallon of paint cover?", a: "About 350 sq ft per gallon on smooth drywall - 300 on rough or textured surfaces, up to 400 on smooth previously-painted walls." },
      { q: "Do I need primer on new drywall?", a: "Yes. One coat of primer at roughly 350 sq ft per gallon seals bare drywall so finish coats cover evenly." },
    ],
  },
  {
    id: "flooring-trim-estimator",
    slug: "flooring-trim-estimator",
    title: "Flooring & Baseboard Trim Estimator",
    shortDescription:
      "Plank boxes, underlayment, and baseboard sticks with layout waste.",
    category: "finishes",
    subtrade: "Flooring",
    tags: ["floor", "lvp", "laminate", "hardwood", "boxes", "waste", "plank"],
    iconName: "LayoutGrid",
    formulaSummary: "Boxes = area × waste ÷ box size",
    inputsSummary: "Floor area + box size",
    outputs: ["Flooring boxes", "Underlayment rolls", "Baseboard sticks"],
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter room size, pick a flooring type and waste tier — boxes, underlayment, and trim price themselves live.",
    details: [
      "Cut waste follows the layout: 5% straight plank, 10% angle/herringbone, 15% diagonal.",
      "Underlayment rolls are 100 sq ft; baseboard comes in 16-ft sticks with 10% for corners and cuts.",
      "Enter L × W (not just sq ft) to unlock the perimeter trim calculation.",
    ],
    faqs: [
      { q: "How much flooring waste should I add?", a: "5% for straight plank layouts, 10% for angled or irregular rooms, 15% for diagonal patterns." },
      { q: "How many boxes of LVP do I need for 300 sq ft?", a: "315 sq ft with 5% waste divided by 20 sq ft per box = 16 boxes, rounded up." },
      { q: "How do you calculate baseboard trim?", a: "Perimeter is 2 x (length + width); add 10% for corners and cuts, divide by 16-ft stick length, and round up." },
    ],
  },
  {
    id: "tile-grout-calculator",
    slug: "tile-grout-calculator",
    title: "Tile, Thinset & Grout Calculator",
    shortDescription:
      "Tile boxes, grout, and thinset for floors, showers, and backsplashes.",
    category: "finishes",
    subtrade: "Tile",
    tags: ["tile", "grout", "thinset", "backsplash", "shower", "mortar"],
    iconName: "Grid3x3",
    formulaSummary: "Tiles = area ÷ tile size × waste",
    inputsSummary: "Area + tile size",
    outputs: ["Tile boxes", "Thinset bags", "Grout bags", "Spacers"],
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Enter the area and tile size, pick grout joint and waste — boxes, thinset, and grout bags update live.",
    details: [
      "Tile boxes = ceil(waste-adjusted area ÷ sq ft per box). Thinset ≈ 1 bag (50 lb) per 50 sq ft with a ¼×⅜″ notch trowel.",
      "Grout weight uses the Mapei joint-volume formula Area × (L+W)/(L×W) × joint × thickness, with the density constant corrected to 7.9 lb/(ft²·in) for imperial units (the published 1.4 is kg/L, metric-only) — then rounded up to 25-lb bags.",
      "Joints ≥ ⅛″ want sanded grout; under ⅛″ go unsanded to avoid scratching tile faces.",
    ],
    faqs: [
      { q: "How many boxes of tile do I need for 150 sq ft?", a: "Add waste first (10% straight lay gives 165 sq ft), then divide by box coverage: 165 / 15 = 11 boxes." },
      { q: "How much thinset do I need per square foot?", a: "About one 50-lb bag per 50 sq ft with a 1/4 x 3/8-inch notch trowel." },
      { q: "Sanded or unsanded grout?", a: "Sanded grout for joints 1/8 inch and wider; unsanded under 1/8 inch to avoid scratching the tile face." },
    ],
  },

  /* ---------------- Site Work, Decks & Fencing ---------------- */
  {
    id: "excavation-dirt-haul",
    slug: "excavation-dirt-haul",
    title: "Trench, Excavation & Dirt Haul",
    shortDescription:
      "Bank vs. loose cubic yards with soil swell, plus heaped dump-truck loads for trenches and digs.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["dirt", "excavation", "fill", "truck", "grade", "cut", "trench", "swell", "haul", "basement"],
    iconName: "Shovel",
    formulaSummary: "Loose yd = bank yd × (1 + swell%)",
    inputsSummary: "L × W × D · soil · truck",
    outputs: ["Bank yards", "Loose yards", "Truckloads"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Bank cubic yards (L × W × D ÷ 27) is the in-situ volume you pay to dig; loose cubic yards add the swell factor — what you pay to haul.",
      "Common earth swells about 25%, sand/gravel 15%, and dense wet clay or rock 35%. Ignoring swell is the classic way to under-order trucks.",
      "Truckloads round up on heaped capacity: a 10-yd tandem legally hauls about 10 loose yards, so 47 loose yards needs 5 loads.",
    ],
    faqs: [
      { q: "How many cubic yards is a 60x2x3 ft trench?", a: "A 60x2x3 ft trench is 13.3 bank cubic yards (60 x 2 x 3 / 27). In common earth with 25% swell that's 16.7 loose yards — two 10-yard tandem loads." },
      { q: "What is soil swell in excavation?", a: "Swell is how much soil expands once dug: about 25% for common earth/clay, 15% for sand/gravel, 35% for dense wet clay or rock. You dig bank yards but haul loose yards." },
      { q: "How many yards of dirt fit in a dump truck?", a: "A tandem dump truck hauls about 10 cubic yards, a tri-axle about 14, and an end dump about 18 — measured in loose (swelled) yards, heaped." },
    ],
    howTo: "Pick the dig type, enter dimensions, set soil swell and truck size — bank yards, loose yards, and loads update live.",
  },
  {
    id: "retaining-wall-block",
    slug: "retaining-wall-block",
    title: "Retaining Wall Block & Geogrid Estimator",
    shortDescription:
      "SRW block courses, caps, drainage stone, base rock, and geogrid for segmental retaining walls.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["retaining wall", "srw", "block", "geogrid", "drainage", "cap", "segmental", "landscape wall"],
    iconName: "BrickWall",
    formulaSummary: "Blocks = courses × blocks/course → +waste",
    inputsSummary: "Length × exposed height",
    outputs: ["Wall blocks", "Cap units", "Drainage tons", "Geogrid sq ft"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Total height = exposed height + buried base courses (default 1). Courses round up: a 3.2 ft wall in 6-in block needs 7 courses.",
      "Drainage stone is a 12-in-wide column of ¾-in crushed stone behind the full exposed height at 1.4 tons per cubic yard, plus a 6×24-in crusher-run leveling pad under the first course.",
      "Walls over 4 ft exposed trigger geogrid: one layer every 2 courses, embedded 0.7 × wall height. Anything over 4 ft needs an engineer-stamped design in most jurisdictions.",
    ],
    faqs: [
      { q: "How many blocks for a 40 ft long, 3 ft high retaining wall?", a: "A 40x3 ft wall in 6x16 in block needs 7 courses (3 ft exposed + 1 buried 6-in course = 3.5 ft / 0.5 ft) × 30 blocks per course = 210, plus 5% waste = 221 blocks. Add 32 cap units." },
      { q: "When does a retaining wall need geogrid?", a: "Segmental walls over 4 ft of exposed height need geogrid reinforcement — typically one layer every 2 courses, embedded back 0.7 times the wall height. Most codes also require an engineered design above 4 ft." },
      { q: "How much drainage stone behind a retaining wall?", a: "Plan a 12-in-wide column of 3/4-in crushed stone behind the full exposed height: a 40x3 ft wall needs about 2.5 tons at 1.4 tons per cubic yard, plus base-pad rock." },
    ],
    howTo: "Enter length and exposed height, pick block face size — blocks, caps, drainage tons, and geogrid update live.",
  },
  {
    id: "asphalt-paving",
    slug: "asphalt-paving",
    title: "Asphalt Paving & Driveway Estimator",
    shortDescription:
      "Hot-mix asphalt tonnage and crushed aggregate base for driveways, lots, and pads.",
    category: "site-exterior",
    subtrade: "Paving",
    tags: ["asphalt", "paving", "driveway", "hot mix", "hma", "tons", "parking lot", "base"],
    iconName: "Layers",
    formulaSummary: "Tons = sq yd × 110 lbs × inches ÷ 2000",
    inputsSummary: "Area · asphalt + base depth",
    outputs: ["HMA tons", "Base tons", "Square yards"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Compacted hot-mix weighs about 145 lbs per cubic foot — 110 lbs per square yard per inch of thickness. A 600 sq ft driveway at 3 in needs about 11 tons with 5% waste.",
      "The aggregate sub-base uses crusher-run density (1.62 tons/cu yd) plus a 10% compaction allowance: 4 in for light duty, 6 in standard, 8 in heavy duty.",
      "Resurface work typically goes 2 in over existing pavement; new residential driveways want 3 in of asphalt over 6 in of base.",
    ],
    faqs: [
      { q: "How many tons of asphalt for a 50x12 ft driveway at 3 inches?", a: "A 50x12 ft driveway is 66.7 sq yd. At 3 in thick: 66.7 × 110 × 3 / 2000 = 11 tons, or about 11.6 tons with 5% waste. Add roughly 6.7 tons of 6-in aggregate base." },
      { q: "How thick should a residential asphalt driveway be?", a: "3 inches of compacted hot-mix over 6 inches of compacted crusher-run base is the standard for residential driveways. Resurfacing over sound pavement can go 2 inches." },
      { q: "How much does a ton of asphalt cover?", a: "One ton of hot-mix covers about 36 sq ft at 3 in thick (2000 / 110 / 3 × 9). At 2 in it covers about 54 sq ft per ton." },
    ],
    howTo: "Enter the paved area, pick asphalt and base thickness — HMA tons, base tons, and square yards update live.",
  },
  {
    id: "aggregate-stone-tonnage",
    slug: "aggregate-stone-tonnage",
    title: "Aggregate & Stone Tonnage Calculator",
    shortDescription:
      "Compacted tons of crushed stone, road base, sand, and decomposed granite from area and depth.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["gravel", "aggregate", "tonnage", "crushed stone", "base", "tons", "driveway", "sand", "57 stone", "crusher run"],
    iconName: "Mountain",
    formulaSummary: "Tons = compacted cu yd × density",
    inputsSummary: "Area × depth · material",
    outputs: ["Tons", "Loose vs compacted yards"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Loose cubic yards = area × (thickness ÷ 12) ÷ 27. The compaction allowance (10% gravel, 15% crusher run, 20% fines) converts that to the compacted yards you actually place.",
      "Multiply compacted yards by the material density: #57 stone ≈ 1.42 tons/yd, crusher run ≈ 1.62, mason sand ≈ 1.35, decomposed granite ≈ 1.55.",
      "Order tons round up to the half ton — quarries batch by the ton and short loads cost more per ton.",
    ],
    faqs: [
      { q: "How many tons of gravel for a 24x12 ft driveway at 4 inches?", a: "A 24x12 ft area at 4 in is 3.56 loose cubic yards. With 10% compaction that's 3.91 yards × 1.42 tons/yd = 5.5 tons of #57 stone, rounded up to 6 tons." },
      { q: "How many tons are in a cubic yard of crusher run?", a: "Dense graded crusher run weighs about 1.62 tons per cubic yard (≈120 lbs/cu ft). #57 gravel is lighter at 1.42, mason sand 1.35." },
      { q: "Do I add extra for compaction when ordering gravel?", a: "Yes — order compacted yards, not loose. Add 10% for gravel, 15% for crusher run/base, and 20% for decomposed granite or fines, which compact the most." },
    ],
    howTo: "Enter the area, set thickness, pick the material — tons, loose vs. compacted yards, and delivered cost update live.",
  },
  {
    id: "deck-joist-post",
    slug: "deck-joist-post",
    title: "Decking, Joist & Post Estimator",
    shortDescription:
      "Field joists, rim and ledger boards, decking planks, posts, concrete, and fasteners for residential decks.",
    category: "site-exterior",
    subtrade: "Decks",
    tags: ["deck", "boards", "joists", "composite", "ledger", "footings", "posts", "rim", "fasteners"],
    iconName: "Fence",
    formulaSummary: "Joists = ceil(W×12 ÷ spacing) + 1",
    inputsSummary: "Deck W × projection",
    outputs: ["Joists", "Decking planks", "Posts", "Concrete bags"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Field joists = ceiling(width in inches ÷ spacing) + 1 starter joist. Use 12 in O.C. for composite or diagonal decking, 16 in O.C. for standard wood.",
      "Rim and ledger boards = 2 × width + 2 × projection, converted to 16-ft stock lengths.",
      "Decking planks run across the projection: ceiling(projection in inches ÷ 5.75) × 1.10 — the 5.5 in face plus ¼ in gap, with 10% cut waste.",
      "Posts = (ceiling(width ÷ post spacing) + 1) × ceiling(projection ÷ post spacing), with 2 eighty-pound concrete bags per footing.",
    ],
    faqs: [
      { q: "How many joists for a 16x12 ft deck at 16 in O.C.?", a: "Ceil(192 ÷ 16) + 1 = 13 field joists, plus 4 rim/ledger boards in 16-ft stock (2×16 + 2×12 = 56 lin ft ÷ 16)." },
      { q: "How many deck boards for a 16x12 ft deck?", a: "Boards run across the 12-ft projection: ceil(144 ÷ 5.75) = 26 courses × 1.10 waste = 29 planks, each 16 ft long — about 464 lin ft of decking." },
      { q: "How many concrete bags per deck post footing?", a: "Two 80-lb bags per post is the standard for a 36-in-deep footing. A 6-post deck needs 12 bags." },
    ],
    howTo: "Enter deck width and projection, pick joist spacing and board type — joists, planks, posts, and concrete update live.",
  },
  {
    id: "fence-gate-estimator",
    slug: "fence-gate-estimator",
    title: "Wood & Chain-Link Fence Estimator",
    shortDescription:
      "Posts, rails, pickets or fabric rolls, gate kits, and fast-set concrete for wood and chain-link fences.",
    category: "site-exterior",
    subtrade: "Fencing",
    tags: ["fence", "pickets", "posts", "rails", "wood", "privacy", "concrete", "chain link", "gates"],
    iconName: "BrickWall",
    formulaSummary: "Pickets = L×12 ÷ (W + gap) → +10%",
    inputsSummary: "Fence run · height · type",
    outputs: ["Posts", "Rails", "Pickets / rolls", "Concrete bags"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Posts = ceiling(sections) + 1, plus 1 per single gate and 2 per double-drive gate. Every post hole takes 2 sixty-pound fast-set bags.",
      "Wood rails = sections × rails per section × 1.05 in 8-ft stock — 2 rails for 4-ft fence, 3 for 6-ft and up.",
      "Pickets = (linear feet × 12) ÷ (picket width + ¼ in gap) × 1.10 cut waste. Chain-link swaps pickets and rails for 50-ft fabric rolls.",
    ],
    faqs: [
      { q: "How many pickets for 150 ft of 6 ft wood privacy fence?", a: "With 5.5 in pickets: (150 × 12) ÷ 5.75 = 313 pickets × 1.10 waste = 345 pickets. Posts: ceil(150 ÷ 8) + 1 = 20, plus gate posts." },
      { q: "How many concrete bags per fence post?", a: "Two 60-lb fast-setting bags per hole is standard for 4x4 wood posts. A 20-post run needs 40 bags." },
      { q: "How many rolls of chain-link for 150 ft of fence?", a: "Chain-link fabric comes in 50-ft rolls — 150 ft needs 3 rolls, plus posts at 8–10 ft O.C. and a top rail." },
    ],
    howTo: "Pick wood or chain-link, enter the run and height, add gates — posts, rails, pickets, and concrete update live.",
  },
  {
    id: "paver-patio-sand",
    slug: "paver-patio-sand",
    title: "Interlocking Paver, Bedding & Polymeric Sand",
    shortDescription:
      "Paver units, crushed base tons, 1-in screed sand, and polymeric joint sand for patios and walkways.",
    category: "site-exterior",
    subtrade: "Hardscape",
    tags: ["paver", "patio", "base", "sand", "polymeric", "walkway", "bedding", "hardscape"],
    iconName: "LayoutGrid",
    formulaSummary: "Pavers = gross area ÷ paver size",
    inputsSummary: "Patio area · paver size",
    outputs: ["Paver units", "Base tons", "Poly sand bags"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Paver units = gross area (net × (1 + waste%)) ÷ paver face area. A 280 sq ft patio in 4×8 brick needs about 1,323 units at 5% waste.",
      "Compacted base = net area × (base depth ÷ 12) ÷ 27 × 1.6 tons/yd × 1.10 compaction — 4 in for walkways, 6 in for driveways.",
      "Bedding is a fixed 1-in screed sand bed per ICPI at 1.35 tons/yd. Polymeric sand: 1 fifty-pound bag per 75 sq ft of ⅛-in joints, 35 sq ft for wide ⅜-in joints.",
    ],
    faqs: [
      { q: "How many pavers for a 20x14 ft patio?", a: "280 sq ft at 5% waste = 294 gross sq ft. In 4×8 brick (0.222 sq ft each): 294 ÷ 0.222 = 1,323 pavers. Larger 12×12 slabs need only 294 units." },
      { q: "How much base rock under pavers?", a: "For a 280 sq ft patio at 4 in: 280 × (4/12) ÷ 27 = 3.46 cu yd × 1.6 tons/yd × 1.10 = 6.1 tons of crushed base, plus about 1.2 tons of 1-in bedding sand." },
      { q: "How much polymeric sand do I need?", a: "One 50-lb bag covers about 75 sq ft of ⅛-in joints or 35 sq ft of wide ⅜-in joints. A 294 sq ft patio with narrow joints needs 4 bags." },
    ],
    howTo: "Enter the patio area, pick paver size, base depth, and joint width — units, base tons, and sand bags update live.",
  },
  {
    id: "siding-housewrap",
    slug: "siding-housewrap",
    title: "Exterior Siding & Housewrap Estimator",
    shortDescription:
      "Siding squares, housewrap rolls, starter strips, and corner posts from perimeter, gables, and openings.",
    category: "site-exterior",
    subtrade: "Siding",
    tags: ["siding", "housewrap", "vinyl", "hardie", "fiber cement", "cladding", "squares", "tyvek"],
    iconName: "Layers",
    formulaSummary: "Squares = net area × (1+waste) ÷ 100",
    inputsSummary: "Perimeter × height · gables",
    outputs: ["Siding squares", "Housewrap rolls", "Starter strips"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Net cladding area = (perimeter × height) + gables (½ × base × peak) − openings: 15 sq ft per window, 120 per garage door, 21 per entry door.",
      "Siding squares = ceiling(net × (1 + waste%) ÷ 100). Use 10% waste, 15% for complex multi-gable layouts.",
      "Housewrap = ceiling(net × 1.15 ÷ 900) — 9×100-ft rolls with 6-in overlaps. Starter strips = ceiling(perimeter ÷ 10) in 10-ft pieces.",
    ],
    faqs: [
      { q: "How many squares of siding for a 160 ft perimeter, 9 ft walls?", a: "Walls = 1,440 sq ft, plus 2 gables (½ × 24 × 6 = 144) = 1,584, minus ~312 sq ft of openings = 1,272 net. At 10% waste: 14 squares." },
      { q: "How many rolls of housewrap for a house?", a: "A 1,272 sq ft net wall needs ceil(1,272 × 1.15 ÷ 900) = 2 rolls of 9×100-ft housewrap, allowing for 6-in overlaps." },
      { q: "How do you calculate siding waste?", a: "10% covers cuts and starter waste on simple rectangles. Bump to 15% for multi-gable or highly cut-up elevations with lots of windows." },
    ],
    howTo: "Enter perimeter, height, gables, and openings — siding squares, housewrap rolls, and trim update live.",
  },

  /* ---------------- MEP Quick-Check Estimators ---------------- */
  {
    id: "conduit-fill-voltage-drop",
    slug: "conduit-fill-voltage-drop",
    title: "Conduit Fill & Voltage Drop Sizer",
    shortDescription:
      "NEC raceway fill checks and voltage-drop sizing for branch circuits.",
    category: "mep",
    subtrade: "Electrical",
    tags: ["wire", "electrical", "conduit", "romex", "thhn", "circuit", "run"],
    iconName: "Zap",
    formulaSummary: "Ft = run × conductors × 1.1",
    inputsSummary: "Run length + conductors",
    outputs: ["NEC fill %", "Voltage drop %", "Recommended size"],
    badge: "NEC Reference",
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Pick conduit fill or voltage drop mode, enter the circuit — the sizer flags NEC violations live.",
    details: [
      "NEC Chapter 9 Table 1: 53% fill for 1 wire, 31% for 2 wires, 40% for 3+ wires. Overfill is a code violation.",
      "Voltage drop = 2 × K × I × L ÷ circular mils (√3 factor for 3-phase). NEC recommends ≤ 3% on branch circuits.",
      "Recommendations pick the smallest stock conduit / wire gauge that clears the limit.",
    ],
    faqs: [
      { q: "What is the maximum conduit fill per NEC?", a: "NEC Chapter 9 Table 1 allows 53% fill for a single wire, 31% for two wires, and 40% for three or more wires." },
      { q: "What is the maximum voltage drop allowed?", a: "The NEC recommends a maximum 3% drop on branch circuits (5% total for feeder plus branch) as a fine print note." },
      { q: "How do you calculate voltage drop?", a: "Single-phase: Vd = 2 x K x I x L / circular mils, where K is 12.9 for copper or 21.2 for aluminum. Use the square root of 3 instead of 2 for three-phase." },
    ],
  },
  {
    id: "hvac-btu-tonnage",
    slug: "hvac-btu-tonnage",
    title: "HVAC BTU Load & AC Tonnage Sizer",
    shortDescription:
      "Heating/cooling BTU loads, condenser tonnage, and CFM from area, climate zone, and insulation quality.",
    category: "mep",
    subtrade: "HVAC",
    tags: ["hvac", "btu", "tonnage", "ac", "heating", "sizing", "furnace", "cfm", "manual j", "climate zone"],
    iconName: "Thermometer",
    formulaSummary: "BTU = sq ft × zone factor → ½-ton rounds",
    inputsSummary: "Sq ft + climate zone",
    outputs: ["Cooling BTU", "AC tons", "Heating BTU", "CFM"],
    badge: "Quick Takeoff",
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Base cooling = floor area × zone factor × (ceiling height ÷ 8): 32.5 BTU/sq ft for hot/humid zones 1–2, 27.5 for moderate zones 3–4, 22 for cold zones 5–7.",
      "Adjustments: poor insulation +20%, high-efficiency −15%; heavy sun +10%, shaded −10%; plus 400 BTU per occupant above 2.",
      "Tonnage rounds UP to the nearest half ton (12,000 BTU = 1 ton) and airflow runs ≈400 CFM per ton. These are bid-scoping rules of thumb — confirm with an ACCA Manual J.",
    ],
    faqs: [
      { q: "How many tons of AC for an 1800 sq ft house?", a: "In a moderate climate (27.5 BTU/sq ft): 1,800 × 27.5 = 49,500 BTU/hr base. With average insulation and 4 occupants that's about 50,300 BTU/hr → 4.5 tons (rounded up to the half ton)." },
      { q: "How many BTU per square foot for air conditioning?", a: "Rule of thumb: 30–35 BTU/sq ft in hot/humid climates, 25–30 in moderate zones. Heating-dominant northern zones size furnaces at 45–50 BTU/sq ft." },
      { q: "How much CFM per ton of AC?", a: "About 400 CFM per ton — a 3-ton system needs roughly 1,200 CFM of airflow. Undersized ductwork is the most common cause of poor cooling." },
    ],
    howTo: "Enter floor area and ceiling height, pick climate zone, insulation, and sun exposure — BTU loads, tonnage, and CFM update live.",
  },
  {
    id: "recessed-lights",
    slug: "recessed-lights",
    title: "Recessed Light Layout",
    shortDescription:
      "Fixture counts and spacing grids for even can-light layouts.",
    category: "mep",
    subtrade: "Electrical",
    tags: ["recessed", "can lights", "layout", "spacing", "downlight", "led"],
    iconName: "Lightbulb",
    formulaSummary: "Rows = W ÷ spacing, Cols = L ÷ spacing",
    inputsSummary: "Room L × W",
    outputs: ["Fixture count", "Spacing grid"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "pex-pipe-plumbing",
    slug: "pex-pipe-plumbing",
    title: "PEX Pipe Runs & WSFU Sizer",
    shortDescription:
      "PEX coil footage, manifold ports, fittings, and IPC fixture-unit main sizing for residential plumbing.",
    category: "mep",
    subtrade: "Plumbing",
    tags: ["pipe", "plumbing", "pex", "fittings", "manifold", "wsfu", "fixture units", "water supply"],
    iconName: "Pipette",
    formulaSummary: "WSFU sum → ¾″ or 1″ main",
    inputsSummary: "Fixture counts + run",
    outputs: ["PEX coils", "Main size", "Fitting packs"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "IPC water supply fixture units: full bath 3.5, half bath 1.5, kitchen 2.0, laundry 2.0, hose bibb 2.5. At or under 14 WSFU a ¾-in main suffices; above that, step up to 1-in.",
      "½-in PEX footage = connections × average run × 1.15 slack — toilets and hose bibbs pull cold only, dishwashers hot only.",
      "Home-run systems get dedicated manifold ports per connection; trunk-and-branch doubles the main trunk allowance.",
    ],
    faqs: [
      { q: "What size PEX main do I need for a 2-bath house?", a: "2 full baths (7.0) + 1 half bath (1.5) + kitchen (2.0) + laundry (2.0) + 2 hose bibbs (5.0) = 17.5 WSFU — over 14, so run a 1-in main supply." },
      { q: "How much PEX per fixture?", a: "Count hot and cold connections per fixture, multiply by the average run from the manifold, and add 15% for snaking and slack. A typical 2-bath home-run needs about 9 hundred-foot coils." },
      { q: "Home run vs trunk and branch PEX?", a: "Home run gives each fixture a dedicated ½-in line back to a central manifold (best pressure, more tubing). Trunk and branch runs a ¾-in main through the house with short ½-in branches (less tubing, more fittings)." },
    ],
    howTo: "Pick home-run or trunk-and-branch, count fixtures, set run distance — WSFU, main size, coils, and fittings update live.",
  },
  {
    id: "insulation-batt-roll",
    slug: "insulation-batt-roll",
    title: "Insulation Batt, Cellulose & R-Value Sizer",
    shortDescription:
      "Batt bundles or blown cellulose bags from target R-value, with framing deductions and installed thickness.",
    category: "finishes",
    subtrade: "Insulation",
    tags: ["insulation", "batt", "cellulose", "r-value", "attic", "blown in", "fiberglass"],
    iconName: "Layers",
    formulaSummary: "Bags = net area × 1.05 ÷ coverage",
    inputsSummary: "Area · R-value · type",
    outputs: ["Bags / bundles", "Thickness", "Net area"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Wall cavity area deducts 10% for framing; attics and crawlspaces count full area. Batt bundle coverage runs ~125 sq ft/bag at R-13 down to ~32 sq ft/bag at R-49.",
      "Blown cellulose: about 0.82 bags per 1,000 sq ft per R point — R-38 takes ~31 bags/1,000 sq ft at 13 in settled, R-49 ~41 bags at 17 in.",
      "Framing spacing picks batt width: 15-in batts for 16 in O.C., 23-in for 24 in O.C.",
    ],
    faqs: [
      { q: "How many bags of insulation for a 1200 sq ft attic at R-38?", a: "Attic blown cellulose at R-38: (1,200 ÷ 1,000) × 31 × 1.05 ≈ 40 bags of 30-lb cellulose, settling to about 13 in thick." },
      { q: "How many batts for R-19 walls?", a: "R-19 batt bundles cover about 88 sq ft each. A 1,000 sq ft wall (900 net after framing) needs ceil(900 × 1.05 ÷ 88) = 11 bundles." },
      { q: "What R-value for attic insulation?", a: "DOE recommends R-38 to R-49 for attics in most US climate zones (R-30 minimum in hot zones 1–2). Walls: R-13 to R-15 in 2×4, R-19 to R-21 in 2×6." },
    ],
    howTo: "Pick the application and insulation type, enter area, set the target R-value — bags, thickness, and net area update live.",
  },
  {
    id: "baseboard-crown-molding",
    slug: "baseboard-crown-molding",
    title: "Crown Molding, Baseboard & Miter Cut Estimator",
    shortDescription:
      "Trim boards, miter and scarf cut counts, and caulk tubes from room perimeter and corners.",
    category: "finishes",
    subtrade: "Trim & Millwork",
    tags: ["trim", "baseboard", "crown molding", "miter", "caulk", "millwork", "chair rail"],
    iconName: "Ruler",
    formulaSummary: "Boards = gross LF ÷ stock length",
    inputsSummary: "Perimeter · corners",
    outputs: ["Trim boards", "Cut count", "Caulk tubes"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Boards = ceiling(perimeter × (1 + waste%) ÷ stock length). Crown defaults to 15% waste for compound-miter miscuts; baseboard 10%.",
      "Each corner needs 2 miter cuts; wall runs longer than one stock board add scarf joints (2 bevel cuts each).",
      "One 10-oz caulk tube seals about 75 linear feet of trim, top and bottom edges.",
    ],
    faqs: [
      { q: "How much baseboard for a 14x10 ft room?", a: "Perimeter = 48 lin ft × 1.10 waste = 52.8 ft → ceil(52.8 ÷ 16) = 4 sixteen-foot boards, plus 1 tube of caulk." },
      { q: "How many miter cuts for crown molding in a square room?", a: "4 inside corners × 2 cuts = 8 miters, plus scarf joints wherever a wall run exceeds your stock length (2 cuts each)." },
      { q: "How much caulk for trim?", a: "One 10-oz tube of painter's caulk covers about 75 linear feet of moulding, sealing both the top and bottom edges." },
    ],
    howTo: "Enter the room size, corners, and stock length — boards, cut counts, and caulk tubes update live.",
  },
  {
    id: "ceiling-texture-drywall",
    slug: "ceiling-texture-drywall",
    title: "Ceiling Texture, Popcorn & Drywall Mud Sizer",
    shortDescription:
      "Texture bags or mud buckets, PVA primer gallons, and mixing water for every drywall finish level.",
    category: "finishes",
    subtrade: "Drywall",
    tags: ["drywall", "texture", "popcorn", "knockdown", "mud", "skim coat", "primer", "pva"],
    iconName: "Paintbrush",
    formulaSummary: "Units = area × 1.10 ÷ coverage",
    inputsSummary: "Area · style · depth",
    outputs: ["Bags / buckets", "Primer gal", "Mix water"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Medium-depth coverage: knockdown/orange peel ≈ 550 sq ft per 50-lb bag, popcorn ≈ 350 sq ft per 40-lb bag, Level 5 skim ≈ 375 sq ft per 4.5-gal bucket — all with 10% waste.",
      "Light application stretches coverage ~25%; heavy cuts it ~20%.",
      "PVA primer seals at 350 sq ft per gallon. Dry-mix bags need about 5 gallons of mixing water each; premixed buckets need none.",
    ],
    faqs: [
      { q: "How much knockdown texture for a 900 sq ft ceiling?", a: "At medium depth: ceil(900 × 1.10 ÷ 550) = 2 fifty-pound bags, plus ceil(900 ÷ 350) = 3 gallons of PVA primer and 10 gallons of mixing water." },
      { q: "How much joint compound for a Level 5 skim coat?", a: "A 4.5-gallon bucket covers about 375 sq ft at medium depth. A 900 sq ft area needs ceil(990 ÷ 375) = 3 buckets with 10% waste." },
      { q: "How much primer over new drywall texture?", a: "PVA drywall primer covers about 350 sq ft per gallon to seal raw drywall and texture before topcoat — always prime before painting." },
    ],
    howTo: "Enter the surface area, pick texture style and depth — bags or buckets, primer gallons, and mixing water update live.",
  },

  /* ---------------- Bidding, Markup & Financials ---------------- */
  {
    id: "contractor-markup-margin",
    slug: "contractor-markup-margin",
    title: "Markup vs. Margin Calculator",
    shortDescription:
      "Convert markup to margin and set bid prices that actually profit.",
    category: "financial-business",
    subtrade: "Pricing",
    tags: ["markup", "margin", "profit", "bid price", "overhead", "percent"],
    iconName: "Percent",
    formulaSummary: "Price = cost ÷ (1 − margin)",
    inputsSummary: "Cost + markup/margin",
    outputs: ["Bid price", "Margin %", "Markup %", "Net profit"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter direct job costs and a target margin or markup — the bid price, equivalents, and true net profit solve live.",
    details: [
      "Margin is profit ÷ price; markup is profit ÷ cost. A 30% markup is only a 23% margin — the #1 pricing mistake in contracting.",
      "Bid from margin: price = cost ÷ (1 − margin). Bid from markup: price = cost × (1 + markup).",
      "Net true profit = gross profit − overhead recovery. One click applies the markup to your Master Bid.",
    ],
    faqs: [
      { q: "What is the difference between markup and margin?", a: "Markup is profit divided by cost; margin is profit divided by price. A 30% markup equals only a 23.1% margin - confusing the two is the most common pricing mistake in contracting." },
      { q: "How do you price a job from a target margin?", a: "Bid price = direct cost / (1 - margin). For $18,600 in costs at 25% margin: $18,600 / 0.75 = $24,800." },
      { q: "What overhead percentage should a contractor use?", a: "10 to 15% is typical for small residential contractors. The calculator defaults to 10% and subtracts it from gross profit to show true net profit." },
    ],
  },
  {
    id: "overhead-recovery",
    slug: "overhead-recovery",
    title: "Overhead Recovery Rate",
    shortDescription:
      "Your true hourly overhead and the billable rate that covers it.",
    category: "financial-business",
    subtrade: "Overhead",
    tags: ["overhead", "hourly rate", "burden", "labor rate", "billable"],
    iconName: "Gauge",
    formulaSummary: "Rate = overhead ÷ billable hrs",
    inputsSummary: "Annual overhead + hours",
    outputs: ["Hourly overhead", "Billable rate"],
    estimatedTime: "< 2 min",
    available: false,
  },
  {
    id: "break-even",
    slug: "break-even",
    title: "Break-Even Calculator",
    shortDescription:
      "The revenue and job count you need before the business profits.",
    category: "financial-business",
    subtrade: "Bidding",
    tags: ["break even", "profit", "costs", "jobs per year", "revenue"],
    iconName: "Scale",
    formulaSummary: "BE = fixed costs ÷ margin",
    inputsSummary: "Fixed costs + margin",
    outputs: ["Break-even revenue", "Jobs needed"],
    estimatedTime: "< 2 min",
    available: false,
  },
  {
    id: "change-order",
    slug: "change-order",
    title: "Change Order Pricer",
    shortDescription:
      "Price extras and change orders with margin protection built in.",
    category: "financial-business",
    subtrade: "Bidding",
    tags: ["change order", "extras", "co", "pricing", "margin"],
    iconName: "FilePlus2",
    formulaSummary: "CO price = cost × (1 + markup)",
    inputsSummary: "CO cost + markup",
    outputs: ["CO price", "Margin check"],
    estimatedTime: "< 1 min",
    available: false,
  },

  /* ---------------- Field Converters & Master Proposal ---------------- */
  {
    id: "fraction-converter",
    slug: "fraction-converter",
    title: "Feet-Inches-Fraction Converter",
    shortDescription:
      "Decimals ↔ architectural fractions in both directions, to 1/16\".",
    category: "utilities",
    subtrade: "Converters",
    tags: ["fraction", "converter", "tape measure", "decimal", "inches", "feet"],
    iconName: "Sigma",
    formulaSummary: "0.28125 ft ↔ 3-3/8\"",
    inputsSummary: "Decimal or fraction",
    outputs: ["Fraction string", "Decimal feet"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "unit-converter",
    slug: "unit-converter",
    title: "Construction Unit Converter",
    shortDescription:
      "Length, area, and volume conversions: sq ft, squares, cu yd, metric.",
    category: "utilities",
    subtrade: "Converters",
    tags: ["convert", "units", "sqft", "cuyd", "metric", "area", "volume", "squares"],
    iconName: "ArrowLeftRight",
    formulaSummary: "1 cu yd = 27 cu ft",
    inputsSummary: "Value + units",
    outputs: ["Converted values"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "right-triangle",
    slug: "right-triangle",
    title: "Right Triangle & 3-4-5",
    shortDescription:
      "Solve any right triangle: hypotenuses, angles, and square checks.",
    category: "utilities",
    subtrade: "Layout Math",
    tags: ["triangle", "3-4-5", "square", "diagonal", "pythagorean", "layout"],
    iconName: "Triangle",
    formulaSummary: "c = √(a² + b²)",
    inputsSummary: "Two sides",
    outputs: ["Hypotenuse", "Angles"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "proposal-builder",
    slug: "proposal-builder",
    title: "Master Proposal Builder",
    shortDescription:
      "Assemble your bid cart into a client-ready proposal summary.",
    category: "utilities",
    subtrade: "Proposal",
    tags: ["proposal", "bid", "quote", "client", "master estimate", "summary"],
    iconName: "FileSpreadsheet",
    formulaSummary: "Proposal = Σ lines + markup/tax",
    inputsSummary: "Bid cart lines",
    outputs: ["Proposal summary", "Line items"],
    badge: "New",
    estimatedTime: "< 2 min",
    available: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Lookups                                                            */
/* ------------------------------------------------------------------ */

export function getToolBySlug(slug: string): ToolMetadata | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolById(id: string): ToolMetadata | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function toolsByCategory(category: Category): ToolMetadata[] {
  return TOOLS.filter((t) => t.category === category);
}

export function liveToolsByCategory(category: Category): ToolMetadata[] {
  return TOOLS.filter((t) => t.category === category && t.available);
}

export function relatedTools(tool: ToolMetadata, limit = 4): ToolMetadata[] {
  return TOOLS.filter((t) => t.category === tool.category && t.id !== tool.id).slice(
    0,
    limit,
  );
}

/** Route for a tool: /tools/[slug] */
export function toolHref(tool: Pick<ToolMetadata, "slug">): string {
  return `/tools/${tool.slug}`;
}

/** Route for a category hub: /categories/[category] */
export function categoryHref(category: Category): string {
  return `/categories/${category}`;
}

/** Simple includes-based search (the command menu layers fuzzy scoring on top). */
export function searchTools(query: string): ToolMetadata[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((t) =>
    [t.title, t.shortDescription, t.formulaSummary, getCategory(t.category).label, ...t.tags]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export const TOTAL_TOOLS = TOOLS.length;
export const LIVE_TOOLS = TOOLS.filter((t) => t.available).length;
