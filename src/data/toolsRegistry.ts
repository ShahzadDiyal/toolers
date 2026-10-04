/**
 * BuildCalc Pro — Central Tool Registry (Phase 2).
 *
 * THE single source of truth for categories and calculators. Everything
 * downstream renders from here: navbar menus, the ⌘K command menu, the
 * homepage dashboard, /tools, /categories hubs, and tool pages.
 *
 * To ship a Phase 3/4 tool: add a ToolMetadata entry below with
 * `available: true`, build the calculator inside <CalculationCard>, and add
 * the route component at src/app/tools/[slug]/page.tsx. Nothing else changes.
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
    outputs: ["Cubic yards", "Truckloads", "Bags"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "rebar-estimator",
    slug: "rebar-estimator",
    title: "Rebar & Mesh Estimator",
    shortDescription:
      "Bar counts, spacing grids, and lap lengths for slabs and footings.",
    category: "concrete",
    subtrade: "Reinforcement",
    tags: ["rebar", "mesh", "spacing", "laps", "steel", "grid", "wire mesh"],
    iconName: "Grid3x3",
    formulaSummary: "Bars = span ÷ spacing + 1",
    outputs: ["Bar count", "Linear feet", "Lap lengths"],
    badge: "IRC Code Compliant",
    estimatedTime: "< 2 min",
    available: false,
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
    outputs: ["Cubic yards", "Bags per pier"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "concrete-block",
    slug: "concrete-block",
    title: "Block & Mortar Estimator",
    shortDescription:
      "CMU count, mortar bags, and grout for block walls.",
    category: "concrete",
    subtrade: "Masonry",
    tags: ["cmu", "cinder", "mortar", "wall", "block", "grout"],
    iconName: "BrickWall",
    formulaSummary: "Blocks = wall sq ft ÷ 0.89",
    outputs: ["Block count", "Mortar bags", "Grout yards"],
    estimatedTime: "< 2 min",
    available: false,
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
    outputs: ["Roofing squares", "Bundles", "Underlayment rolls"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: false,
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
    outputs: ["Riser count", "Tread depth", "Stringer cut length"],
    badge: "IRC Code Compliant",
    estimatedTime: "< 2 min",
    available: false,
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
    outputs: ["Stud count", "Plates", "Headers"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "rafter-length",
    slug: "rafter-length",
    title: "Common Rafter Length",
    shortDescription:
      "True rafter length and ridge height from span and pitch — no tables.",
    category: "framing-roofing",
    subtrade: "Roofing",
    tags: ["rafter", "pitch", "ridge", "span", "birdsmouth", "plumb cut"],
    iconName: "Triangle",
    formulaSummary: "L = run × √(1 + (rise/12)²)",
    outputs: ["Rafter length", "Ridge height"],
    estimatedTime: "< 1 min",
    available: false,
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
    outputs: ["Board feet", "Piece count"],
    estimatedTime: "< 1 min",
    available: false,
  },

  /* ---------------- Drywall, Tile & Finishes ---------------- */
  {
    id: "framing-drywall-pack",
    slug: "framing-drywall-pack",
    title: "Drywall Pack Estimator",
    shortDescription:
      "Sheets, joint compound, tape, and screws for full-room drywall packs.",
    category: "finishes",
    subtrade: "Drywall",
    tags: ["drywall", "sheetrock", "sheets", "mud", "tape", "screws", "pack"],
    iconName: "Square",
    formulaSummary: "Sheets = area ÷ 32 (4×8)",
    outputs: ["Sheet count", "Joint compound", "Tape & screws"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "paint-coverage",
    slug: "paint-coverage",
    title: "Paint Coverage Calculator",
    shortDescription:
      "Gallons for walls and ceilings with doors and windows deducted.",
    category: "finishes",
    subtrade: "Paint",
    tags: ["paint", "gallons", "coverage", "primer", "walls", "ceiling", "coats"],
    iconName: "Paintbrush",
    formulaSummary: "Gal = net area ÷ 350",
    outputs: ["Gallons", "Primer gallons", "Coats"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "flooring-estimator",
    slug: "flooring-estimator",
    title: "Flooring Estimator",
    shortDescription:
      "Boxes of LVP, laminate, or hardwood with layout waste included.",
    category: "finishes",
    subtrade: "Flooring",
    tags: ["floor", "lvp", "laminate", "hardwood", "boxes", "waste", "plank"],
    iconName: "LayoutGrid",
    formulaSummary: "Boxes = area × waste ÷ box size",
    outputs: ["Boxes", "Sq ft + waste"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "tile-layout",
    slug: "tile-layout",
    title: "Tile & Grout Estimator",
    shortDescription:
      "Tile boxes, grout, and thinset for floors, showers, and backsplashes.",
    category: "finishes",
    subtrade: "Tile",
    tags: ["tile", "grout", "thinset", "backsplash", "shower", "mortar"],
    iconName: "Grid3x3",
    formulaSummary: "Tiles = area ÷ tile size × waste",
    outputs: ["Tile boxes", "Grout bags", "Thinset bags"],
    estimatedTime: "< 2 min",
    available: false,
  },

  /* ---------------- Site Work, Decks & Fencing ---------------- */
  {
    id: "excavation-fill",
    slug: "excavation-fill",
    title: "Excavation & Fill",
    shortDescription:
      "Cut/fill cubic yards and truckloads for grading and trenches.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["dirt", "excavation", "fill", "truck", "grade", "cut", "trench"],
    iconName: "Shovel",
    formulaSummary: "V = L × W × D ÷ 27",
    outputs: ["Cubic yards", "Truckloads"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "gravel-aggregate",
    slug: "gravel-aggregate",
    title: "Gravel & Aggregate Tonnage",
    shortDescription:
      "Tons of crushed stone, base, and gravel from area and depth.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["gravel", "aggregate", "tonnage", "crushed stone", "base", "tons", "driveway"],
    iconName: "Mountain",
    formulaSummary: "Tons = cu yd × 1.4",
    outputs: ["Tons", "Cubic yards"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "deck-material",
    slug: "deck-material",
    title: "Deck Boards & Framing",
    shortDescription:
      "Deck boards, joists, and fasteners for wood and composite decks.",
    category: "site-exterior",
    subtrade: "Decks",
    tags: ["deck", "boards", "joists", "composite", "ledger", "footings"],
    iconName: "Fence",
    formulaSummary: "Boards = deck L ÷ (board W + gap)",
    outputs: ["Deck boards", "Joists", "Fasteners"],
    estimatedTime: "< 2 min",
    available: false,
  },
  {
    id: "fence-estimator",
    slug: "fence-estimator",
    title: "Fence Material Estimator",
    shortDescription:
      "Pickets, posts, rails, and concrete for wood privacy fences.",
    category: "site-exterior",
    subtrade: "Fencing",
    tags: ["fence", "pickets", "posts", "rails", "wood", "privacy", "concrete"],
    iconName: "BrickWall",
    formulaSummary: "Pickets = L × 12 ÷ (W + gap)",
    outputs: ["Pickets", "Posts", "Rails", "Concrete bags"],
    estimatedTime: "< 2 min",
    available: false,
  },
  {
    id: "paver-estimator",
    slug: "paver-estimator",
    title: "Paver & Base Estimator",
    shortDescription:
      "Pavers, base tons, and sand for patios and walkways.",
    category: "site-exterior",
    subtrade: "Hardscape",
    tags: ["paver", "patio", "base", "sand", "polymeric", "walkway"],
    iconName: "LayoutGrid",
    formulaSummary: "Pavers = area ÷ paver size",
    outputs: ["Pavers", "Base tons", "Sand bags"],
    estimatedTime: "< 2 min",
    available: false,
  },

  /* ---------------- MEP Quick-Check Estimators ---------------- */
  {
    id: "wire-conduit",
    slug: "wire-conduit",
    title: "Wire & Conduit Estimator",
    shortDescription:
      "Conductor footage and conduit lengths for branch-circuit runs.",
    category: "mep",
    subtrade: "Electrical",
    tags: ["wire", "electrical", "conduit", "romex", "thhn", "circuit", "run"],
    iconName: "Zap",
    formulaSummary: "Ft = run × conductors × 1.1",
    outputs: ["Conductor feet", "Conduit length"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "btu-sizing",
    slug: "btu-sizing",
    title: "HVAC BTU Sizing Check",
    shortDescription:
      "Rule-of-thumb tonnage from square footage and climate zone.",
    category: "mep",
    subtrade: "HVAC",
    tags: ["hvac", "btu", "tonnage", "ac", "heating", "sizing", "furnace"],
    iconName: "Thermometer",
    formulaSummary: "BTU ≈ sq ft × 25 (zone-adj)",
    outputs: ["BTUs", "Tonnage"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: false,
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
    outputs: ["Fixture count", "Spacing grid"],
    estimatedTime: "< 1 min",
    available: false,
  },
  {
    id: "pipe-run",
    slug: "pipe-run",
    title: "Pipe Run Estimator",
    shortDescription:
      "Pipe footage and fitting counts for PEX and copper runs.",
    category: "mep",
    subtrade: "Plumbing",
    tags: ["pipe", "plumbing", "pex", "copper", "fittings", "run", "elbows"],
    iconName: "Pipette",
    formulaSummary: "Ft = run × 1.1 + fittings",
    outputs: ["Pipe feet", "Fitting count"],
    estimatedTime: "< 1 min",
    available: false,
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
    outputs: ["Bid price", "Margin %", "Markup %"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: false,
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
