/**
 * BuildCalc Pro Blog content.
 *
 * Every figure here is grounded in the actual calculator implementations
 * (see src/lib/math/* and src/data/toolsRegistry.ts). No invented
 * statistics, no case studies, no testimonials.
 */

export interface BlogBlock {
  h2?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readMinutes: number;
  author: string;
  toolSlug?: string;
  toolCta?: string;
  content: BlogBlock[];
}

const AUTHOR = "BuildCalc Pro Team";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "estimate-concrete-slab",
    title: "How Much Concrete Do I Need for a Slab? Yards, Bags & Waste",
    excerpt:
      "How many yards of concrete do you need for a slab? Length × width × thickness ÷ 27 gives cubic yards — then add waste and choose ready-mix or bags.",
    category: "Concrete",
    date: "2026-10-02",
    readMinutes: 6,
    author: AUTHOR,
    toolSlug: "concrete-slab",
    toolCta: "Concrete Slab Calculator",
    content: [
      {
        paragraphs: [
          "Estimating concrete is one of the most unforgiving takeoffs in construction: order too little and the pour stops cold; order too much and you pay for yards you cannot return. The math itself is simple volume in cubic yards but the waste allowance and the ready-mix-vs-bags decision are where jobs win or lose money.",
        ],
      },
      {
        h2: "The core formula",
        paragraphs: [
          "Measure length and width in feet and thickness in inches. Convert thickness to feet, multiply, then divide by 27 the number of cubic feet in a cubic yard, the unit ready-mix is sold in:",
          "Volume (cu yd) = length × width × (thickness ÷ 12) ÷ 27",
          "A 20 × 15 ft patio at 4 inches thick is 20 × 15 × (4 ÷ 12) ÷ 27 = 3.70 cubic yards. That is the net volume what the finished slab physically contains. You never order the net number.",
        ],
      },
      {
        h2: "Add waste before you price",
        paragraphs: [
          "Waste is applied to the net volume first, and the order quantity rounds up from the waste-adjusted number never the other way around. A 10–15% allowance covers spillage, over-excavation, and uneven subgrade that eats concrete. On the patio above, 10% waste takes 3.70 yards to 4.07 yards, which you would order as 4.25 or 4.5 yards depending on your supplier's increments.",
        ],
        list: [
          "10% waste formed slabs on well-prepared, compacted subgrade",
          "12–15% waste hand-dug footings, irregular shapes, or soft subgrade",
          "Always round the order quantity up suppliers do not sell fractions of a yard",
        ],
      },
      {
        h2: "Bags vs. ready-mix",
        paragraphs: [
          "An 80-lb bag of concrete mix yields about 0.6 cubic feet, so one cubic yard needs roughly 45 bags (60-lb bags need about 60). For the 4.07-yard patio that is over 180 eighty-pound bags clearly a ready-mix truck job. Bags make sense under about half a yard: small pads, post footings, and repairs where the truck's short-load fee would cost more than the sacks.",
          "When a truck does come, remember it carries a full load whether you need it or not. Most suppliers charge a short-load fee under their minimum (often 4–5 yards), so small pours sometimes pencil out better as bags even when the per-yard price looks higher.",
        ],
      },
      {
        h2: "Common mistakes",
        list: [
          "Forgetting the ÷ 27 and ordering cubic feet as cubic yards 27× too much",
          "Measuring thickness in inches but forgetting ÷ 12",
          "Ordering the net number with no waste, then running short mid-pour",
          "Rounding down the order quantity to 'save' money",
        ],
      },
    ],
  },
  {
    slug: "cmu-block-mortar-grout-estimating",
    title: "How Many Concrete Blocks Do I Need? CMU, Mortar & Grout Guide",
    excerpt:
      "How many concrete blocks per square foot? Block counts, mortar bags, core-fill grout, and bond-beam rebar — the four quantities every block wall estimate needs.",
    category: "Masonry",
    date: "2026-09-24",
    readMinutes: 7,
    author: AUTHOR,
    toolSlug: "cmu-block-mortar",
    toolCta: "CMU Block & Mortar Calculator",
    content: [
      {
        paragraphs: [
          "A concrete block wall estimate has four moving parts: the blocks themselves, the mortar that beds them, the grout that fills the cores, and the rebar in bond beams. Miss any one and the bid is wrong. Here is how each quantity is derived from the same wall dimensions.",
        ],
      },
      {
        h2: "Block count: wall area ÷ 0.8889",
        paragraphs: [
          "A standard block face is 8 × 16 inches regardless of whether the block is 6, 8, or 12 inches wide. That face covers 0.8889 square feet, so every 100 square feet of wall needs about 112.5 blocks before waste. Multiply wall length × height, divide by 0.8889, then add a cutting and breakage allowance 5% is typical for straight runs, more for walls with many openings or corners.",
        ],
      },
      {
        h2: "Mortar: 1 bag per 15 blocks",
        paragraphs: [
          "Type S mortar for an 80-lb bag covers roughly 15 standard blocks (manufacturer data sheets range from about 12 to 20 depending on joint fullness and block texture). Compute bags from the net block count broken blocks use no mortar then apply a mortar waste allowance on top, typically around 10% for joints, cuts, and spills.",
        ],
      },
      {
        h2: "Core-fill grout: spacing math that matters",
        paragraphs: [
          "Block cores sit on 8-inch centers, so the 'O.C.' spacing of grouted cores divides neatly: grouting every 24 inches fills every 3rd core, every 32 inches fills every 4th, and every 48 inches fills every 6th. A solid-grouted 8×8×16 block holds about 0.32 cubic feet of grout; scale down for 6-inch block and up for 12-inch.",
          "This is the quantity most hand estimates get wrong usually by half because the cores look small until you multiply by hundreds of blocks. Divide total cubic feet by 27 for cubic yards when ordering from the ready-mix plant.",
        ],
      },
      {
        h2: "Bond beams: rebar in 20-ft sticks",
        paragraphs: [
          "Bond-beam courses are grouted solid along their full length with two continuous bars. Count the bars in 20-foot sticks, rounded up, and include a lap allowance (about 10%) because sticks must overlap at splices. Each bond-beam block also takes its own grout roughly 0.12 cubic feet per 8-inch knockout block.",
        ],
      },
      {
        h2: "Checklist before you price",
        list: [
          "Wall area measured, openings noted",
          "Block count with waste, from net area ÷ 0.8889",
          "Mortar bags from net blocks ÷ 15, plus waste",
          "Grout yards from core spacing and block width",
          "Bond-beam sticks with lap allowance",
        ],
      },
    ],
  },
  {
    slug: "roof-pitch-multipliers-shingle-waste",
    title: "How Many Bundles of Shingles Do I Need? Squares, Pitch & Waste",
    excerpt:
      "How many bundles of shingles per square? A 6/12 roof has 11.8% more surface than its footprint — pitch multipliers, squares, and waste explained.",
    category: "Roofing",
    date: "2026-09-17",
    readMinutes: 6,
    author: AUTHOR,
    toolSlug: "roof-pitch-shingles",
    toolCta: "Roof Pitch & Shingles Calculator",
    content: [
      {
        paragraphs: [
          "Roofing is sold by the square 100 square feet but you measure the footprint, not the slope. The pitch multiplier bridges the two, and the waste factor depends on roof complexity. Get either wrong and you are short on bundles or sitting on pallets of returns.",
        ],
      },
      {
        h2: "The pitch multiplier",
        paragraphs: [
          "For a pitch expressed as rise over a 12-inch run, the multiplier is M = √(rise² + 12²) ÷ 12. Multiply the plan (footprint) area by M to get true surface area. A 6/12 roof multiplies by about 1.118 11.8% more surface than the footprint while a steep 12/12 doubles the geometry factor to about 1.414.",
          "This is pure geometry, not a rule of thumb: it is the ratio of the sloped rafter length to its horizontal run, and it applies to shingles, underlayment, and any other material sold by roof area.",
        ],
      },
      {
        h2: "Waste follows complexity",
        paragraphs: [
          "Waste is not a flat number it tracks how many cuts the roof forces. Simple gables waste little; hips, valleys, and dormers eat shingles:",
        ],
        list: [
          "10% simple gable, few penetrations",
          "15% hip roof or multiple valleys",
          "20% cut-up roof with dormers, turrets, or heavy flashing work",
        ],
      },
      {
        h2: "Bundles, squares, and underlayment",
        paragraphs: [
          "Divide the waste-adjusted surface area by 100 for squares, then multiply squares by 3 for bundles three bundles make a square rounding up, because suppliers do not split bundles. Underlayment is simpler: waste-adjusted area divided by the roll coverage (about 1,000 sq ft for a 10-square synthetic roll), rounded up.",
          "Order the ridge cap separately in your head: hip and ridge shingles are not the same as field shingles, and a cut-up roof's ridge footage adds up fast.",
        ],
      },
    ],
  },
  {
    slug: "stair-layout-irc-riser-tread",
    title: "Stair Calculator Guide: Risers, Treads & Stringer Layout (IRC)",
    excerpt:
      "How do you calculate stairs? Riser count = total rise ÷ 7.5, treads = risers − 1, and the three IRC numbers every stair must satisfy.",
    category: "Framing",
    date: "2026-09-10",
    readMinutes: 7,
    author: AUTHOR,
    toolSlug: "stair-stringer-layout",
    toolCta: "Stair Stringer Layout Calculator",
    content: [
      {
        paragraphs: [
          "Stairs are the one place in framing where the math is also the law. Risers and treads must satisfy the building code and feel right underfoot, and both come from two measurements: total rise (floor to floor) and total run (available horizontal distance).",
        ],
      },
      {
        h2: "Solving the riser count",
        paragraphs: [
          "Divide the total rise by a comfortable target 7.5 inches is the standard starting point and round to a whole number of risers. Then divide the total rise by that count to get the exact unit rise. A 105-inch total rise divides by 7.5 into exactly 14 risers at 7.5 inches each.",
          "The number of treads is always risers minus one, because the top tread is the upper floor or landing itself. Those 14 risers need 13 treads cut into the stringers.",
        ],
      },
      {
        h2: "The three IRC numbers",
        paragraphs: [
          "The International Residential Code (R311.7) sets hard limits that every stair in a dwelling must meet. These are maximums and minimums, not targets:",
        ],
        list: [
          "Riser height: no more than 7¾ inches",
          "Tread depth: no less than 10 inches",
          "Comfort rule: 2 × riser + tread should land between 24 and 25 inches",
          "Riser/tread uniformity: the largest and smallest in a flight must be within ⅜ inch",
        ],
      },
      {
        h2: "Stringers and stock",
        paragraphs: [
          "Stringers are cut from 2×12s, and the total stringer length rounds up to standard stock 10, 12, 14, or 16 feet. Stairways wider than 36 inches need a fourth stringer down the middle to keep treads from flexing. Always check headroom (6 ft 8 in minimum), stairway width, landings, and handrails on site the riser/tread math is only part of a compliant stair.",
        ],
      },
    ],
  },
  {
    slug: "markup-vs-margin-contractors",
    title: "Markup vs Margin Calculator: The Pricing Mistake Costing Contractors",
    excerpt:
      "What is the difference between markup and margin? A 30% markup is only a 23% margin — price from margin, not markup, or the job's profit quietly disappears.",
    category: "Estimating",
    date: "2026-09-28",
    readMinutes: 5,
    author: AUTHOR,
    toolSlug: "contractor-markup-margin",
    toolCta: "Markup / Margin Calculator",
    content: [
      {
        paragraphs: [
          "Markup and margin sound interchangeable. They are not and confusing them is the most common pricing mistake in contracting. Markup is profit divided by cost; margin is profit divided by price. Because the denominators differ, the same dollars produce different percentages.",
        ],
      },
      {
        h2: "The 30% that isn't",
        paragraphs: [
          "Put a 30% markup on a $10,000 job: price = $10,000 × 1.30 = $13,000, profit $3,000. That $3,000 is 30% of cost but only 23% of the $13,000 price. If your business plan assumed a 30% margin, you are 7 points short before overhead even enters the picture.",
          "The two directions of the same job:",
        ],
        list: [
          "Bid from markup: price = cost × (1 + markup)",
          "Bid from margin: price = cost ÷ (1 − margin)",
          "To hit a true 30% margin on $10,000 of cost: $10,000 ÷ 0.70 = $14,286",
        ],
      },
      {
        h2: "Net true profit",
        paragraphs: [
          "Gross profit minus overhead recovery is net true profit the number that actually stays in the business. A job can show a healthy gross margin and still lose money once office, insurance, and truck costs are allocated. Run the margin math first, then subtract your overhead rate, and price the bid from that net target.",
        ],
      },
    ],
  },
  {
    slug: "reading-material-takeoff",
    title: "What Is a Material Takeoff? Net, Waste & Order Quantities Explained",
    excerpt:
      "What is a material takeoff in construction? Net is what the building needs, waste is what the jobsite eats, and order quantity is what the supplier sells.",
    category: "Estimating",
    date: "2026-10-05",
    readMinutes: 5,
    author: AUTHOR,
    toolSlug: "master-proposal-builder",
    toolCta: "Master Proposal Builder",
    content: [
      {
        paragraphs: [
          "Every material line on BuildCalc Pro shows three numbers net, waste, and order and they answer three different questions. Understanding which is which keeps you from pricing the wrong one or ordering the wrong one.",
        ],
      },
      {
        h2: "Net: what the building needs",
        paragraphs: [
          "Net is the pure geometric quantity: the cubic yards the slab physically contains, the square feet the wall covers, the linear feet the run measures. It comes straight from dimensions with no allowances. You price from net-plus-waste, but you never order the net number it assumes a perfect jobsite, and jobsites are not perfect.",
        ],
      },
      {
        h2: "Waste: what the jobsite eats",
        paragraphs: [
          "Waste covers cutting, breakage, spillage, over-excavation, and the odd piece that falls off the truck. It is a percentage applied to the net quantity, and the right percentage depends on the material and the work: 5% for block on straight runs, 10–15% for concrete, higher for cut-up tile or roofing. Waste is real money it belongs in the bid, not absorbed as a surprise.",
        ],
      },
      {
        h2: "Order: what the supplier sells",
        paragraphs: [
          "Order quantity is the waste-adjusted number rounded up to the supplier's sellable unit: whole bags, full bundles, half-ton increments, 16-foot boards. The rounding always goes up and always happens after waste is applied rounding the net number first and then adding waste is how estimates come up short. When the order quantity feeds the Master Bid, the bid carries the true delivered cost, waste included.",
        ],
      },
      {
        h2: "The one-line version",
        list: [
          "Net = geometry (from your dimensions)",
          "Gross = net × (1 + waste%) what you price",
          "Order = gross rounded up to sellable units what you buy",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function blogCategories(): string[] {
  return [...new Set(BLOG_POSTS.map((p) => p.category))];
}

export function relatedPosts(slug: string, count = 3): BlogPost[] {
  const post = getPost(slug);
  if (!post) return [];
  const sameCat = BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.category === post.category,
  );
  const rest = BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.category !== post.category,
  );
  return [...sameCat, ...rest].slice(0, count);
}

export function formatBlogDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
