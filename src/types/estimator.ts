/**
 * BuildCalc Pro Universal data contracts.
 *
 * Everything in this file is the single source of truth for the shapes that
 * flow between calculators, the master estimate store, and exports. Phase 2
 * (calculator pages) consumes these directly do not duplicate them.
 */

/** Top-level tool categories shown in the directory and navbar. */
export type Category =
  | "concrete"
  | "framing-roofing"
  | "finishes"
  | "site-exterior"
  | "mep"
  | "financial-business"
  | "utilities";

/**
 * Metadata describing one category hub. Implemented once in
 * `src/data/toolsRegistry.ts` (CATEGORIES).
 */
export interface CategoryMetadata {
  /** Stable id matching `Category`. */
  id: Category;
  /** Display label, e.g. "Concrete, Masonry & Earthwork". */
  label: string;
  /** Short tagline for nav menus. */
  tagline: string;
  /** 1–2 sentence blurb for cards and hubs. */
  blurb: string;
  /** Lucide icon component name (resolved via the icon map). */
  iconName: string;
  /** Sub-trade filter tabs shown on the category hub. First entry is "All". */
  subtrades: string[];
}

/** Human labels + marketing copy per category (Phase 2 directory pages). */
export const CATEGORY_META: Record<
  Category,
  { label: string; tagline: string; blurb: string; iconName: string }
> = {
  concrete: {
    label: "Concrete, Masonry & Earthwork",
    tagline: "Slabs, footings, rebar, block",
    blurb:
      "Cubic-yard concrete quantities, sack math, rebar and block counts priced with waste before you pour.",
    iconName: "Layers",
  },
  "framing-roofing": {
    label: "Framing, Carpentry & Roofing",
    tagline: "Lumber, stairs, pitch, shingles",
    blurb:
      "Stud walls, stair stringers, rafter lengths, board feet and roofing squares for the whole envelope.",
    iconName: "Hammer",
  },
  finishes: {
    label: "Drywall, Tile & Finishes",
    tagline: "Drywall, paint, flooring, tile",
    blurb:
      "Sheet goods, paint gallons, flooring and tile box counts with layout waste built in.",
    iconName: "Paintbrush",
  },
  "site-exterior": {
    label: "Site Work, Decks & Fencing",
    tagline: "Excavation, gravel, decks, fences",
    blurb:
      "Cut/fill dirt, aggregate tonnage, deck boards, fencing runs and paver quantities for the site.",
    iconName: "Shovel",
  },
  mep: {
    label: "MEP Quick-Check Estimators",
    tagline: "Electrical, plumbing, HVAC",
    blurb:
      "Wire and conduit runs, light layouts, and BTU sizing sanity-checks for the trades.",
    iconName: "Zap",
  },
  "financial-business": {
    label: "Bidding, Markup & Financials",
    tagline: "Markup, margin, overhead, bids",
    blurb:
      "Turn job costs into bid prices: markup vs margin, overhead recovery, and break-even math.",
    iconName: "Calculator",
  },
  utilities: {
    label: "Field Converters & Master Proposal",
    tagline: "Converters, fractions, trig",
    blurb:
      "Feet-inches-fractions converters, unit conversions, and right-triangle helpers that live on every job.",
    iconName: "Ruler",
  },
};

/**
 * Metadata describing one calculator tool.
 * Registry lives in `src/data/toolsRegistry.ts`.
 */
export interface ToolMetadata {
  /** Stable id, e.g. "concrete-slab". */
  id: string;
  /** URL slug under /tools/[slug]. */
  slug: string;
  /** Display title, e.g. "Concrete Slab Calculator". */
  title: string;
  /** One-liner for cards and command palette. */
  shortDescription: string;
  category: Category;
  /** Sub-trade used for the category hub filter tabs. */
  subtrade: string;
  /** Search keywords for Cmd+K. */
  tags: string[];
  /** Lucide icon component name (resolved via the icon map). */
  iconName: string;
  /** Human-readable formula summary shown on the tool card. */
  formulaSummary: string;
  /** Short input summary for cards, e.g. "L × W × thickness". */
  inputsSummary?: string;
  /** What the calculator outputs, e.g. ["Cubic yards", "80-lb bags"]. */
  outputs: string[];
  /** Trade badge, e.g. "Most Popular", "IRC Code Compliant". */
  badge?: string;
  /** Time to run, e.g. "< 1 min". */
  estimatedTime?: string;
  /** Whether the tool page is implemented (false = "coming soon" card). */
  available: boolean;
  /** Estimated read time of the help content. */
  readTimeMinutes?: number;
  /** Explainer bullets rendered under the calculator ("How the math works"). */
  details?: string[];
  /** One-sentence instruction guide shown above the calculator. */
  howTo?: string;
  /** Q&A pairs for the FAQ section + FAQPage schema (AEO/GEO). */
  faqs?: { q: string; a: string }[];
}

