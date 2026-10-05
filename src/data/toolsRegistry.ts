/**
 * BuildCalc Pro Central Tool Registry (Phase 2).
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
      "Cubic-yard quantities, sack math, rebar and block counts priced with waste before you pour.",
    seoTitle: "Concrete Calculators – Yards, Bags, Rebar & Block",
    seoDescription:
      "Free concrete calculators: how many yards of concrete you need, bag counts, rebar and CMU block takeoffs. Cubic-yard math with waste built in. No sign-up.",
    iconName: "Layers",
    subtrades: ["Flatwork", "Footings & Walls", "Reinforcement", "Masonry"],
  },
  {
    id: "framing-roofing",
    label: "Framing, Carpentry & Roofing",
    tagline: "Lumber, stairs, pitch, shingles",
    blurb:
      "Stud walls, stair stringers, rafter lengths, board feet and roofing squares for the whole envelope.",
    seoTitle: "Roofing, Stair & Framing Calculators",
    seoDescription:
      "Free roofing calculator (squares, shingle bundles, pitch), stair stringer layout, stud wall framing and board-foot calculators. IRC-checked math, no sign-up.",
    iconName: "Hammer",
    subtrades: ["Wall Framing", "Roofing", "Stairs", "Lumber Math"],
  },
  {
    id: "finishes",
    label: "Drywall, Tile & Finishes",
    tagline: "Drywall, paint, flooring, tile",
    blurb:
      "Sheet goods, paint gallons, flooring and tile box counts with layout waste built in.",
    seoTitle: "Tile, Paint, Flooring & Drywall Calculators",
    seoDescription:
      "Free tile calculator, paint calculator, flooring and drywall estimators. How much tile, paint, and flooring you need — with waste factored in. No sign-up.",
    iconName: "Paintbrush",
    subtrades: ["Drywall", "Paint", "Flooring", "Tile"],
  },
  {
    id: "site-exterior",
    label: "Site Work, Decks & Fencing",
    tagline: "Excavation, gravel, decks, fences",
    blurb:
      "Cut/fill dirt, aggregate tonnage, deck boards, fence runs and paver quantities for the site.",
    seoTitle: "Deck, Fence, Gravel & Excavation Calculators",
    seoDescription:
      "Free deck material calculator, fence estimator, gravel tonnage and excavation calculators. Lumber, pickets, and aggregate quantities with cost. No sign-up.",
    iconName: "Shovel",
    subtrades: ["Earthwork", "Decks", "Fencing", "Hardscape"],
  },
  {
    id: "mep",
    label: "MEP Quick-Check Estimators",
    tagline: "Electrical, plumbing, HVAC",
    blurb:
      "Wire and conduit runs, light layouts, and BTU sizing sanity-checks for the trades.",
    seoTitle: "Electrical, HVAC & Plumbing Calculators",
    seoDescription:
      "Free voltage drop calculator, conduit fill checker, BTU and AC tonnage sizer, and recessed light layout tools. NEC-aware quick checks. No sign-up.",
    iconName: "Zap",
    subtrades: ["Electrical", "HVAC", "Plumbing"],
  },
  {
    id: "financial-business",
    label: "Bidding, Markup & Financials",
    tagline: "Markup, margin, overhead, bids",
    blurb:
      "Turn job costs into bid prices: markup vs margin, overhead recovery, and break-even math.",
    seoTitle: "Contractor Markup, Margin & Bidding Calculators",
    seoDescription:
      "Free markup vs margin calculator, labor burden rate, and break-even tools for contractors. Price construction jobs so they actually profit. No sign-up.",
    iconName: "Calculator",
    subtrades: ["Pricing", "Overhead", "Bidding"],
  },
  {
    id: "utilities",
    label: "Field Converters & Master Proposal",
    tagline: "Converters, fractions, trig",
    blurb:
      "Feet-inches-fractions converters, unit conversions, and right-triangle helpers that live on every job.",
    seoTitle: "Construction Converters & Fraction Calculators",
    seoDescription:
      "Free feet-inches-fraction calculator, construction unit converter, and 3-4-5 triangle solver — plus a master proposal builder. Jobsite math, no sign-up.",
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
    seoTitle: "Concrete Calculator – Cubic Yards, Bags & Volume",
    shortDescription:
      "Concrete calculator that figures cubic yards, 80/60-lb bags, and order quantity for slabs, pads, and flatwork, with exact waste built in. Free, no sign-up.",
    category: "concrete",
    subtrade: "Flatwork",
    tags: ["concrete calculator", "cubic yards calculator", "how many yards of concrete do i need", "how many bags of concrete do i need", "bags per cubic yard", "80 lb bags of concrete", "concrete volume calculator", "slab", "flatwork", "ready mix", "how many bags are in a cubic yard", "10x10 slab concrete", "short load fee", "concrete pour"],
    iconName: "Layers",
    formulaSummary: "V = L × W × D ÷ 27 → +waste",
    inputsSummary: "L × W × thickness",
    outputs: ["Cubic yards", "80/60-lb bags", "Order quantity"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Volume = length × width × (thickness ÷ 12) gives cubic feet; divide by 27 for cubic yards the unit ready-mix is sold in.",
      "Order quantity = net yards × (1 + waste%). The 10–15% default covers spillage, over-excavation, and uneven subgrade.",
      "An 80-lb bag yields ≈ 0.6 cu ft, so one cubic yard needs about 45 bags (60 for 60-lb bags). Counts round up suppliers don't split bags.",
    ],
    faqs: [
      { q: "How many cubic yards of concrete do I need?", a: "Multiply length × width × (thickness ÷ 12), then divide by 27. A 20×12 ft slab at 4 in thick needs 2.96 yards net — order about 3.26 yards with 10% waste." },
      { q: "How many 80 lb bags of concrete do I need?", a: "One cubic yard takes about 45 80-lb bags (0.6 cu ft each), and since bags aren't split the count rounds up. That 20×12 ft slab at 4 in needs roughly 147 bags with 10% waste." },
      { q: "How do you calculate cubic yards of concrete?", a: "Volume = length × width × (thickness ÷ 12) gives cubic feet; divide by 27, the number of cubic feet in a cubic yard — the unit ready-mix is sold in." },
      { q: "How many bags of concrete are in a cubic yard?", a: "About 45 80-lb bags or 60 60-lb bags per cubic yard. An 80-lb bag yields roughly 0.6 cu ft." },
      { q: "Should I order extra concrete for waste?", a: "Yes — add 10–15%. Order quantity = net yards × (1 + waste%) to cover spillage, over-excavation, and uneven subgrade. Loads under 4 yards usually trigger a short-load fee." },
    ],
    howTo: "Pick a shape, enter dimensions, set waste and your supplier rate the order quantity, bags, truckloads, and cost update live.",
  },
  {
    id: "concrete-footing",
    slug: "concrete-footing",
    title: "Footing Concrete Estimator",
    seoTitle: "Concrete Footing Calculator – Yards & Footers",
    shortDescription:
      "Concrete footing calculator that figures cubic yards, truckloads, and 80-lb bag counts for strip footings, stem walls, and foundations. Free, no sign-up.",
    category: "concrete",
    subtrade: "Footings & Walls",
    tags: ["concrete footing calculator", "footing concrete calculator", "concrete footer calculator", "how many yards of concrete do i need", "how deep should a concrete footing be", "strip footing", "stem wall", "foundation", "ready mix", "short load fee", "bags per cubic yard", "concrete calculator", "trench footing", "footer"],
    iconName: "Layers",
    formulaSummary: "V = L × W × D ÷ 27",
    inputsSummary: "L × W × D per run",
    outputs: ["Cubic yards", "Truckloads", "Bags"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Strip footing volume is length × width × depth ÷ 27 — a 40 ft × 16 in × 8 in footing is 40 × 1.33 × 0.67 ÷ 27 ≈ 1.32 cubic yards before waste.",
      "Order 5–10% extra for over-excavation and form spread; trench bottoms are rarely perfect.",
      "Most ready-mix suppliers charge a short-load fee under 4 yards — combine small footings into one pour when you can.",
      "A cubic yard of concrete needs about 45 eighty-pound bags or 60 sixty-pound bags of premix."
    ],
    howTo: "Enter one footing run's length, width, and depth plus how many identical runs — yards, truckloads, and bag counts solve live.",
    faqs: [
      { q: "How many yards of concrete do I need for a footing?", a: "Volume = length × width × depth ÷ 27. A 40 ft × 16 in × 8 in footing is about 1.32 cubic yards net — order roughly 1.45 yards with 10% waste." },
      { q: "How deep should a concrete footing be?", a: "Below the local frost line — commonly 12–36 in depending on climate — and always bearing on undisturbed soil. Check local code before you dig." },
      { q: "Should I order extra concrete for waste?", a: "Yes — order 5–10% extra for over-excavation and form spread. Trench bottoms are rarely perfect." },
      { q: "How many 80 lb bags of concrete do I need per cubic yard?", a: "About 45 eighty-pound bags or 60 sixty-pound bags of premix per cubic yard." },
      { q: "Should I use ready-mix or bags for footings?", a: "Ready-mix wins above roughly a yard; below that, bags avoid the short-load fee most suppliers charge under 4 yards. This tool prices both so you can compare." },
    ],
  },
  {
    id: "rebar-mesh-estimator",
    slug: "rebar-mesh-estimator",
    title: "Rebar & Mesh Estimator",
    seoTitle: "Rebar Calculator – Bar Count, Spacing & Weight",
    shortDescription:
      "Rebar calculator that figures bar counts, spacing grids, 20-ft sticks, steel weight, and tie counts for concrete slabs and footings. Free, no sign-up.",
    category: "concrete",
    subtrade: "Reinforcement",
    tags: ["rebar calculator", "how much rebar do i need for a concrete slab", "rebar spacing calculator", "rebar weight", "wire mesh estimator", "number 4 rebar", "lap splice", "20 ft rebar sticks", "tie wire count", "slab reinforcement", "footing rebar", "12 inch on center", "steel weight calculator", "rebar grid"],
    iconName: "Grid3x3",
    formulaSummary: "Bars = span ÷ spacing + 1",
    inputsSummary: "Slab/footing dims + spacing",
    outputs: ["Linear feet", "20-ft sticks", "Steel weight", "Tie count"],
    badge: "IRC Code Compliant",
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Enter slab dimensions, pick rebar or wire mesh, set spacing and lap sticks, weight, and tie counts update live.",
    details: [
      "Bar runs = floor((span − 2 × cover) ÷ spacing) + 1 per direction; total footage includes the lap-splice allowance for bar joints.",
      "Weight uses standard bar weights (#3 = 0.376, #4 = 0.668, #5 = 1.043 lb/ft) so you can price by the ton.",
      "Tie count = one tie per grid intersection budget a 1,000-count bag per ~1,000 intersections.",
    ],
    faqs: [
      { q: "How much rebar do I need for a concrete slab?", a: "Bars per direction = floor((span − 2 × cover) ÷ spacing) + 1. The tool totals linear feet in both directions, including the lap-splice allowance for bar joints." },
      { q: "What spacing should rebar be in a concrete slab?", a: "12 inches on center each way is the common residential default; 18 to 24 inches suits light-duty work. Keep 3 inches of clear cover from form edges." },
      { q: "How much does #4 rebar weigh per foot?", a: "#4 (1/2-inch) bar weighs 0.668 lb per foot, so 500 linear feet is about 334 lbs. (#3 = 0.376, #5 = 1.043 lb/ft.) Use the weight total to price steel by the ton." },
      { q: "How many 20-foot sticks of rebar do I need?", a: "Divide total linear feet — including your lap-splice allowance, typically 15% — by 20 and round up." },
      { q: "How many rebar ties do I need?", a: "Budget one tie per grid intersection — roughly a 1,000-count bag per 1,000 intersections." },
    ],
  },
  {
    id: "concrete-column",
    slug: "concrete-column",
    title: "Sonotube & Pier Calculator",
    seoTitle: "Sonotube Calculator – Pier Yards & Bag Count",
    shortDescription:
      "Sonotube calculator that figures cubic yards and 80-lb bag counts per pier from tube diameter, depth, and pier count for columns and footings. Free, no sign-up.",
    category: "concrete",
    subtrade: "Footings & Walls",
    tags: ["sonotube calculator", "concrete pier calculator", "concrete column calculator", "deck footing calculator", "how many bags of concrete do i need", "bags per pier", "post base", "round footing", "sonotube sizes", "pier depth", "frost line", "concrete calculator", "caisson", "pier"],
    iconName: "Cylinder",
    formulaSummary: "V = π r² h ÷ 27",
    inputsSummary: "Diameter × depth × count",
    outputs: ["Cubic yards", "Bags per pier"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Pier volume is π × r² × depth ÷ 27 — a 12 in diameter, 4 ft deep pier is π × 0.25 × 4 ÷ 27 ≈ 0.12 cubic yards.",
      "Sonotubes come in even-inch diameters (8, 10, 12, 18); size the tube to the post base plus bearing requirements.",
      "Set piers below the frost line and bell the bottom in soft soils for extra bearing area.",
      "One 80-lb bag yields about 0.6 cu ft — a 12 in × 4 ft pier needs roughly 5–6 bags."
    ],
    howTo: "Pick the tube diameter, enter pier depth and count — yards and per-pier bag counts solve live.",
    faqs: [
      { q: "How many 80 lb bags of concrete do I need for a sonotube?", a: "A 12 in diameter, 4 ft deep pier is about 0.12 cubic yards — roughly 5–6 eighty-pound bags (45 bags per yard at 0.6 cu ft per bag)." },
      { q: "How do you calculate cubic yards of concrete for a round pier?", a: "Volume = π × r² × depth ÷ 27. A 12 in × 4 ft pier is π × 0.25 × 4 ÷ 27 ≈ 0.12 cubic yards." },
      { q: "How deep should deck piers go?", a: "Below the local frost line — typically 36–48 in in cold climates — plus about 6 in above grade." },
      { q: "What sonotube size do I need?", a: "Sonotubes come in even-inch diameters (8, 10, 12, 18). Size the tube to the post base plus bearing requirements, and bell the bottom in soft soils for extra bearing area." },
      { q: "Do I need rebar in concrete piers?", a: "Yes for structural posts — one or two vertical bars tied to the post base keeps the pier from splitting under load." },
    ],
  },
  {
    id: "cmu-block-mortar",
    slug: "cmu-block-mortar",
    title: "CMU Block, Mortar & Core-Fill Grout",
    seoTitle: "CMU Block Calculator – Blocks, Mortar & Grout",
    shortDescription:
      "CMU block calculator for block count, Type S mortar bags, core-fill grout yards, and bond-beam rebar on masonry walls, with waste included. Free, no sign-up.",
    category: "concrete",
    subtrade: "Masonry",
    tags: ["cmu block calculator", "cinder block calculator", "block wall calculator", "how many blocks do i need", "mortar bags per block", "type s mortar", "core fill grout", "bond beam rebar", "masonry estimator", "8x8x16 block", "grout yards", "block count", "wall square footage", "concrete block"],
    iconName: "BrickWall",
    formulaSummary: "Blocks = wall sq ft ÷ 0.89 → +waste",
    inputsSummary: "Wall L × H · block size · grout fill",
    outputs: ["Block count", "Mortar bags", "Grout yards", "Rebar sticks"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "A standard 8×16 in block face covers 0.8889 sq ft, so a wall needs about 112.5 blocks per 100 sq ft before waste the same for 6, 8, and 12 in widths.",
      "Type S mortar runs about 1 eighty-pound bag per 30 blocks. The 10% default waste covers joints, cuts, and spills.",
      "Cores sit on 8 in centers, so grouting every 24 in O.C. fills every 3rd core, 32 in O.C. every 4th, and 48 in O.C. every 6th. A solid-grouted 8×8×16 block holds about 0.16 cu ft of grout.",
      "Bond-beam courses are grouted solid along their full length with 2 continuous bars counted in 20-ft sticks.",
    ],
    faqs: [
      { q: "How many CMU blocks do I need for a wall?", a: "A standard 8×16 in block face covers 0.8889 sq ft, so plan on about 112.5 blocks per 100 sq ft. A 40×8 ft wall (320 sq ft) needs 360 blocks net — order 378 with 5% waste for cuts and breakage." },
      { q: "How many 80-lb bags of mortar do I need?", a: "About 1 bag of Type S mortar per 30 blocks — roughly 3.5 bags per 100 blocks, or 4 with 10% waste. A 378-block wall needs about 14 bags." },
      { q: "How much grout do I need to fill CMU cores?", a: "A solid-grouted 8×8×16 block holds about 0.16 cu ft. Cores sit on 8 in centers, so grouting every 24 in O.C. fills every 3rd core, 32 in O.C. every 4th, and 48 in O.C. every 6th." },
      { q: "How do you calculate block count for a wall?", a: "Divide wall square footage by 0.8889 (the face area of one block), then add waste — 5% is the default for cuts and breakage." },
      { q: "How much rebar goes in a bond beam?", a: "Bond-beam courses are grouted solid along their full length with 2 continuous bars, counted in 20-ft sticks." },
    ],
    howTo: "Enter wall dimensions, pick block size and core-fill spacing, add bond-beam courses blocks, mortar, grout, and rebar price themselves live.",
  },

  /* ---------------- Framing, Carpentry & Roofing ---------------- */
  {
    id: "roof-pitch-shingles",
    slug: "roof-pitch-shingles",
    title: "Roof Pitch & Shingle Calculator",
    seoTitle: "Roofing Calculator – Squares, Bundles & Shingle Cost",
    shortDescription:
      "Roofing calculator that turns footprint and pitch into roofing squares, shingle bundles, and underlayment, with waste set by roof complexity. Free, no sign-up.",
    category: "framing-roofing",
    subtrade: "Roofing",
    tags: ["roofing calculator", "roof shingle calculator", "roofing squares calculator", "how many bundles of shingles do i need", "how many shingles are in a square", "shingle bundle calculator", "roof pitch calculator", "bundles per square", "underlayment calculator", "roof waste factor", "hip roof shingle calculator", "architectural shingles per square", "3-tab shingles per square", "roofing square footage calculator"],
    iconName: "House",
    formulaSummary: "Area × pitch factor ÷ 100",
    inputsSummary: "Plan L × W + pitch",
    outputs: ["Roofing squares", "Bundles", "Underlayment rolls"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter the roof footprint, pick a pitch and roof complexity squares, bundles, and underlayment price themselves instantly.",
    details: [
      "Pitch multiplier M = √(rise² + 12²) ÷ 12 converts plan area to true surface area a 6/12 roof has ~11.8% more surface than its footprint.",
      "Waste follows complexity: 10% simple gable, 15% hip/valley, 20% cut-up. Valleys and hips eat shingles.",
      "Bundles = squares × 3 (rounded up); underlayment rolls = waste-adjusted area ÷ 1,000 (10-square synthetic rolls).",
    ],
    faqs: [
      { q: "How many bundles of shingles do I need?", a: "Three bundles cover one roofing square for architectural and 3-tab shingles. The calculator totals your squares, rounds up, then multiplies by 3 — 24.6 squares means 74 bundles." },
      { q: "How many shingles are in a square?", a: "A roofing square is 100 square feet of roof surface, covered by 3 bundles of shingles. The calculator divides your pitch-adjusted, waste-loaded area by 100 to get squares." },
      { q: "How many roofing squares do I need?", a: "Multiply the footprint area by the pitch multiplier M = sqrt(rise^2 + 12^2) / 12, add waste — 10% gable, 15% hip/valley, 20% cut-up — then divide by 100." },
      { q: "Does roof pitch affect shingles needed?", a: "Yes. Steeper roofs have more surface per square foot of footprint — a 6/12 roof has about 11.8% more surface than its footprint. The calculator applies the pitch multiplier before adding waste." },
      { q: "How much waste should I add for shingles?", a: "10% for a simple gable, 15% for hips and valleys, and 20% for a complex cut-up roof with dormers and crickets. Valleys and hips eat shingles." },
    ],
  },
  {
    id: "stair-stringer-layout",
    slug: "stair-stringer-layout",
    title: "Stair Stringer Layout",
    seoTitle: "Stair Calculator – Stringer Layout, Risers & Code",
    shortDescription:
      "Stair calculator that lays out riser count, unit rise, tread depth, and stringer length from total rise and run, with live IRC code checks. Free, no sign-up.",
    category: "framing-roofing",
    subtrade: "Stairs",
    tags: ["stair calculator", "stair stringer calculator", "stair stringer layout", "what is the standard riser height for stairs", "how do you calculate stair stringers", "how do you determine stringer length", "stair riser calculator", "stair tread calculator", "irc stair code calculator", "stringer length calculator", "stair rise and run calculator", "2r+t stair rule", "how many steps for a 9 foot ceiling", "deck stair calculator"],
    iconName: "TrendingUp",
    formulaSummary: "Risers = total rise ÷ 7",
    inputsSummary: "Total rise + run",
    outputs: ["Riser count", "Unit rise/run", "Stringer boards", "IRC checks"],
    badge: "IRC Code Compliant",
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Enter total rise and target tread run the layout solves risers, stringer length, and live IRC code checks instantly.",
    details: [
      "Riser count = round(total rise ÷ 7.5); unit rise = total rise ÷ count. Treads = risers − 1 (the top tread is the landing).",
      "IRC R311.7: risers ≤ 7¾″, treads ≥ 10″. The comfort rule 2R + T should land between 24″ and 25″.",
      "Stringer boards round up to stock 10/12/14/16-ft 2×12s; widths over 36″ get a fourth stringer.",
    ],
    faqs: [
      { q: "What is the standard riser height for stairs?", a: "The IRC caps residential risers at 7-3/4 inches maximum, with treads at least 10 inches deep. The calculator targets about 7.5 inches per riser for comfort and flags any layout over the code maximum." },
      { q: "How do you calculate stair stringers?", a: "Riser count = round(total rise / 7.5); unit rise = total rise / count; treads = risers - 1, since the top tread is the landing. Stringer boards round up to stock 10, 12, 14, or 16-ft 2x12s." },
      { q: "How do you determine stringer length?", a: "From the total rise and total run — the calculator solves the stair's slope length and rounds up to the next stock 2x12 length. Widths over 36 inches get a fourth stringer." },
      { q: "How many steps do I need for a 9-foot ceiling?", a: "108 / 7.5 = 14.4, so 14 risers at 7.71 inches each, with 13 treads (the top tread is the landing). The calculator checks each riser against the 7-3/4 inch IRC maximum." },
      { q: "What is the 2R+T stair rule?", a: "Twice the riser height plus the tread run should land between 24 and 25 inches for a comfortable stair. It is a comfort guideline, not a code requirement." },
    ],
  },
  {
    id: "stud-wall",
    slug: "stud-wall",
    title: "Stud Wall Framing",
    seoTitle: "Stud Calculator – Wall Framing, Plates & Headers",
    shortDescription:
      "Stud calculator for wall framing at 16\" or 24\" O.C. — studs, plates, headers, kings, and cripples solved from wall length and openings. Free, no sign-up.",
    category: "framing-roofing",
    subtrade: "Wall Framing",
    tags: ["stud calculator", "framing calculator", "wall framing calculator", "how many studs do i need for a wall", "how many studs for a 12 foot wall", "stud spacing calculator", "16 oc stud calculator", "24 oc stud calculator", "wall stud layout calculator", "king stud calculator", "wall header calculator", "top plate calculator", "framing takeoff calculator", "lumber takeoff calculator"],
    iconName: "Ruler",
    formulaSummary: "Studs = L ÷ spacing + 1",
    inputsSummary: "Wall length + spacing",
    outputs: ["Stud count", "Plates", "Headers"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Field studs = wall length ÷ spacing + 1 — a 12 ft wall at 16 in O.C. needs 144 ÷ 16 + 1 = 10 studs.",
      "Plates run three times the wall length: one bottom plate plus a doubled top plate.",
      "Each opening adds a header, two king studs, and two cripples — one under the sill, one over the header.",
      "Two extra studs per wall cover corners and T-intersections where walls meet."
    ],
    howTo: "Enter wall length, pick 16 or 24 in spacing, and count the door and window openings — stud, plate, and header counts solve live.",
    faqs: [
      { q: "How many studs do I need for a wall?", a: "Field studs = wall length / spacing + 1 — a 12 ft wall at 16 in O.C. needs 144 / 16 + 1 = 10 studs. The calculator then adds king studs, cripples, and corner studs based on your openings." },
      { q: "How many studs for a 12-foot wall at 16 inches on center?", a: "144 / 16 + 1 = 10 field studs, plus kings, cripples, and corner studs per the opening layout. Each door or window adds a header, two king studs, and two cripples." },
      { q: "When can I frame at 24 inches on center?", a: "For non-load-bearing walls, or load-bearing walls where the design allows. 24 in O.C. saves about a third of the studs but needs aligned framing." },
      { q: "Why a double top plate?", a: "It ties intersecting walls together and spreads point loads. Splices must land over a stud, offset at least 48 inches from the joint in the plate below." },
      { q: "What does each wall opening add?", a: "One header, two king studs, and two cripples — one under the sill, one over the header. Two extra studs per wall cover corners and T-intersections where walls meet." },
    ],
  },
  {
    id: "rafter-truss-cuts",
    slug: "rafter-truss-cuts",
    title: "Rafter & Truss Cut Length Calculator",
    seoTitle: "Rafter Calculator – Lengths, Birdsmouth & Cut Angles",
    shortDescription:
      "Framing calculator that sizes common rafters from span, pitch, and overhang — line length, plumb and seat cut angles, and stock size. Free, no sign-up.",
    category: "framing-roofing",
    subtrade: "Roofing",
    tags: ["framing calculator", "rafter calculator", "rafter length calculator", "common rafter calculator", "birdsmouth cut calculator", "plumb cut calculator", "roof pitch angle calculator", "rafter span calculator", "seat cut calculator", "how to cut rafters", "roof framing calculator", "ridge board calculator", "rafter overhang calculator", "truss cut calculator"],
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
      "A 3.5 in level seat on the plate cuts a plumb depth of 3.5 × tan(pitch angle) it must stay under one-third of the rafter depth or the rafter is overcut.",
      "Eave overhang is measured horizontally past the plate; its rafter length is √(overhang² + (overhang × pitch ÷ 12)²).",
    ],
    faqs: [
      { q: "How long is a common rafter for a 28 ft span at 6/12 pitch?", a: "The run is 168 in minus half the ridge (167.25 in); rise = 167.25 x 0.5 = 83.6 in. Line length = sqrt(167.25^2 + 83.6^2) = 187 in, about 15 ft 7 in. Add the overhang cut and buy 18-ft stock." },
      { q: "What angle do I cut a bird's mouth for a 6/12 roof?", a: "The plumb cut is the pitch angle — 26.57 degrees for 6/12 — and the seat cut is 90 - 26.57 = 63.43 degrees. A 3.5 in seat cuts 1.75 in deep, safely under the 1.83 in limit for 2x6 stock." },
      { q: "How many rafters do I need for a 40 ft ridge at 16 in O.C.?", a: "Ceil(480 / 16) + 1 = 31 pairs, or 62 rafters for both slopes, plus a starter pair at each gable end in practice." },
      { q: "How deep can a birdsmouth seat cut be?", a: "The plumb depth of the seat cut is 3.5 x tan(pitch angle) and must stay under one-third of the rafter depth — otherwise the rafter is overcut and weakened." },
      { q: "How is eave overhang measured for a rafter?", a: "Horizontally past the outside of the plate. Its rafter length is sqrt(overhang^2 + (overhang x pitch / 12)^2), added to the line length before rounding up to stock." },
    ],
    howTo: "Enter span, ridge length, pitch, and overhang rafter lengths in ft-in-fractions, cut angles, and stock size solve live.",
  },
  {
    id: "board-feet",
    slug: "board-feet",
    title: "Board Feet Calculator",
    seoTitle: "Board Foot Calculator – Lumber BF & Hardwood Cost",
    shortDescription:
      "Board foot calculator for lumber and hardwood pricing — enter thickness, width, length, and piece count for BF per piece and job totals. Free, no sign-up.",
    category: "framing-roofing",
    subtrade: "Lumber Math",
    tags: ["board foot calculator", "board feet calculator", "how do you calculate board feet", "what is a board foot", "lumber calculator", "hardwood calculator", "bf calculator", "board footage calculator", "how many board feet in a 2x6x8", "lumber pricing calculator", "nominal vs actual lumber size", "rough lumber calculator", "2x6 board feet", "timber calculator"],
    iconName: "Logs",
    formulaSummary: "BF = T × W × L ÷ 12",
    inputsSummary: "T × W × L + count",
    outputs: ["Board feet", "Piece count"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Board feet = thickness × width × length ÷ 12, using nominal inches and feet — a 2×6×8 is 2 × 6 × 8 ÷ 12 = 8 BF.",
      "Board-foot pricing is the standard for hardwoods and rough lumber; dimensional softwood is usually priced per piece.",
      "One board foot equals 144 cubic inches — the volume of a 1 in × 12 in × 12 in board.",
      "Always round up piece counts; mills sell whole boards, not fractions."
    ],
    howTo: "Enter nominal thickness, width, length, and piece count — board feet per piece and total solve live.",
    faqs: [
      { q: "How do you calculate board feet?", a: "Board feet = thickness x width x length / 12, using nominal inches and feet. A 2x6x8 is 2 x 6 x 8 / 12 = 8 board feet." },
      { q: "What is a board foot?", a: "144 cubic inches of lumber — the volume of a 1-inch-thick, 12-inch-wide, 12-inch-long board. It is the standard pricing unit for hardwoods and rough lumber." },
      { q: "How many board feet in a 2x6x8?", a: "2 x 6 x 8 / 12 = 8 board feet per piece. Enter the piece count and the calculator totals the job and always rounds piece counts up, since mills sell whole boards." },
      { q: "Do I use nominal or actual dimensions?", a: "Nominal — board-foot pricing is based on the named size (2x6), not the actual 1.5 x 5.5 inches." },
      { q: "When is board-foot pricing used?", a: "It is the standard for hardwoods and rough lumber. Dimensional softwood is usually priced per piece instead." },
    ],
  },

  /* ---------------- Drywall, Tile & Finishes ---------------- */
  {
    id: "framing-drywall-pack",
    slug: "framing-drywall-pack",
    title: "Wall Framing & Drywall Pack",
    seoTitle: "Wall Framing & Drywall Calculator – Full Takeoff",
    shortDescription:
      "Framing calculator for the full wall package — studs and plates plus drywall sheets, mud, and tape from room dimensions and openings. Free, no sign-up.",
    category: "finishes",
    subtrade: "Drywall",
    tags: ["framing calculator", "drywall calculator", "wall framing and drywall calculator", "drywall sheet calculator", "how many drywall sheets do i need", "how many studs do i need for a wall", "joint compound calculator", "drywall takeoff calculator", "sheetrock calculator", "drywall mud calculator", "room drywall estimator", "wall package calculator", "drywall waste factor", "studs and drywall calculator"],
    iconName: "Square",
    formulaSummary: "Sheets = area ÷ 32 (4×8)",
    inputsSummary: "Room dims + openings",
    outputs: ["Stud count", "Plate boards", "Drywall sheets", "Mud & tape"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter wall length and height, set spacing and openings studs, plates, sheets, mud, and tape price themselves live.",
    details: [
      "Studs = ceil(length ÷ spacing) + 1, plus 2 per corner and 2 per door for kings/jacks. Plates = 3 runs (double top) or 2, in 16-ft boards.",
      "Net drywall = wall area × sides − door/window deductions (21 / 15 sq ft), plus 10% cutting waste.",
      "One 4.5-gal mud bucket and one 250-ft tape roll cover ~500 sq ft of board each.",
    ],
    faqs: [
      { q: "How many drywall sheets do I need for a 12x16 room with 8-ft ceilings?", a: "Wall area is 2 x (12+16) x 8 = 448 sq ft. After deducting a door (21 sq ft) and two windows (30 sq ft) and adding 10% cutting waste, you need about 13 4x8 sheets per side." },
      { q: "How many studs do I need for a 40-foot wall at 16 inches on center?", a: "31 studs for the run (40x12/16 rounded up, plus one), plus 2 per corner and 2 per door for kings and jacks — 43 total for a 40-ft wall with 4 corners and 2 doors." },
      { q: "How much joint compound do I need per sheet of drywall?", a: "Budget one 4.5-gallon bucket of mud and one 250-ft roll of tape per 500 sq ft of installed board." },
      { q: "How much waste should I add for drywall?", a: "10% cutting waste on the net board area, after deducting 21 sq ft per door and 15 sq ft per window." },
      { q: "How are wall plates figured?", a: "Plates run three times the wall length — one bottom plate plus a doubled top plate — or two runs where a single top plate is allowed, figured in 16-ft boards." },
    ],
  },
  {
    id: "paint-primer-coverage",
    slug: "paint-primer-coverage",
    title: "Paint, Primer & Ceiling Coverage",
    seoTitle: "Paint Calculator – How Much Paint You Need Per Room",
    shortDescription:
      "Paint calculator: enter room dimensions to get wall, ceiling, and primer gallons with doors and windows deducted for one or two coats. Free, no sign-up.",
    category: "finishes",
    subtrade: "Paint",
    tags: ["paint calculator", "how much paint do I need", "how much paint do I need for a room", "paint coverage calculator", "how many gallons of paint per square foot", "gallons of paint per square foot", "do I need primer before painting", "primer calculator", "ceiling paint calculator", "how much paint for a 12x16 room", "wall paint estimator", "paint per coat calculator"],
    iconName: "Paintbrush",
    formulaSummary: "Gal = net area ÷ 350",
    inputsSummary: "Wall/ceiling area + coats",
    outputs: ["Wall gallons", "Ceiling gallons", "Primer gallons"],
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter room dimensions and openings, toggle ceiling and primer gallons for every coat update live.",
    details: [
      "Net wall area = 2 × (L + W) × H minus 21 sq ft per door and 15 per window. Ceiling = L × W.",
      "Gallons always round up paint is sold by the gallon, and a short gallon stops the job.",
      "Primer covers ~350 sq ft/gal on bare drywall; two finish coats is the standard for fresh work.",
    ],
    faqs: [
      { q: "How much paint do I need for a room?", a: "A 12x16 ft room with 8 ft ceilings has 448 sq ft of wall; minus one door (21) and two windows (30) leaves 397 sq ft net. Two coats at 350 sq ft per gallon rounds up to 3 gallons." },
      { q: "How many gallons of paint per square foot?", a: "About one gallon covers 350 sq ft per coat on smooth drywall — roughly 300 on rough or textured surfaces and up to 400 on smooth previously painted walls." },
      { q: "Do I need primer before painting?", a: "Yes on bare drywall. One coat of primer at about 350 sq ft per gallon seals the surface so finish coats cover evenly; two finish coats is the standard for fresh work." },
      { q: "How much paint do I need for a 12x16 room?", a: "397 sq ft of net wall after openings, times two coats, is 794 sq ft — divided by 350 sq ft per gallon and rounded up, that is 3 gallons." },
      { q: "Does the calculator deduct doors and windows?", a: "Yes. It subtracts 21 sq ft per door and 15 sq ft per window from the wall area before computing gallons, so you never buy paint for openings." },
    ],
  },
  {
    id: "flooring-trim-estimator",
    slug: "flooring-trim-estimator",
    title: "Flooring & Baseboard Trim Estimator",
    seoTitle: "Flooring Calculator – Boxes, Waste & Trim Estimator",
    shortDescription:
      "Flooring calculator: enter room size to get plank boxes, underlayment rolls, and baseboard sticks per room, with layout waste included. Free, no sign-up.",
    category: "finishes",
    subtrade: "Flooring",
    tags: ["flooring calculator", "how many boxes of laminate flooring do I need", "how do you calculate flooring waste", "laminate flooring calculator", "lvp flooring calculator", "flooring boxes calculator", "how much flooring do I need", "flooring waste calculator", "underlayment calculator", "baseboard calculator", "how much baseboard do I need", "plank flooring estimator"],
    iconName: "LayoutGrid",
    formulaSummary: "Boxes = area × waste ÷ box size",
    inputsSummary: "Floor area + box size",
    outputs: ["Flooring boxes", "Underlayment rolls", "Baseboard sticks"],
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter room size, pick a flooring type and waste tier boxes, underlayment, and trim price themselves live.",
    details: [
      "Cut waste follows the layout: 5% straight plank, 10% angle/herringbone, 15% diagonal.",
      "Underlayment rolls are 100 sq ft; baseboard comes in 16-ft sticks with 10% for corners and cuts.",
      "Enter L × W (not just sq ft) to unlock the perimeter trim calculation.",
    ],
    faqs: [
      { q: "How many boxes of laminate flooring do I need?", a: "For 300 sq ft with 5% waste you need 315 sq ft of material; divided by 20 sq ft per box and rounded up, that is 16 boxes." },
      { q: "How do you calculate flooring waste?", a: "Add 5% for straight plank layouts, 10% for angled patterns or irregular rooms, and 15% for diagonal layouts. Multiply net area by (1 + waste), divide by box coverage, and round up." },
      { q: "How much baseboard do I need?", a: "Perimeter is 2 x (length + width); add 10% for corners and cuts, divide by 16-ft stick length, and round up to whole sticks." },
      { q: "How much underlayment do I need?", a: "Underlayment rolls cover 100 sq ft each — divide your waste-adjusted floor area by 100 and round up to full rolls." },
      { q: "Should I enter length and width or just square footage?", a: "Enter L x W, not just total square feet. The tool needs both dimensions to compute the room perimeter for the baseboard trim calculation." },
    ],
  },
  {
    id: "tile-grout-calculator",
    slug: "tile-grout-calculator",
    title: "Tile, Thinset & Grout Calculator",
    seoTitle: "Tile Calculator – How Many Tiles You Need + Waste",
    shortDescription:
      "Tile calculator: enter area and tile size to get tile boxes, thinset bags, and grout bags for floors, showers, backsplashes, waste included. Free, no sign-up.",
    category: "finishes",
    subtrade: "Tile",
    tags: ["tile calculator", "how many tiles do I need", "how many tiles do I need for a floor", "how much extra tile should I order for waste", "tile waste calculator", "floor tile calculator", "backsplash tile calculator", "shower tile calculator", "grout calculator", "thinset calculator", "how many boxes of tile do I need", "tile estimator"],
    iconName: "Grid3x3",
    formulaSummary: "Tiles = area ÷ tile size × waste",
    inputsSummary: "Area + tile size",
    outputs: ["Tile boxes", "Thinset bags", "Grout bags", "Spacers"],
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Enter the area and tile size, pick grout joint and waste boxes, thinset, and grout bags update live.",
    details: [
      "Tile boxes = ceil(waste-adjusted area ÷ sq ft per box). Thinset ≈ 1 bag (50 lb) per 50 sq ft with a ¼×⅜″ notch trowel.",
      "Grout weight uses the Mapei joint-volume formula Area × (L+W)/(L×W) × joint × thickness, with the density constant corrected to 7.9 lb/(ft²·in) for imperial units (the published 1.4 is kg/L, metric-only) then rounded up to 25-lb bags.",
      "Joints ≥ ⅛″ want sanded grout; under ⅛″ go unsanded to avoid scratching tile faces.",
    ],
    faqs: [
      { q: "How many tiles do I need for a floor?", a: "Divide the net floor area by the tile size to get the tile count, then the tool divides the waste-adjusted area by square feet per box and rounds up to whole boxes." },
      { q: "How much extra tile should I order for waste?", a: "Add 10% for a straight lay; go higher for diagonal patterns or rooms with many cuts. The calculator applies waste before dividing into boxes so the count is never short." },
      { q: "How many boxes of tile do I need for 150 sq ft?", a: "150 sq ft with 10% waste is 165 sq ft; divided by 15 sq ft per box, that is 11 boxes." },
      { q: "How much thinset do I need?", a: "About one 50-lb bag per 50 sq ft when using a 1/4 x 3/8-inch notch trowel — the tool converts your area into bags automatically." },
      { q: "Sanded or unsanded grout?", a: "Use sanded grout for joints 1/8 inch and wider; go unsanded under 1/8 inch to avoid scratching the tile face." },
    ],
  },

  /* ---------------- Site Work, Decks & Fencing ---------------- */
  {
    id: "excavation-dirt-haul",
    slug: "excavation-dirt-haul",
    title: "Trench, Excavation & Dirt Haul",
    seoTitle: "Excavation Calculator – Dirt Volume & Haul Trucks",
    shortDescription:
      "Excavation calculator: bank vs. loose cubic yards with soil swell, heaped truckloads, and backfill volumes for trenches, basements, and digs fast. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["excavation calculator", "dirt calculator", "cubic yard calculator", "soil swell calculator", "dump truck loads calculator", "trench excavation calculator", "how do you calculate excavation volume", "how many yards of dirt fit in a dump truck", "bank yards vs loose yards", "earthwork takeoff", "cut and fill calculator", "excavation volume formula", "dirt haul estimator"],
    iconName: "Shovel",
    formulaSummary: "Loose yd = bank yd × (1 + swell%)",
    inputsSummary: "L × W × D · soil · truck",
    outputs: ["Bank yards", "Loose yards", "Truckloads"],
    badge: "Quick Takeoff",
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Bank cubic yards (L × W × D ÷ 27) is the in-situ volume you pay to dig; loose cubic yards add the swell factor what you pay to haul.",
      "Common earth swells about 25%, sand/gravel 15%, and dense wet clay or rock 35%. Ignoring swell is the classic way to under-order trucks.",
      "Truckloads round up on heaped capacity: a 10-yd tandem legally hauls about 10 loose yards, so 47 loose yards needs 5 loads.",
    ],
    faqs: [
      { q: "How do you calculate excavation volume?", a: "Bank cubic yards = length × width × depth (ft) ÷ 27. That is the in-situ volume you dig; multiply by (1 + swell%) to get the loose yards you actually haul." },
      { q: "How many cubic yards is a 60x2x3 ft trench?", a: "A 60x2x3 ft trench is 13.3 bank cubic yards (60 × 2 × 3 ÷ 27). In common earth with 25% swell that becomes 16.7 loose yards — two 10-yard tandem loads." },
      { q: "What is soil swell in excavation?", a: "Swell is how much soil expands once dug: about 25% for common earth and clay, 15% for sand and gravel, and 35% for dense wet clay or rock. You dig bank yards but you haul loose yards." },
      { q: "How many yards of dirt fit in a dump truck?", a: "A tandem dump truck hauls about 10 cubic yards, a tri-axle about 14, and an end dump about 18 — all measured in loose (swelled) yards, heaped." },
      { q: "How do you estimate dirt haul truckloads?", a: "Divide your loose cubic yards by the truck's heaped capacity and round up. For example, 47 loose yards needs 5 loads in a 10-yard tandem." },
    ],
    howTo: "Pick the dig type, enter dimensions, set soil swell and truck size bank yards, loose yards, and loads update live.",
  },
  {
    id: "retaining-wall-block",
    slug: "retaining-wall-block",
    title: "Retaining Wall Block & Geogrid Estimator",
    seoTitle: "Retaining Wall Calculator – Block, Cap & Geogrid",
    shortDescription:
      "Retaining wall calculator: SRW block courses, cap units, drainage stone tons, base rock, and geogrid for segmental retaining walls fast. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["retaining wall calculator", "retaining wall block calculator", "srw block estimator", "segmental retaining wall", "geogrid calculator", "landscape wall estimator", "how many blocks for a retaining wall", "when does a retaining wall need geogrid", "retaining wall drainage stone", "wall cap calculator", "block wall courses", "retaining wall materials list"],
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
      { q: "How many blocks for a 40 ft long, 3 ft high retaining wall?", a: "A 40x3 ft wall in 6x16 in block needs 7 courses (3 ft exposed + 1 buried 6-in course = 3.5 ft ÷ 0.5 ft) × 30 blocks per course = 210, plus 5% waste = 221 blocks. Add 32 cap units." },
      { q: "When does a retaining wall need geogrid?", a: "Segmental walls over 4 ft of exposed height need geogrid reinforcement — typically one layer every 2 courses, embedded back 0.7 times the wall height. Most codes also require an engineered design above 4 ft." },
      { q: "How much drainage stone behind a retaining wall?", a: "Plan a 12-in-wide column of 3/4-in crushed stone behind the full exposed height. A 40x3 ft wall needs about 2.5 tons at 1.4 tons per cubic yard, plus base-pad rock." },
      { q: "How many courses do I need for a 3 ft retaining wall?", a: "Total height = exposed height + buried base courses (default 1). A 3 ft exposed wall in 6-in block is 3.5 ft ÷ 0.5 ft = 7 courses, since courses always round up." },
      { q: "How do you calculate retaining wall block?", a: "Blocks = courses × blocks per course, then add waste. Courses = ceiling(total height ÷ block height); blocks per course = ceiling(wall length ÷ block length)." },
    ],
    howTo: "Enter length and exposed height, pick block face size blocks, caps, drainage tons, and geogrid update live.",
  },
  {
    id: "asphalt-paving",
    slug: "asphalt-paving",
    title: "Asphalt Paving & Driveway Estimator",
    seoTitle: "Asphalt Calculator – Driveway Tons & Base Rock",
    shortDescription:
      "Asphalt calculator: hot-mix tonnage and crushed aggregate base for driveways, lots, and pads from area, asphalt depth, and base depth. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Paving",
    tags: ["asphalt calculator", "asphalt tonnage calculator", "driveway calculator", "hot mix asphalt estimator", "paving calculator", "how many tons of asphalt for a driveway", "how thick should an asphalt driveway be", "asphalt coverage per ton", "hma tons formula", "aggregate base tons", "parking lot paving estimator", "driveway resurfacing calculator"],
    iconName: "Layers",
    formulaSummary: "Tons = sq yd × 110 lbs × inches ÷ 2000",
    inputsSummary: "Area · asphalt + base depth",
    outputs: ["HMA tons", "Base tons", "Square yards"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Compacted hot-mix weighs about 145 lbs per cubic foot 110 lbs per square yard per inch of thickness. A 600 sq ft driveway at 3 in needs about 11 tons with 5% waste.",
      "The aggregate sub-base uses crusher-run density (1.62 tons/cu yd) plus a 10% compaction allowance: 4 in for light duty, 6 in standard, 8 in heavy duty.",
      "Resurface work typically goes 2 in over existing pavement; new residential driveways want 3 in of asphalt over 6 in of base.",
    ],
    faqs: [
      { q: "How many tons of asphalt for a 50x12 ft driveway at 3 inches?", a: "A 50x12 ft driveway is 66.7 sq yd. At 3 in thick: 66.7 × 110 × 3 ÷ 2000 = 11 tons, or about 11.6 tons with 5% waste. Add roughly 6.7 tons of 6-in aggregate base." },
      { q: "How thick should a residential asphalt driveway be?", a: "3 inches of compacted hot-mix over 6 inches of compacted crusher-run base is the standard for residential driveways. Resurfacing over sound pavement can go 2 inches." },
      { q: "How much does a ton of asphalt cover?", a: "One ton of hot-mix covers about 36 sq ft at 3 in thick (2000 ÷ 110 ÷ 3 × 9). At 2 in thick it covers about 54 sq ft per ton." },
      { q: "How do you calculate asphalt tonnage?", a: "Tons = square yards × 110 lbs × thickness in inches ÷ 2000. Compacted hot-mix weighs about 145 lbs per cubic foot, which works out to 110 lbs per square yard per inch." },
      { q: "How much base rock goes under asphalt?", a: "Use 4 in of crusher-run for light duty, 6 in standard residential, or 8 in heavy duty, at 1.62 tons per cubic yard plus a 10% compaction allowance." },
    ],
    howTo: "Enter the paved area, pick asphalt and base thickness HMA tons, base tons, and square yards update live.",
  },
  {
    id: "aggregate-stone-tonnage",
    slug: "aggregate-stone-tonnage",
    title: "Aggregate & Stone Tonnage Calculator",
    seoTitle: "Gravel Calculator – Tons, Yards & Coverage",
    shortDescription:
      "Gravel calculator: compacted tons of crushed stone, road base, sand, and decomposed granite from area and depth, with compaction allowance. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Earthwork",
    tags: ["gravel calculator", "stone tonnage calculator", "aggregate calculator", "crushed stone estimator", "how many tons of gravel do i need", "how much does a cubic yard of gravel cover", "crusher run calculator", "57 stone tons per yard", "driveway gravel estimator", "road base tons", "decomposed granite calculator", "sand tonnage calculator", "gravel compaction allowance"],
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
      "Order tons round up to the half ton quarries batch by the ton and short loads cost more per ton.",
    ],
    faqs: [
      { q: "How many tons of gravel do I need?", a: "Tons = compacted cubic yards × material density. Compacted yards = loose yards + the compaction allowance (10% gravel, 15% crusher run, 20% fines), times density — #57 stone ≈ 1.42 tons/yd." },
      { q: "How much does a cubic yard of gravel cover?", a: "A cubic yard holds 27 cu ft, so at 3 in deep it covers about 108 sq ft (27 ÷ 0.25) before compaction. At 4 in deep it covers about 81 sq ft — always order compacted, not loose, yards." },
      { q: "How many tons of gravel for a 24x12 ft driveway at 4 inches?", a: "A 24x12 ft area at 4 in is 3.56 loose cubic yards. With 10% compaction that is 3.91 yards × 1.42 tons/yd = 5.5 tons of #57 stone, rounded up to 6 tons." },
      { q: "How many tons are in a cubic yard of crusher run?", a: "Dense graded crusher run weighs about 1.62 tons per cubic yard (≈120 lbs/cu ft). #57 gravel is lighter at 1.42, mason sand 1.35, decomposed granite 1.55." },
      { q: "Do I add extra for compaction when ordering gravel?", a: "Yes — order compacted yards, not loose. Add 10% for gravel, 15% for crusher run and base, and 20% for decomposed granite or fines, which compact the most." },
    ],
    howTo: "Enter the area, set thickness, pick the material tons, loose vs. compacted yards, and delivered cost update live.",
  },
  {
    id: "deck-joist-post",
    slug: "deck-joist-post",
    title: "Decking, Joist & Post Estimator",
    seoTitle: "Deck Material Calculator – Boards, Joists & Cost",
    shortDescription:
      "Deck material calculator: field joists, rim and ledger boards, decking planks, posts, concrete, and fasteners for any residential deck. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Decks",
    tags: ["deck material calculator", "deck cost calculator", "deck board calculator", "deck joist calculator", "how many deck boards do i need", "how do you estimate deck lumber", "how much does a deck cost", "deck framing estimator", "composite decking calculator", "deck post footing calculator", "deck lumber takeoff", "pressure treated deck estimator"],
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
      "Decking planks run across the projection: ceiling(projection in inches ÷ 5.75) × 1.10 the 5.5 in face plus ¼ in gap, with 10% cut waste.",
      "Posts = (ceiling(width ÷ post spacing) + 1) × ceiling(projection ÷ post spacing), with 2 eighty-pound concrete bags per footing.",
    ],
    faqs: [
      { q: "How many deck boards do I need?", a: "Boards run across the projection: ceiling(projection in inches ÷ 5.75) × 1.10. A 16x12 ft deck needs ceil(144 ÷ 5.75) = 26 courses × 1.10 waste = 29 planks, each 16 ft long." },
      { q: "How do you estimate deck lumber?", a: "Field joists = ceiling(width in inches ÷ spacing) + 1 starter joist. Rim and ledger = 2 × width + 2 × projection in 16-ft stock. Posts = (ceiling(width ÷ post spacing) + 1) × ceiling(projection ÷ post spacing)." },
      { q: "How many joists for a 16x12 ft deck at 16 in O.C.?", a: "Ceil(192 ÷ 16) + 1 = 13 field joists, plus 4 rim and ledger boards in 16-ft stock (2×16 + 2×12 = 56 lin ft ÷ 16)." },
      { q: "How many concrete bags per deck post footing?", a: "Two 80-lb bags per post is the standard for a 36-in-deep footing. A 6-post deck needs 12 bags." },
      { q: "How much does a deck cost?", a: "Enter your local board, lumber, and concrete prices and the calculator totals the material cost from the full bill of materials — joists, planks, posts, concrete, and fasteners with waste included." },
    ],
    howTo: "Enter deck width and projection, pick joist spacing and board type joists, planks, posts, and concrete update live.",
  },
  {
    id: "fence-gate-estimator",
    slug: "fence-gate-estimator",
    title: "Wood & Chain-Link Fence Estimator",
    seoTitle: "Fence Calculator – Pickets, Posts & Concrete",
    shortDescription:
      "Fence calculator: posts, rails, pickets or chain-link rolls, gate kits, and fast-set concrete for wood and chain-link fences in minutes. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Fencing",
    tags: ["fence calculator", "fence picket calculator", "wood fence estimator", "how many fence pickets do i need", "how many posts for a fence", "chain link fence calculator", "privacy fence estimator", "fence post concrete bags", "fence rail calculator", "fence gate estimator", "linear feet fence takeoff", "cedar fence materials"],
    iconName: "BrickWall",
    formulaSummary: "Pickets = L×12 ÷ (W + gap) → +10%",
    inputsSummary: "Fence run · height · type",
    outputs: ["Posts", "Rails", "Pickets / rolls", "Concrete bags"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Posts = ceiling(sections) + 1, plus 1 per single gate and 2 per double-drive gate. Every post hole takes 2 sixty-pound fast-set bags.",
      "Wood rails = sections × rails per section × 1.05 in 8-ft stock 2 rails for 4-ft fence, 3 for 6-ft and up.",
      "Pickets = (linear feet × 12) ÷ (picket width + ¼ in gap) × 1.10 cut waste. Chain-link swaps pickets and rails for 50-ft fabric rolls.",
    ],
    faqs: [
      { q: "How many fence pickets do I need?", a: "Pickets = (linear feet × 12) ÷ (picket width + ¼ in gap) × 1.10 cut waste. For 150 ft of privacy fence with 5.5 in pickets: (150 × 12) ÷ 5.75 = 313 × 1.10 = 345 pickets." },
      { q: "How many posts for a fence?", a: "Posts = ceiling(sections) + 1, plus 1 per single gate and 2 per double-drive gate. A 150 ft run at 8-ft sections needs ceil(150 ÷ 8) + 1 = 20 posts, plus gate posts." },
      { q: "How many concrete bags per fence post?", a: "Two 60-lb fast-setting bags per hole is standard for 4x4 wood posts. A 20-post run needs 40 bags." },
      { q: "How many rolls of chain-link for 150 ft of fence?", a: "Chain-link fabric comes in 50-ft rolls, so 150 ft needs 3 rolls — plus posts at 8–10 ft O.C. and a top rail." },
      { q: "How many rails does a wood fence need?", a: "Rails = sections × rails per section × 1.05 in 8-ft stock. Use 2 rails for a 4-ft fence and 3 rails for 6 ft and up." },
    ],
    howTo: "Pick wood or chain-link, enter the run and height, add gates posts, rails, pickets, and concrete update live.",
  },
  {
    id: "paver-patio-sand",
    slug: "paver-patio-sand",
    title: "Interlocking Paver, Bedding & Polymeric Sand",
    seoTitle: "Paver Calculator – Units, Base & Sand",
    shortDescription:
      "Paver calculator: paver units, crushed base tons, 1-in bedding sand, and polymeric joint sand for any patio, walkway, or driveway fast. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Hardscape",
    tags: ["paver calculator", "patio paver calculator", "how many pavers do i need for a patio", "interlocking paver estimator", "paver base calculator", "polymeric sand calculator", "hardscape estimator", "brick paver quantity", "patio base rock tons", "bedding sand calculator", "walkway paver estimator"],
    iconName: "LayoutGrid",
    formulaSummary: "Pavers = gross area ÷ paver size",
    inputsSummary: "Patio area · paver size",
    outputs: ["Paver units", "Base tons", "Poly sand bags"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Paver units = gross area (net × (1 + waste%)) ÷ paver face area. A 280 sq ft patio in 4×8 brick needs about 1,323 units at 5% waste.",
      "Compacted base = net area × (base depth ÷ 12) ÷ 27 × 1.6 tons/yd × 1.10 compaction 4 in for walkways, 6 in for driveways.",
      "Bedding is a fixed 1-in screed sand bed per ICPI at 1.35 tons/yd. Polymeric sand: 1 fifty-pound bag per 75 sq ft of ⅛-in joints, 35 sq ft for wide ⅜-in joints.",
    ],
    faqs: [
      { q: "How many pavers do I need for a patio?", a: "Paver units = gross area (net × (1 + waste%)) ÷ paver face area. A 280 sq ft patio in 4×8 brick needs about 1,323 units at 5% waste; 12×12 slabs need only 294." },
      { q: "How much base rock goes under pavers?", a: "Compacted base = net area × (base depth ÷ 12) ÷ 27 × 1.6 tons/yd × 1.10 compaction. A 280 sq ft patio at 4 in needs about 6.1 tons of crushed base. Use 4 in for walkways, 6 in for driveways." },
      { q: "How much polymeric sand do I need?", a: "One 50-lb bag covers about 75 sq ft of ⅛-in joints, or 35 sq ft of wide ⅜-in joints. A 294 sq ft patio with narrow joints needs 4 bags." },
      { q: "How deep should the paver base be?", a: "4 inches of compacted crushed base for walkways and patios, 6 inches for driveways, each with a 10% compaction allowance at 1.6 tons per cubic yard." },
      { q: "How much bedding sand goes under pavers?", a: "A fixed 1-in screed sand bed per ICPI at 1.35 tons per cubic yard — about 1.2 tons for a 280 sq ft patio." },
    ],
    howTo: "Enter the patio area, pick paver size, base depth, and joint width units, base tons, and sand bags update live.",
  },
  {
    id: "siding-housewrap",
    slug: "siding-housewrap",
    title: "Exterior Siding & Housewrap Estimator",
    seoTitle: "Siding Calculator – Squares & Housewrap",
    shortDescription:
      "Siding calculator: siding squares, housewrap rolls, starter strips, and corner posts from wall perimeter, gables, and all openings fast. Free, no sign-up.",
    category: "site-exterior",
    subtrade: "Siding",
    tags: ["siding calculator", "vinyl siding estimator", "how many squares of siding do i need", "housewrap calculator", "fiber cement siding estimator", "siding squares formula", "hardie board calculator", "siding waste percentage", "cladding takeoff", "starter strip calculator", "tyvek rolls estimator", "exterior siding materials"],
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
      "Housewrap = ceiling(net × 1.15 ÷ 900) 9×100-ft rolls with 6-in overlaps. Starter strips = ceiling(perimeter ÷ 10) in 10-ft pieces.",
    ],
    faqs: [
      { q: "How many squares of siding do I need?", a: "Squares = ceiling(net area × (1 + waste%) ÷ 100). A 160 ft perimeter with 9 ft walls, 2 gables, and ~312 sq ft of openings nets 1,272 sq ft — 14 squares at 10% waste." },
      { q: "How do you measure a house for siding?", a: "Net cladding area = (perimeter × height) + gables (½ × base × peak) − openings: 15 sq ft per window, 120 per garage door, 21 per entry door." },
      { q: "How many rolls of housewrap for a house?", a: "Rolls = ceiling(net area × 1.15 ÷ 900) in 9×100-ft rolls, allowing for 6-in overlaps. A 1,272 sq ft net wall needs 2 rolls." },
      { q: "How do you calculate siding waste?", a: "10% covers cuts and starter waste on simple rectangles. Bump to 15% for multi-gable or highly cut-up elevations with lots of windows." },
      { q: "How many starter strips do I need for siding?", a: "Starter strips = ceiling(perimeter ÷ 10) in 10-ft pieces — one full course around the base of every wall." },
    ],
    howTo: "Enter perimeter, height, gables, and openings siding squares, housewrap rolls, and trim update live.",
  },

  /* ---------------- MEP Quick-Check Estimators ---------------- */
  {
    id: "conduit-fill-voltage-drop",
    slug: "conduit-fill-voltage-drop",
    title: "Conduit Fill & Voltage Drop Sizer",
    seoTitle: "Voltage Drop Calculator – Wire Size & NEC Check",
    shortDescription:
      "Voltage drop calculator and conduit fill checker for branch circuits. Flags NEC violations live and picks the right wire and conduit size. Free, no sign-up.",
    category: "mep",
    subtrade: "Electrical",
    tags: ["voltage drop calculator", "conduit fill calculator", "wire size calculator", "how do you calculate voltage drop?", "what is the NEC conduit fill rule?", "how many wires can you put in conduit?", "nec conduit fill", "voltage drop chart", "conduit fill chart", "thhn wire", "branch circuit sizing", "nec chapter 9 table 1", "wire gauge calculator", "electrical conduit fill"],
    iconName: "Zap",
    formulaSummary: "Ft = run × conductors × 1.1",
    inputsSummary: "Run length + conductors",
    outputs: ["NEC fill %", "Voltage drop %", "Recommended size"],
    badge: "NEC Reference",
    estimatedTime: "< 2 min",
    available: true,
    howTo: "Pick conduit fill or voltage drop mode, enter the circuit the sizer flags NEC violations live.",
    details: [
      "NEC Chapter 9 Table 1: 53% fill for 1 wire, 31% for 2 wires, 40% for 3+ wires. Overfill is a code violation.",
      "Voltage drop = 2 × K × I × L ÷ circular mils (√3 factor for 3-phase). NEC recommends ≤ 3% on branch circuits.",
      "Recommendations pick the smallest stock conduit / wire gauge that clears the limit.",
    ],
    faqs: [
      { q: "How do you calculate voltage drop?", a: "Single-phase: Vd = 2 × K × I × L ÷ circular mils, where K is 12.9 for copper and 21.2 for aluminum; use √3 instead of 2 for three-phase. The tool runs this against your run length, load, and wire gauge, then flags drops over the NEC's recommended 3% for branch circuits." },
      { q: "What is the NEC conduit fill rule?", a: "NEC Chapter 9 Table 1 limits fill to 53% for one wire, 31% for two wires, and 40% for three or more wires — overfill is a code violation. Enter your conductors and the tool checks your raceway against these limits live." },
      { q: "How many wires can you put in conduit?", a: "It depends on the wire sizes and the conduit's inside diameter — the tool applies NEC Chapter 9 fill percentages to your exact conductor mix and tells you whether the raceway clears or violates. Verify against the NEC edition your AHJ enforces before pulling wire." },
      { q: "What wire size do I need to limit voltage drop to 3%?", a: "Pick voltage-drop mode, enter run length and load amps, and the sizer recommends the smallest stock wire gauge that holds drop at or under 3% on the branch circuit. NEC recommends ≤ 3% on branch circuits (5% total feeder plus branch) as a design fine-print note." },
      { q: "What is the maximum voltage drop allowed?", a: "The NEC recommends a maximum 3% drop on branch circuits and 5% combined for feeder plus branch, as a fine-print design note rather than a hard rule. The tool flags anything over 3% on branch runs so you can upsize the wire or shorten the run." },
    ],
  },
  {
    id: "hvac-btu-tonnage",
    slug: "hvac-btu-tonnage",
    title: "HVAC BTU Load & AC Tonnage Sizer",
    seoTitle: "BTU Calculator – AC Tonnage & Load Sizer",
    shortDescription:
      "BTU calculator for heating and cooling loads with AC tonnage from sq ft, climate zone, and insulation quality. Rounds up to the half ton. Free, no sign-up.",
    category: "mep",
    subtrade: "HVAC",
    tags: ["btu calculator", "ac tonnage calculator", "hvac load calculator", "how many BTUs do I need per square foot?", "how many tons of AC do I need?", "btu per square foot", "ac sizing calculator", "manual j", "hvac tonnage chart", "how many tons of ac for 1800 sq ft", "cfm per ton", "furnace sizing", "mini split btu calculator", "heat load calculator"],
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
      "Tonnage rounds UP to the nearest half ton (12,000 BTU = 1 ton) and airflow runs ≈400 CFM per ton. These are bid-scoping rules of thumb confirm with an ACCA Manual J.",
    ],
    faqs: [
      { q: "How many BTUs do I need per square foot?", a: "Cooling rule of thumb: 32.5 BTU/sq ft in hot/humid zones 1–2, 27.5 in moderate zones 3–4, and 22 in cold zones 5–7, adjusted for ceiling height, insulation, and sun exposure. The tool applies your climate zone plus occupancy and shading adjustments automatically." },
      { q: "How many tons of AC do I need?", a: "Divide total cooling BTU by 12,000 (1 ton) and round UP to the nearest half ton — an 1,800 sq ft home in a moderate zone lands near 4.5 tons. The tool sizes tonnage and estimates ≈ 400 CFM per ton for duct planning." },
      { q: "How much CFM per ton of AC?", a: "About 400 CFM per ton — a 3-ton system needs roughly 1,200 CFM of airflow. Undersized ductwork is the most common cause of poor cooling." },
      { q: "How many BTUs do I need for an 1,800 sq ft house?", a: "In a moderate zone (27.5 BTU/sq ft): 1,800 × 27.5 = 49,500 BTU/hr base; with average insulation and 4 occupants the tool lands around 50,300 BTU/hr → 4.5 tons. Confirm final equipment selection with an ACCA Manual J." },
      { q: "How does insulation quality affect HVAC sizing?", a: "Poor insulation adds ~20% to the load; a high-efficiency envelope cuts ~15%. Heavy sun exposure adds ~10%, heavy shade subtracts ~10%. These are bid-scoping rules of thumb — confirm with a Manual J before ordering equipment." },
    ],
    howTo: "Enter floor area and ceiling height, pick climate zone, insulation, and sun exposure BTU loads, tonnage, and CFM update live.",
  },
  {
    id: "recessed-lights",
    slug: "recessed-lights",
    title: "Recessed Light Layout",
    seoTitle: "Recessed Lighting Calculator – Layout & Spacing",
    shortDescription:
      "Recessed lighting calculator that sizes fixture counts and even spacing grids from room size. Enter target spacing — the grid solves live. Free, no sign-up.",
    category: "mep",
    subtrade: "Electrical",
    tags: ["recessed lighting calculator", "can light calculator", "how many recessed lights do I need per room?", "recessed light spacing", "can light spacing calculator", "downlight layout", "led recessed lighting", "how far apart should recessed lights be", "recessed lighting layout", "kitchen can light spacing", "living room recessed lights", "6 inch recessed light spacing", "recessed light calculator per room"],
    iconName: "Lightbulb",
    formulaSummary: "Rows = W ÷ spacing, Cols = L ÷ spacing",
    inputsSummary: "Room L × W",
    outputs: ["Fixture count", "Spacing grid"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Even grid: columns = round(length ÷ target spacing), rows = round(width ÷ target spacing) — a 16×12 ft room at 5 ft target gets 3 × 2 = 6 fixtures.",
      "Rule of thumb: space cans about half the ceiling height apart — 4–5 ft for 8–9 ft ceilings, 6 ft for 10 ft ceilings.",
      "Keep the first row half a spacing from the wall so corners don't go dark.",
      "Actual spacing is recomputed from the even grid, so fixtures land on a clean layout."
    ],
    howTo: "Enter room length and width plus your target spacing — fixture count and the actual even grid solve live.",
    faqs: [
      { q: "How many recessed lights do I need per room?", a: "It depends on room size and target spacing — a 16×12 ft room at 5 ft spacing needs 3 columns × 2 rows = 6 fixtures. Enter your room dimensions and the tool computes the count plus the actual even grid." },
      { q: "How far apart should recessed lights be?", a: "Rule of thumb: space cans about half the ceiling height apart — 4 ft for 8 ft ceilings, 5–6 ft for 9–10 ft ceilings. The tool recomputes actual spacing from the even grid so fixtures land on a clean layout." },
      { q: "How far from the wall should the first recessed light be?", a: "Half the fixture spacing — about 2–3 ft — so walls get an even wash without dark corners." },
      { q: "How many can lights for a 12x16 room?", a: "At 5 ft target spacing: 3 columns × 2 rows = 6 fixtures on a 5.3 × 6 ft actual grid." },
      { q: "Do recessed lights need to be evenly spaced?", a: "Yes — even spacing avoids bright and dark patches. The tool rounds your target spacing into a whole number of columns and rows, then recomputes the actual spacing so every fixture lands on a clean grid." },
    ],
  },
  {
    id: "pex-pipe-plumbing",
    slug: "pex-pipe-plumbing",
    title: "PEX Pipe Runs & WSFU Sizer",
    seoTitle: "PEX Pipe Size Calculator – WSFU & Main Sizer",
    shortDescription:
      "PEX pipe size calculator for water supply: WSFU fixture-unit totals size the main, with coil footage, manifold ports, and fitting packs. Free, no sign-up.",
    category: "mep",
    subtrade: "Plumbing",
    tags: ["pex pipe size calculator", "what size pex pipe do i need?", "pex tubing calculator", "wsfu calculator", "pex manifold calculator", "fixture units plumbing", "pex pipe sizing chart", "home run pex system", "trunk and branch pex", "1/2 pex vs 3/4 pex", "pex fittings calculator", "residential plumbing calculator", "ipc water supply fixture units"],
    iconName: "Pipette",
    formulaSummary: "WSFU sum → ¾″ or 1″ main",
    inputsSummary: "Fixture counts + run",
    outputs: ["PEX coils", "Main size", "Fitting packs"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "IPC water supply fixture units: full bath 3.5, half bath 1.5, kitchen 2.0, laundry 2.0, hose bibb 2.5. At or under 14 WSFU a ¾-in main suffices; above that, step up to 1-in.",
      "½-in PEX footage = connections × average run × 1.15 slack toilets and hose bibbs pull cold only, dishwashers hot only.",
      "Home-run systems get dedicated manifold ports per connection; trunk-and-branch doubles the main trunk allowance.",
    ],
    faqs: [
      { q: "What size PEX pipe do I need?", a: "Size the main from total water supply fixture units (WSFU): at or under 14 WSFU a ¾-in main suffices; above that, step up to 1-in. The tool totals your fixtures and recommends the main size automatically." },
      { q: "What size PEX main do I need for a 2-bath house?", a: "2 full baths (7.0) + 1 half bath (1.5) + kitchen (2.0) + laundry (2.0) + 2 hose bibbs (5.0) = 17.5 WSFU — over 14, so run a 1-in main supply." },
      { q: "How much PEX tubing do I need per fixture?", a: "Count hot and cold connections per fixture, multiply by the average run from the manifold, and add 15% for snaking and slack — a typical 2-bath home-run needs about nine hundred-foot coils." },
      { q: "Home run vs trunk and branch PEX — which should I use?", a: "Home run gives each fixture a dedicated ½-in line back to a central manifold (best pressure, more tubing); trunk and branch runs a ¾-in main through the house with short ½-in branches (less tubing, more fittings). The tool prices out both with manifold ports and fitting packs." },
      { q: "How many fixture units is a bathroom?", a: "Per IPC water supply fixture units: a full bath is 3.5, a half bath 1.5, a kitchen 2.0, laundry 2.0, and each hose bibb 2.5. Verify fixture-unit values against the plumbing code your AHJ enforces." },
    ],
    howTo: "Pick home-run or trunk-and-branch, count fixtures, set run distance WSFU, main size, coils, and fittings update live.",
  },
  {
    id: "insulation-batt-roll",
    slug: "insulation-batt-roll",
    title: "Insulation Batt, Cellulose & R-Value Sizer",
    seoTitle: "Insulation Calculator – Batts, Bags & R-Value",
    shortDescription:
      "Insulation calculator for batt bundles or blown cellulose bags from target R-value. Net area, framing deductions, and installed thickness included. Free, no sign-up.",
    category: "finishes",
    subtrade: "Insulation",
    tags: ["insulation calculator", "how much insulation do I need?", "batt insulation calculator", "blown insulation calculator", "r-value calculator", "how many bags of insulation for attic", "cellulose insulation calculator", "fiberglass batt calculator", "attic insulation calculator", "r-38 insulation", "r-49 insulation", "insulation coverage chart", "how thick should attic insulation be"],
    iconName: "Layers",
    formulaSummary: "Bags = net area × 1.05 ÷ coverage",
    inputsSummary: "Area · R-value · type",
    outputs: ["Bags / bundles", "Thickness", "Net area"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Wall cavity area deducts 10% for framing; attics and crawlspaces count full area. Batt bundle coverage runs ~125 sq ft/bag at R-13 down to ~32 sq ft/bag at R-49.",
      "Blown cellulose: about 1.13 bags per 1,000 sq ft per R point R-38 takes ~43 bags/1,000 sq ft at 10.6 in settled, R-49 ~55 bags at 13.6 in.",
      "Framing spacing picks batt width: 15-in batts for 16 in O.C., 23-in for 24 in O.C.",
    ],
    faqs: [
      { q: "How much insulation do I need?", a: "It depends on area and target R-value — the tool deducts framing, applies 5% waste, and converts net area into batt bundles or blown-cellulose bags with installed thickness. For example, a 1,200 sq ft attic at R-38 needs about 40 bags of blown cellulose." },
      { q: "How many bags of insulation for a 1,200 sq ft attic at R-38?", a: "About 40 bags: (1,200 ÷ 1,000) × 31 × 1.05 ≈ 40 bags of 30-lb cellulose, settling to roughly 13 in thick. The tool runs this math for any area and R-value." },
      { q: "What R-value do I need for attic insulation?", a: "DOE recommends R-38 to R-49 for attics in most US climate zones (R-30 minimum in hot zones 1–2); walls run R-13 to R-15 in 2×4 and R-19 to R-21 in 2×6 framing." },
      { q: "How many batts do I need for R-19 walls?", a: "R-19 batt bundles cover about 88 sq ft each — a 1,000 sq ft wall (900 net after the 10% framing deduction) needs 11 bundles with waste. Framing spacing picks batt width: 15-in batts for 16 in O.C., 23-in for 24 in O.C." },
      { q: "Blown cellulose vs fiberglass batts — which covers more per bag?", a: "Batt bundle coverage runs ~125 sq ft/bag at R-13 down to ~32 sq ft/bag at R-49; blown cellulose runs about 1.13 bags per 1,000 sq ft per R point (R-49 ≈ 55 bags/1,000 sq ft at 13.6 in settled). The tool compares both from your target R-value." },
    ],
    howTo: "Pick the application and insulation type, enter area, set the target R-value bags, thickness, and net area update live.",
  },
  {
    id: "baseboard-crown-molding",
    slug: "baseboard-crown-molding",
    title: "Crown Molding, Baseboard & Miter Cut Estimator",
    seoTitle: "Baseboard Calculator – Trim Boards, Cuts & Caulk",
    shortDescription:
      "Baseboard calculator: enter your room perimeter and corner count to get trim boards, miter cut counts, and caulk tubes with waste included. Free, no sign-up.",
    category: "finishes",
    subtrade: "Trim & Millwork",
    tags: ["baseboard calculator", "how much baseboard do I need", "crown molding calculator", "how much crown molding do I need", "trim calculator", "miter cut calculator", "baseboard estimator", "how many miter cuts for crown molding", "caulk calculator", "how much caulk for trim", "millwork estimator", "linear feet trim calculator"],
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
      { q: "How much baseboard do I need?", a: "For a 14x10 ft room: perimeter is 48 lin ft x 1.10 waste = 52.8 ft, so ceil(52.8 / 16) = 4 sixteen-foot boards, plus 1 tube of caulk." },
      { q: "How many miter cuts do I need for crown molding?", a: "Each corner needs 2 miter cuts — a square room means 8 miters. Add scarf joints (2 bevel cuts each) wherever a wall run exceeds your stock board length." },
      { q: "How much crown molding waste should I add?", a: "Crown molding defaults to 15% waste for compound-miter miscuts; baseboard uses 10%. Boards are rounded up to whole stock lengths either way." },
      { q: "How much caulk do I need for trim?", a: "One 10-oz tube of painter's caulk seals about 75 linear feet of trim, covering both the top and bottom edges." },
      { q: "How many boards of crown molding do I need for a room?", a: "Boards = ceiling(perimeter x (1 + waste%) / stock length). The tool applies the 15% crown waste factor and rounds up so you never come up short." },
    ],
    howTo: "Enter the room size, corners, and stock length boards, cut counts, and caulk tubes update live.",
  },
  {
    id: "ceiling-texture-drywall",
    slug: "ceiling-texture-drywall",
    title: "Ceiling Texture, Popcorn & Drywall Mud Sizer",
    seoTitle: "Drywall Calculator – Texture, Mud & Primer Estimator",
    shortDescription:
      "Drywall calculator: size texture bags or mud buckets, PVA primer gallons, and mixing water for any finish level, knockdown to Level 5 skim. Free, no sign-up.",
    category: "finishes",
    subtrade: "Drywall",
    tags: ["drywall calculator", "ceiling texture calculator", "how much texture for a ceiling", "knockdown texture calculator", "popcorn ceiling calculator", "how much mud for drywall", "level 5 skim coat calculator", "drywall primer calculator", "pva primer calculator", "how much primer for new drywall", "texture bags calculator", "joint compound estimator"],
    iconName: "Paintbrush",
    formulaSummary: "Units = area × 1.10 ÷ coverage",
    inputsSummary: "Area · style · depth",
    outputs: ["Bags / buckets", "Primer gal", "Mix water"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Medium-depth coverage: knockdown/orange peel ≈ 550 sq ft per 50-lb bag, popcorn ≈ 350 sq ft per 40-lb bag, Level 5 skim ≈ 375 sq ft per 4.5-gal bucket all with 10% waste.",
      "Light application stretches coverage ~25%; heavy cuts it ~20%.",
      "PVA primer seals at 350 sq ft per gallon. Dry-mix bags need about 5 gallons of mixing water each; premixed buckets need none.",
    ],
    faqs: [
      { q: "How much knockdown texture do I need for a ceiling?", a: "A 900 sq ft ceiling at medium depth needs ceil(900 x 1.10 / 550) = 2 fifty-pound bags, plus 3 gallons of PVA primer and 10 gallons of mixing water." },
      { q: "How much primer do I need for new drywall?", a: "PVA drywall primer covers about 350 sq ft per gallon to seal raw drywall and texture before the topcoat — always prime before painting." },
      { q: "How much joint compound do I need for a Level 5 skim coat?", a: "A 4.5-gallon bucket covers about 375 sq ft at medium depth. For 900 sq ft, ceil(990 / 375) = 3 buckets with 10% waste included." },
      { q: "How does texture depth change coverage?", a: "A light application stretches coverage about 25%, while a heavy application cuts it about 20% — the calculator adjusts bag counts for the depth you pick." },
      { q: "Do I need water for drywall texture?", a: "Dry-mix bags need about 5 gallons of mixing water each; premixed buckets need none. The tool totals water only for the dry-mix styles you select." },
    ],
    howTo: "Enter the surface area, pick texture style and depth bags or buckets, primer gallons, and mixing water update live.",
  },

  /* ---------------- Bidding, Markup & Financials ---------------- */
  {
    id: "contractor-markup-margin",
    slug: "contractor-markup-margin",
    title: "Markup vs. Margin Calculator",
    seoTitle: "Markup vs Margin Calculator for Contractors",
    shortDescription:
      "Markup vs margin calculator that converts between markup and margin, prices jobs from direct cost, and shows true net profit after overhead. Free, no sign-up.",
    category: "financial-business",
    subtrade: "Pricing",
    tags: ["markup vs margin calculator", "construction markup calculator", "contractor profit margin calculator", "how to convert margin to markup", "what is the difference between markup and margin", "markup to margin conversion", "contractor markup percentage", "bid price calculator", "construction pricing calculator", "gross margin calculator", "net profit calculator", "contractor overhead calculator", "how to price a construction job"],
    iconName: "Percent",
    formulaSummary: "Price = cost ÷ (1 − margin)",
    inputsSummary: "Cost + markup/margin",
    outputs: ["Bid price", "Margin %", "Markup %", "Net profit"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: true,
    howTo: "Enter direct job costs and a target margin or markup the bid price, equivalents, and true net profit solve live.",
    details: [
      "Margin is profit ÷ price; markup is profit ÷ cost. A 30% markup is only a 23% margin the #1 pricing mistake in contracting.",
      "Bid from margin: price = cost ÷ (1 − margin). Bid from markup: price = cost × (1 + markup).",
      "Net true profit = gross profit − overhead recovery. One click applies the markup to your Master Bid.",
    ],
    faqs: [
      { q: "What is the difference between markup and margin?", a: "Markup is profit divided by cost; margin is profit divided by selling price. A 30% markup equals only a 23.1% margin, so bidding from markup while thinking in margin leaves money on the table." },
      { q: "How do you calculate markup in construction?", a: "Markup = (price - cost) / cost, applied as price = cost x (1 + markup). Enter your direct job costs and the calculator solves bid price, markup %, and margin % live." },
      { q: "How do you convert margin to markup?", a: "Markup = margin / (1 - margin), and margin = markup / (1 + markup). A 25% margin target needs a 33.3% markup on cost to achieve it." },
      { q: "What markup should a contractor charge?", a: "It depends on overhead and profit target - most small contractors land between 20% and 50% markup on direct costs. Enter your overhead % and the calculator shows the net profit your markup actually leaves." },
      { q: "What is a good profit margin for contractors?", a: "10-20% net margin is a healthy range for residential work after overhead is covered. The tool subtracts your overhead from gross profit so you see the true net margin before you bid." },
    ],
  },
  {
    id: "labor-burden-hourly",
    slug: "labor-burden-hourly",
    title: "True Burdened Labor Rate",
    seoTitle: "Labor Burden Rate Calculator for Contractors",
    shortDescription:
      "Labor burden rate calculator that converts a base wage into the true employer cost per billable hour - taxes, comp, PTO, benefits included. Free, no sign-up.",
    category: "financial-business",
    subtrade: "Labor",
    tags: ["labor burden rate calculator", "burdened labor rate", "what is labor burden rate", "true cost of an employee calculator", "construction labor cost calculator", "how to calculate labor burden", "workers comp calculator construction", "contractor hourly rate calculator", "billable hour rate calculator", "fully loaded labor cost", "labor cost multiplier", "field labor rate calculator", "payroll tax calculator construction", "how to price a construction job"],
    iconName: "Users",
    formulaSummary: "Burdened $/hr = total annual cost ÷ billable hrs",
    inputsSummary: "Wage + taxes + comp + PTO + benefits + efficiency",
    outputs: ["True cost per billable hour", "Burden % multiplier", "Annual cost breakdown"],
    badge: "New",
    estimatedTime: "< 3 min",
    available: true,
    details: [
      "Payroll taxes, workers' comp, liability, PTO, and benefits stack on top of every base wage a $28/hr wage typically costs $38–$42/hr to employ.",
      "Billable efficiency (default 80%) shrinks the 2,080-hour year by travel, shop time, weather, and holidays before the rate is computed.",
      "The burden % multiplier shows exactly how much to mark up raw wages so labor pays for itself on every bid.",
    ],
    howTo:
      "Enter the base wage, statutory tax rates, workers' comp per $100 of payroll, and how you carry general liability. Add paid holidays, vacation/sick days, and annual benefits. Set billable efficiency (80% is typical), then size the crew and hours for the bid line. Press Add to Master Estimate to dispatch the burdened labor allocation.",
    faqs: [
      { q: "What is labor burden rate?", a: "The true employer cost of one billable hour: base wage plus payroll taxes, workers' comp, PTO, and benefits, divided by actual billable hours. It is the rate your bids must carry for labor to pay for itself." },
      { q: "Why is the burdened rate so much higher than the wage?", a: "FICA and unemployment taxes add roughly 11%, workers' comp for carpentry and roofing runs $8-$15 per $100 of payroll, PTO is paid non-production time, and only about 80% of the 2,080-hour year is billable. A +35-50% burden is normal." },
      { q: "What billable efficiency should I use?", a: "80% is the industry rule of thumb - it accounts for travel between jobs, material runs, tool maintenance, safety meetings, and weather delays. Far-flung service areas may run 70-75%." },
      { q: "How do you calculate labor burden for a bid?", a: "Add annual wage, taxes, comp, PTO, and benefits to get total annual cost, then divide by billable hours (2,080 x efficiency). The tool outputs the burdened $/hr and a burden % multiplier to apply to raw wages." },
      { q: "Does this replace my accountant's payroll numbers?", a: "No - this is a bidding tool, not a tax filing. State unemployment rates, comp class codes, and benefit costs vary, so tune the inputs with your actual year-end payroll figures and confirm tax treatment with your bookkeeper." },
    ],
  },
  {
    id: "sub-piece-rate",
    slug: "sub-piece-rate",
    title: "Subcontractor Piece-Work & Crew Production",
    seoTitle: "Subcontractor Piece Rate Calculator",
    shortDescription:
      "Subcontractor piece rate calculator that computes total payout, effective hourly yield per worker, and production pace for piece-rate crews. Free, no sign-up.",
    category: "financial-business",
    subtrade: "Labor",
    tags: ["subcontractor piece rate calculator", "piece work calculator", "crew production rate calculator", "effective hourly rate calculator", "construction payout calculator", "roofing square pay calculator", "piece rate vs hourly pay", "labor production rate", "man-hour calculator", "sub payout calculator", "how to pay subcontractors piece work", "production velocity benchmark", "drywall piece rate", "painting piece rate"],
    iconName: "Hammer",
    formulaSummary: "$/hr effective = (qty × rate) ÷ man-hours",
    inputsSummary: "Trade unit + quantity + piece rate + crew + time",
    outputs: ["Total subcontract payout", "Effective $/hr per worker", "Units per man-hour"],
    badge: "New",
    estimatedTime: "< 2 min",
    available: true,
    details: [
      "Total payout = quantity × piece rate: the exact check you'll write the subcontractor.",
      "Effective hourly yield = payout ÷ man-hours: what each installer really earns compare against local wages.",
      "Production velocity (units per man-hour) becomes your benchmark for bidding the next job of the same type.",
    ],
    howTo:
      "Pick the trade's piece unit, enter total quantity and the agreed rate per unit. Add crew size and estimated completion time (in days or hours). Compare the effective hourly yield against local wages if it lands far below market, expect quality or retention problems.",
    faqs: [
      { q: "How do you calculate effective hourly rate from piece work?", a: "Effective $/hr = (quantity x piece rate) / man-hours. The calculator outputs this per worker so you can compare it against local hourly wages for the trade." },
      { q: "What's a fair effective hourly rate for piece work?", a: "It should meet or beat the local hourly wage - piece work usually pays a 10-20% premium since the crew absorbs downtime risk. If the math shows $18/hr effective in a $28/hr market, the rate is too low or the time estimate too generous." },
      { q: "How do I use the production velocity number?", a: "Velocity (units per man-hour) is your bidding benchmark. Record it per crew and trade, then divide the next job's quantity by velocity to estimate man-hours and sanity-check any sub's proposed schedule." },
      { q: "Should I include materials in the piece rate?", a: "This calculator assumes labor-only piece rates. If your sub supplies materials - common in roofing and flooring - add a separate material line from the relevant calculator and keep the piece rate labor-only for clean comparisons." },
      { q: "What happens if the effective rate lands below market wages?", a: "Expect quality or retention problems - good installers won't stay at below-market pay. Raise the piece rate, tighten the time estimate, or rebid the work before the crew walks." },
    ],
  },
  {
    id: "jobsite-breakeven",
    slug: "jobsite-breakeven",
    title: "Daily Overhead & Breakeven Rate",
    seoTitle: "Daily Overhead & Break-Even Calculator",
    shortDescription:
      "Daily overhead calculator that finds your minimum daily cost to keep the doors open and the minimum bid rate that actually leaves profit. Free, no sign-up.",
    category: "financial-business",
    subtrade: "Overhead",
    tags: ["daily overhead calculator", "construction break-even calculator", "how do you calculate break-even for a construction company", "contractor shop rate calculator", "minimum bid calculator", "contractor overhead percentage", "billable days calculator", "construction survival rate", "overhead rate per day", "fixed cost calculator contractor", "break-even point construction", "job cost overhead allocation", "what is a good profit margin for contractors", "how to price a construction job"],
    iconName: "Gauge",
    formulaSummary: "Daily overhead = annual fixed costs ÷ billable days",
    inputsSummary: "5 annual cost buckets + billable days + profit target",
    outputs: ["Daily overhead cost", "Hourly shop overhead", "Minimum daily bid threshold"],
    badge: "New",
    estimatedTime: "< 3 min",
    available: true,
    details: [
      "Daily overhead = annual fixed costs ÷ billable days: the zero-profit floor. Never bid below it.",
      "Survival rate = daily overhead ÷ (1 − profit target): the minimum daily bid that actually leaves profit.",
      "220 billable days (not 260) accounts for rain, holidays, breakdowns, and gaps between jobs.",
    ],
    howTo:
      "Enter the five annual fixed-cost buckets honestly pull them from last year's books. Set billable days (220 is typical) and your profit buffer target (15% default). Use the daily overhead as the absolute floor and the survival rate as your minimum daily bid. Dispatch the allocation line with the project's day count.",
    faqs: [
      { q: "How do you calculate break-even for a construction company?", a: "Divide annual fixed costs by billable days - the tool uses 220 days, not 260, to account for rain, holidays, breakdowns, and gaps between jobs. That daily overhead is the zero-profit floor; never bid below it." },
      { q: "What's the difference between daily overhead and the survival rate?", a: "Daily overhead is the zero-profit breakeven. The survival rate divides overhead by (1 - profit target), so $400/day overhead with a 15% target gives a $471/day minimum bid that actually leaves profit." },
      { q: "Why 220 billable days instead of 260 weekdays?", a: "Rain days, holidays, sick days, equipment breakdowns, and gaps between jobs eat roughly 40 days a year. Bidding against 260 days understates your true daily cost by about 15%." },
      { q: "Should labor burden be included in daily overhead?", a: "No - keep them separate. This tool covers fixed business overhead like trucks, insurance, office, and admin. Field labor burden belongs in the True Burdened Labor Rate calculator; add both lines to a bid and nothing gets double-counted." },
      { q: "What is a good profit margin for contractors?", a: "10-20% net is healthy for residential work. Set your profit target in the tool and the survival rate builds it into your minimum daily bid automatically." },
    ],
  },
  {
    id: "break-even",
    slug: "break-even",
    title: "Break-Even Calculator",
    seoTitle: "Break-Even Calculator for Contractors",
    shortDescription:
      "Break-even calculator for contractors that shows the monthly revenue and number of jobs needed each month before the business turns a profit. Free, no sign-up.",
    category: "financial-business",
    subtrade: "Bidding",
    tags: ["break-even calculator", "construction break-even calculator", "break-even revenue calculator", "how do you calculate break-even for a construction company", "how many jobs do I need per month", "contractor break-even point", "fixed costs calculator", "gross margin calculator construction", "monthly revenue target calculator", "small business break-even calculator", "what is a good profit margin for contractors", "markup vs margin calculator", "job count planner", "construction business planner"],
    iconName: "Scale",
    formulaSummary: "BE = fixed costs ÷ margin",
    inputsSummary: "Fixed costs + margin",
    outputs: ["Break-even revenue", "Jobs needed"],
    estimatedTime: "< 2 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Break-even revenue = monthly fixed costs ÷ gross margin — $12,000 ÷ 35% = $34,286 per month.",
      "Fixed costs are everything that doesn't move with job volume: rent, insurance, salaries, trucks, office.",
      "Gross margin is gross profit ÷ revenue — use your historical average, not your best month.",
      "This is revenue planning; pair it with the Jobsite Breakeven tool for daily bid-floor rates."
    ],
    howTo: "Enter monthly fixed costs, gross margin percent, and average job value — break-even revenue and jobs needed solve live.",
    faqs: [
      { q: "How do you calculate break-even for a construction company?", a: "Break-even revenue = monthly fixed costs / gross margin. With $12,000 in fixed costs and a 35% margin, you need $34,286 per month before the business profits." },
      { q: "How do I calculate my break-even revenue?", a: "Divide monthly fixed costs by gross margin as a decimal - $12,000 / 0.35 = $34,286 per month. The calculator solves this live from your inputs." },
      { q: "What's the difference between markup and margin here?", a: "Use margin (profit / revenue), not markup (profit / cost) - break-even is revenue-based, so margin is the right input. Mixing them up understates the revenue you need." },
      { q: "How many jobs do I need per month?", a: "Break-even revenue / average job value - $34,286 / $8,500 is about 4 jobs per month. Enter your average ticket and the tool computes the job count for you." },
      { q: "What is a good profit margin for contractors?", a: "10-20% net margin after overhead is a healthy target. Use your historical average gross margin, not your best month, so the break-even number stays realistic." },
    ],
  },
  {
    id: "change-order",
    slug: "change-order",
    title: "Change Order Pricer",
    seoTitle: "Change Order Pricing Calculator",
    shortDescription:
      "Change order pricing calculator that prices extras and variations with margin protection built in, so change orders never get sold at cost. Free, no sign-up.",
    category: "financial-business",
    subtrade: "Bidding",
    tags: ["change order pricing calculator", "how do you price a change order", "construction change order pricing", "extras pricing calculator", "change order markup", "achieved margin calculator", "cost plus change order pricing", "time and materials pricing", "markup vs margin calculator", "what markup should a contractor charge", "how do you calculate markup in construction", "contractor change order", "construction co pricing", "how to price a construction job"],
    iconName: "FilePlus2",
    formulaSummary: "CO price = cost × (1 + markup)",
    inputsSummary: "CO cost + markup",
    outputs: ["CO price", "Margin check"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Change order price = direct cost × (1 + markup) — $2,500 × 1.30 = $3,250.",
      "Achieved margin = profit ÷ price — a 30% markup yields a 23.1% margin, not 30%.",
      "Change orders usually carry higher markup than base bids: mobilization, disruption, and paperwork cost real money.",
      "Check the achieved margin against your target before sending — never price extras at cost."
    ],
    howTo: "Enter the extra work's direct cost and your markup — price, profit, and achieved margin solve live.",
    faqs: [
      { q: "How do you price a change order?", a: "Change order price = direct cost x (1 + markup). Enter the extra work's cost and your markup - the tool solves price, profit, and achieved margin live so extras never get priced at cost." },
      { q: "How do you calculate markup in construction?", a: "Markup = (price - cost) / cost, applied as price = cost x (1 + markup). A $2,500 change order at 30% markup prices at $3,250." },
      { q: "What's the difference between 30% markup and 30% margin?", a: "30% markup on $2,500 gives a $3,250 price, but the margin is $750 / $3,250 = 23.1%. Markup is measured on cost; margin is measured on price - the tool shows both." },
      { q: "What markup should a contractor charge on change orders?", a: "Higher than the base bid - typically 30-50%. Extras disrupt the schedule, need remobilization, and carry extra paperwork, so margin protection matters more on change orders." },
      { q: "Should change orders have higher markup than the original bid?", a: "Yes. Mobilization, schedule disruption, and admin cost real money on extras. Check the achieved margin against your target before sending - never price extras at cost." },
    ],
  },

  /* ---------------- Field Converters & Master Proposal ---------------- */
  {
    id: "feet-inch-fraction",
    slug: "feet-inch-fraction",
    title: "Feet-Inches-Fraction Keypad",
    seoTitle: "Fraction Calculator for Feet, Inches & 16ths",
    shortDescription:
      "Fraction calculator for feet, inches and fractions: add, subtract, multiply and divide jobsite dimensions to 1/16 inch with exact results. Free, no sign-up.",
    category: "utilities",
    subtrade: "Converters",
    tags: ["fraction calculator", "feet inches fraction calculator", "add feet and inches calculator", "fraction keypad", "tape measure calculator", "carpenter calculator", "dimension math", "1/16 inch calculator", "feet inches calculator", "how do you add feet and inches with fractions", "how do you convert inches to feet and inches", "fraction addition calculator", "construction math calculator", "fraction to decimal converter"],
    iconName: "Sigma",
    formulaSummary: "14' 7-3/8\" + 9' 11-1/2\" = 24' 6-7/8\"",
    inputsSummary: "Tap-key dimension entry",
    outputs: ["Architectural result", "Decimal + metric equivalents"],
    badge: "Most Popular",
    estimatedTime: "< 1 min",
    available: true,
    details: [
      "Add, subtract, multiply, and divide dimensions like 14 ft 7-3/8 in with big touch-friendly keys.",
      "All arithmetic runs in integer 16ths of an inch no floating-point drift, fractions stay exact.",
      "Every result shows the reduced fraction plus decimal inches, decimal feet, and metric equivalents.",
      "Operations evaluate left to right (× and ÷ have no precedence) the same way chain calculators work.",
    ],
    howTo:
      "Tap digits, the foot/inch keys, and fraction presets to build a dimension (e.g. 14′ 7 3/8″), then tap an operator and build the next one. Press = for the result, copy it, copy decimal feet, or push the measurement straight into your estimate as a reference line.",
    faqs: [
      { q: "How do you add feet and inches with fractions?", a: "Enter a dimension like 14' 7-3/8\", tap +, enter the next dimension, and press =. The keypad does all math in integer 16ths of an inch, so the reduced-fraction result is exact, not rounded." },
      { q: "How do you convert inches to feet and inches?", a: "Every result shows the reduced fraction plus decimal inches, decimal feet, and metric equivalents, so one entry gives you feet-inches, decimal, and metric at once." },
      { q: "Why do my phone calculator results differ by a 16th?", a: "Phone calculators use floating-point decimals, so errors like 0.1 + 0.2 accumulate across chained cuts. This keypad works in integer 16ths of an inch, the same way you would work it on paper, so fractions stay exact." },
      { q: "Can I chain calculations, like adding three wall lengths?", a: "Yes. After pressing =, tap an operator to continue from the last result, or keep building expressions left to right. Recent calculations are saved on the device for the day." },
      { q: "How do I enter something like 9' 11-1/2\"?", a: "Tap 9, the ft key, 1, 1, the 1/2 preset, and the in key. The display reads your entry back as a live dimension preview so you can verify it before pressing =." },
    ],
  },
  {
    id: "unit-converter-pro",
    slug: "unit-converter-pro",
    title: "Construction Unit Converter",
    seoTitle: "Construction Unit Converter: Sq Ft, Sq Yds, Cu Yds",
    shortDescription:
      "Construction unit converter for area, volume and weight: sq ft, roofing squares, cu yd, acres, gallons, tons and metric, two-way and instant. Free, no sign-up.",
    category: "utilities",
    subtrade: "Converters",
    tags: ["construction unit converter", "square feet to roofing squares", "cubic feet to cubic yards", "sq ft to sq yd converter", "roofing square calculator", "cu yd to cu ft", "acres to square feet", "gallons to cubic feet", "tons to pounds converter", "how many square feet are in a roofing square", "how many cubic feet in a cubic yard", "metric to imperial construction", "area volume weight converter"],
    iconName: "ArrowLeftRight",
    formulaSummary: "1 cu yd = 27 cu ft",
    inputsSummary: "Value + from/to units",
    outputs: ["Converted value", "All-unit comparison table"],
    estimatedTime: "< 1 min",
    available: true,
    details: [
      "Area: sq ft ↔ sq yd ↔ roofing squares ↔ acres ↔ sq m. Volume: cu ft ↔ cu yd ↔ gallons ↔ cu m ↔ liters. Weight: lb ↔ tons ↔ tonnes ↔ kg.",
      "Two-way and instant tap swap to reverse direction, tap any reference card to copy it.",
      "Defined relationships are exact (1 cu yd = 27 cu ft); metric factors use standard values.",
    ],
    howTo:
      "Pick Area, Volume, or Weight, choose the from/to units, and type a value conversion is instant. Tap the swap button to reverse direction, tap any reference card to copy it, or save the conversion as a note line in your estimate.",
    faqs: [
      { q: "How many square feet are in a roofing square?", a: "Exactly 100 sq ft per square, and a square of 3-tab shingles is 3 bundles. On the Area tab, enter squares to get sq ft, or work it the other way with the instant swap." },
      { q: "How many cubic feet in a cubic yard?", a: "Exactly 27 cubic feet per cubic yard. On the Volume tab, pick cu yd to cu ft and type the value; the conversion and the all-unit comparison table solve instantly." },
      { q: "How heavy is a cubic yard of concrete?", a: "About 4,000 lbs, which is 2 tons for standard mix. Use the Weight tab to convert supplier quotes between tons, pounds, and metric tonnes before comparing prices." },
      { q: "Are the conversions exact?", a: "Yes for defined relationships: 1 cu yd = 27 cu ft exactly and 1 in = 25.4 mm exactly. Metric conversions use standard factors such as 1 sq m = 10.7639 sq ft, and results round to 6 significant figures." },
      { q: "Can I convert between metric and imperial units?", a: "Yes. Area covers sq ft, sq yd, roofing squares, acres, and sq m; volume covers cu ft, cu yd, gallons, cu m, and liters; weight covers lb, tons, tonnes, and kg. Tap swap to reverse any direction." },
    ],
  },
  {
    id: "right-triangle",
    slug: "right-triangle",
    title: "Right Triangle & 3-4-5",
    seoTitle: "3-4-5 Triangle Calculator: Check Square Corners",
    shortDescription:
      "3-4-5 triangle calculator and right triangle solver: find hypotenuses, missing legs and angles, and verify square corners on any layout. Free, no sign-up.",
    category: "utilities",
    subtrade: "Layout Math",
    tags: ["3-4-5 triangle calculator", "right triangle calculator", "check if corner is square", "pythagorean theorem calculator", "hypotenuse calculator", "how does the 3-4-5 triangle rule work", "how do you check if a corner is square", "square layout calculator", "diagonal calculator", "3 4 5 rule construction", "right triangle angle calculator", "carpentry layout math"],
    iconName: "Triangle",
    formulaSummary: "c = √(a² + b²)",
    inputsSummary: "Two sides",
    outputs: ["Hypotenuse", "Angles"],
    estimatedTime: "< 1 min",
    available: true,
    readTimeMinutes: 2,
    details: [
      "Two legs: hypotenuse = √(a² + b²) — 3 and 4 give exactly 5.",
      "Leg + hypotenuse: missing leg = √(c² − a²); the hypotenuse must be the longest side.",
      "Acute angles come from atan2 — a 3-4-5 triangle gives 36.87° and 53.13°.",
      "The 3-4-5 check confirms square corners: if sides match the ratio within 1%, your layout is square."
    ],
    howTo: "Pick two-legs or leg-plus-hypotenuse mode and enter the sides — the missing side, both angles, and the 3-4-5 check solve live.",
    faqs: [
      { q: "How does the 3-4-5 triangle rule work?", a: "A triangle with legs of 3 and 4 units has a diagonal of exactly 5 units, because 3 squared plus 4 squared equals 5 squared. The ratio scales to any size, so 6-8-10 and 9-12-15 work the same way." },
      { q: "How do you check if a corner is square?", a: "Measure 3 ft along one wall and 4 ft along the other, then measure the diagonal: it must be exactly 5 ft. This tool runs the 3-4-5 check for any size and confirms the layout is square when the ratio matches within 1%." },
      { q: "What are the angles of a 3-4-5 triangle?", a: "36.87 degrees opposite the 3 side and 53.13 degrees opposite the 4 side; the two acute angles always sum to 90 degrees. The tool computes both angles from atan2 for any sides you enter." },
      { q: "How do I find a missing side of a right triangle?", a: "Enter two legs to get the hypotenuse from c = sqrt(a squared + b squared), or enter a leg plus the hypotenuse to get the missing leg from sqrt(c squared - a squared). The hypotenuse must be the longest side." },
      { q: "Can I use any units?", a: "Yes: feet, inches, or meters. All outputs, including the hypotenuse, angles, and the 3-4-5 square check, use whatever unit you enter." },
    ],
  },
  {
    id: "master-proposal-builder",
    slug: "master-proposal-builder",
    title: "Master Proposal Builder",
    seoTitle: "Contractor Proposal Template & Bid Builder",
    shortDescription:
      "Contractor proposal template that turns bid lines into a branded client-ready PDF with markup, contingency, tax and a payment schedule. Free, no sign-up.",
    category: "utilities",
    subtrade: "Proposal",
    tags: ["contractor proposal template", "bid proposal builder", "construction proposal pdf", "contractor quote template", "client proposal generator", "markup vs margin calculator", "contractor payment schedule", "contractor bid template", "how do you write a contractor proposal", "what should a contractor proposal include", "proposal with payment schedule", "construction bid template", "estimate to proposal"],
    iconName: "FileSpreadsheet",
    formulaSummary: "Proposal = Σ lines + markup + contingency + tax",
    inputsSummary: "Bid cart lines + branding",
    outputs: ["Client-ready PDF proposal", "Payment schedule", "JSON backup"],
    badge: "New",
    estimatedTime: "< 5 min",
    available: true,
    details: [
      "Every line dispatched by the 30 calculators lands in one editable bill of materials, grouped by trade.",
      "Company branding, logo, client and project details print on a client-ready PDF payment schedule, terms, and signature lines included.",
      "Markup or gross-margin mode, contingency, and tax compute the total contract value. The PDF is generated entirely in your browser nothing uploads anywhere.",
    ],
    howTo:
      "Open the builder after dispatching lines from any calculators. Edit quantities and prices inline, add custom lines, fill in company and client info, set your markup/margin, contingency, and tax, then press Download proposal PDF. Use the JSON backup to save or restore bids.",
    faqs: [
      { q: "What should a contractor proposal include?", a: "An itemized bill of materials grouped by trade, company branding and client details, markup, contingency, and tax, plus a payment schedule, terms, and signature lines. This builder prints all of them on a client-ready PDF." },
      { q: "What is the difference between markup % and margin % mode?", a: "Markup is profit as a percentage of cost, so a 20% markup on $1,000 cost gives a $1,200 price. Gross margin is profit as a percentage of price, so a 20% margin needs a 25% markup for a $1,250 price. The builder toggles between modes and converts so the final price matches either way." },
      { q: "Where does my company info and logo go?", a: "It is saved in your browser's local storage on your device only and never uploaded. The logo, company name, license number, and contact details print on every proposal PDF header automatically." },
      { q: "Can I reload a saved bid later?", a: "Yes. Download JSON Project Backup saves the complete bid lines, branding, client info, and pricing settings, and Restore from Backup reloads everything exactly as it was, on any device." },
      { q: "Does anything I enter get uploaded to the cloud?", a: "No. Every line from the calculators lands in one editable bill of materials, and the proposal PDF is generated entirely in your browser. Nothing leaves your device." },
    ],
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
