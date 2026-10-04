/**
 * BuildCalc Pro — Tool registry.
 *
 * Phase 2 (directory + category pages + Cmd+K) reads from here. Each entry
 * declares its route, icon, and whether the calculator page exists yet.
 * Add new tools here — everything else (navbar categories, command palette,
 * home grid) renders automatically.
 */
import type { Category, ToolMetadata } from "@/types/estimator";

export const TOOL_CATEGORIES: Category[] = [
  "concrete",
  "framing-roofing",
  "finishes",
  "site-exterior",
  "mep",
  "financial-business",
  "utilities",
];

/** Route for a tool: /tools/[category]/[slug] */
export function toolHref(tool: Pick<ToolMetadata, "category" | "slug">): string {
  return `/tools/${tool.category}/${tool.slug}`;
}

export const TOOLS: ToolMetadata[] = [
  // ---- Concrete & Masonry ----
  {
    id: "concrete-slab",
    slug: "concrete-slab",
    title: "Concrete Slab Calculator",
    shortDescription:
      "Cubic yards, 80/60-lb bags, and rebar grid for slabs, footings, and pads.",
    category: "concrete",
    tags: ["slab", "cubic yards", "footing", "bags", "ready mix", "pad"],
    iconName: "Layers",
    formulaSummary: "V = L × W × D ÷ 27 → +waste",
    available: true,
    readTimeMinutes: 2,
  },
  {
    id: "concrete-column",
    slug: "concrete-column",
    title: "Concrete Column / Sonotube",
    shortDescription: "Yards and bags for round piers, columns, and footings.",
    category: "concrete",
    tags: ["pier", "sonotube", "column", "round", "footing"],
    iconName: "Cylinder",
    formulaSummary: "V = π r² h ÷ 27 → +waste",
    available: false,
  },
  {
    id: "concrete-block",
    slug: "concrete-block",
    title: "Block & Mortar Estimator",
    shortDescription: "CMU count, mortar bags, and grout for block walls.",
    category: "concrete",
    tags: ["cmu", "cinder", "mortar", "wall"],
    iconName: "BrickWall",
    formulaSummary: "Blocks = wall sq ft ÷ 0.89",
    available: false,
  },

  // ---- Framing & Roofing ----
  {
    id: "stud-wall",
    slug: "stud-wall",
    title: "Stud Wall Framing",
    shortDescription: "Studs at 16\" or 24\" O.C. plus plates and headers.",
    category: "framing-roofing",
    tags: ["stud", "wall", "lumber", "16 oc", "24 oc", "plates"],
    iconName: "Ruler",
    formulaSummary: "Studs = L ÷ spacing + 1",
    available: false,
  },
  {
    id: "roofing",
    slug: "roofing",
    title: "Roofing Squares Calculator",
    shortDescription: "Pitch-adjusted squares, bundles, and underlayment.",
    category: "framing-roofing",
    tags: ["roof", "shingle", "squares", "pitch", "bundles"],
    iconName: "House",
    formulaSummary: "Area × pitch factor ÷ 100",
    available: false,
  },
  {
    id: "rafter",
    slug: "rafter",
    title: "Common Rafter Length",
    shortDescription: "True rafter length from span and pitch — no tables.",
    category: "framing-roofing",
    tags: ["rafter", "pitch", "ridge", "span", "birdsmouth"],
    iconName: "Triangle",
    formulaSummary: "L = run × √(1 + (rise/12)²)",
    available: false,
  },

  // ---- Finishes ----
  {
    id: "drywall",
    slug: "drywall",
    title: "Drywall Sheet Estimator",
    shortDescription: "4×8 / 4×12 sheets, screws, and joint compound.",
    category: "finishes",
    tags: ["drywall", "sheetrock", "sheets", "mud", "tape"],
    iconName: "Square",
    formulaSummary: "Sheets = area ÷ 32 (4×8)",
    available: false,
  },
  {
    id: "paint",
    slug: "paint",
    title: "Paint Coverage Calculator",
    shortDescription: "Gallons for walls and ceilings minus openings.",
    category: "finishes",
    tags: ["paint", "gallons", "coverage", "primer", "walls"],
    iconName: "Paintbrush",
    formulaSummary: "Gal = net area ÷ 350",
    available: false,
  },
  {
    id: "flooring",
    slug: "flooring",
    title: "Flooring Estimator",
    shortDescription: "Boxes of LVP, laminate, or tile with layout waste.",
    category: "finishes",
    tags: ["floor", "tile", "lvp", "laminate", "boxes"],
    iconName: "LayoutGrid",
    formulaSummary: "Boxes = area × waste ÷ box size",
    available: false,
  },

  // ---- Site & Exterior ----
  {
    id: "excavation",
    slug: "excavation",
    title: "Excavation & Fill",
    shortDescription: "Cut/fill cubic yards and truck loads.",
    category: "site-exterior",
    tags: ["dirt", "excavation", "fill", "truck", "grade"],
    iconName: "Shovel",
    formulaSummary: "V = L × W × D ÷ 27",
    available: false,
  },
  {
    id: "fencing",
    slug: "fencing",
    title: "Fence Material Estimator",
    shortDescription: "Pickets, posts, and rails for wood fences.",
    category: "site-exterior",
    tags: ["fence", "pickets", "posts", "wood"],
    iconName: "Fence",
    formulaSummary: "Pickets = L × 12 ÷ (width + gap)",
    available: false,
  },

  // ---- MEP ----
  {
    id: "wire",
    slug: "wire",
    title: "Wire & Conduit Runs",
    shortDescription: "Conductor footage with derating-aware spares.",
    category: "mep",
    tags: ["wire", "electrical", "conduit", "romex", "thhn"],
    iconName: "Zap",
    formulaSummary: "Ft = run × conductors × 1.1",
    available: false,
  },
  {
    id: "btu",
    slug: "btu",
    title: "HVAC BTU Sizing",
    shortDescription: "Rule-of-thumb tonnage from square footage and climate.",
    category: "mep",
    tags: ["hvac", "btu", "tonnage", "ac", "heating"],
    iconName: "Thermometer",
    formulaSummary: "BTU ≈ sq ft × 25 (zone-adjusted)",
    available: false,
  },

  // ---- Financial & Business ----
  {
    id: "markup-margin",
    slug: "markup-margin",
    title: "Markup vs Margin",
    shortDescription: "Convert markup to margin and set profitable bid prices.",
    category: "financial-business",
    tags: ["markup", "margin", "profit", "bid price", "overhead"],
    iconName: "Percent",
    formulaSummary: "Price = cost ÷ (1 − margin)",
    available: false,
  },

  // ---- Utilities ----
  {
    id: "fraction-converter",
    slug: "fraction-converter",
    title: "Feet-Inches-Fraction Converter",
    shortDescription: "Decimals ↔ architectural fractions, both directions.",
    category: "utilities",
    tags: ["fraction", "converter", "tape measure", "decimal"],
    iconName: "Sigma",
    formulaSummary: "0.28125 ft ↔ 3-3/8\"",
    available: false,
  },
];

export function getTool(category: Category, slug: string): ToolMetadata | undefined {
  return TOOLS.find((t) => t.category === category && t.slug === slug);
}

export function toolsByCategory(category: Category): ToolMetadata[] {
  return TOOLS.filter((t) => t.category === category);
}

export function searchTools(query: string): ToolMetadata[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((t) =>
    [t.title, t.shortDescription, t.formulaSummary, ...t.tags]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