/** Units selectable in the master estimate. Keep display + plural forms. */
export type EstimateUnit =
  | "ea"
  | "sq ft"
  | "sq yd"
  | "lf"
  | "cu ft"
  | "cu yd"
  | "bags"
  | "squares"
  | "tons"
  | "gal"
  | "hrs"
  | "lots"
  | "%";

export const ESTIMATE_UNITS: EstimateUnit[] = [
  "ea",
  "sq ft",
  "sq yd",
  "lf",
  "cu ft",
  "cu yd",
  "bags",
  "squares",
  "tons",
  "gal",
  "hrs",
  "lots",
  "%",
];

/**
 * One line on the master bid. Every calculator's "Add to Master Estimate"
 * button produces exactly this shape.
 */
export interface EstimateLineItem {
  id: string;
  /** Tool slug that produced the line, e.g. "concrete-slab". */
  toolSlug: string;
  title: string;
  category: Category;
  /** Net quantity (before waste) in `unit`. */
  quantity: number;
  unit: EstimateUnit | string;
  /** Unit cost in dollars. */
  unitCost: number;
  /** Total = quantity * unitCost (net, pre-waste display). */
  totalCost: number;
  /** Waste allowance percent applied at pricing time (0–50). */
  wastePercent: number;
  notes?: string;
  /** ISO timestamp of when the line was added. */
  timestamp: string;
}

/** Client details captured once and reused on the bid proposal. */
export interface ClientInfo {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  projectName?: string;
  projectAddress?: string;
}

/** Contractor branding printed on proposals/exports. */
export interface CompanyInfo {
  name: string;
  /** Base64 data-URL logo. Stored locally only. */
  logoBase64?: string;
  license?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/** Derived pricing summary computed, never stored. */
export interface BidSummary {
  /** Sum of line totals (net). */
  directCost: number;
  /** Markup dollars applied on direct cost. */
  markupAmount: number;
  /** Subtotal after markup. */
  subtotal: number;
  /** Contingency dollars applied on subtotal. */
  contingencyAmount: number;
  /** Tax dollars applied on (subtotal + contingency). */
  taxAmount: number;
  /** Final bid price. */
  totalBid: number;
  /** Total including waste-adjusted quantities (for display). */
  wasteAdjustedCost: number;
  lineCount: number;
}

/**
 * The entire persisted estimate document (localStorage key
 * `contractor_active_estimate`, versioned).
 */
export interface MasterEstimateState {
  version: number;
  items: EstimateLineItem[];
  company: CompanyInfo;
  client: ClientInfo;
  /** Markup percent applied on direct cost (default 20). */
  markupPercent: number;
  /** Contingency percent applied after markup (default 5). */
  contingencyPercent: number;
  /** Sales tax percent applied after contingency (default 0). */
  taxPercent: number;
  /** ISO timestamp of last mutation. */
  updatedAt: string;
}

/** Factory for a blank, valid estimate document. */
export function createEmptyEstimate(): MasterEstimateState {
  return {
    version: 1,
    items: [],
    company: { name: "" },
    client: { name: "" },
    markupPercent: 20,
    contingencyPercent: 5,
    taxPercent: 0,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Compute the bid pricing summary from state. Pure function used by the
 * store selector, the drawer, and Phase 2 export views alike.
 */
export function computeBidSummary(state: {
  items: EstimateLineItem[];
  markupPercent: number;
  contingencyPercent: number;
  taxPercent: number;
}): BidSummary {
  const directCost = state.items.reduce(
    (sum, i) => sum + (Number.isFinite(i.totalCost) ? i.totalCost : 0),
    0,
  );

  const wasteAdjustedCost = state.items.reduce((sum, i) => {
    const qty = Number.isFinite(i.quantity) ? i.quantity : 0;
    const unit = Number.isFinite(i.unitCost) ? i.unitCost : 0;
    const waste = Number.isFinite(i.wastePercent) ? i.wastePercent : 0;
    return sum + qty * (1 + waste / 100) * unit;
  }, 0);

  const markupAmount = (directCost * state.markupPercent) / 100;
  const subtotal = directCost + markupAmount;
  const contingencyAmount = (subtotal * state.contingencyPercent) / 100;
  const taxable = subtotal + contingencyAmount;
  const taxAmount = (taxable * state.taxPercent) / 100;
  const totalBid = taxable + taxAmount;

  return {
    directCost,
    markupAmount,
    subtotal,
    contingencyAmount,
    taxAmount,
    totalBid,
    wasteAdjustedCost,
    lineCount: state.items.length,
  };
}
