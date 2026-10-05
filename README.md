# BuildCalc Pro Phase 1 Foundation

Zero-database, client-side **Contractor Estimating & Calculation Suite**.
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand (persist) · Zod · Radix UI · Lucide.

**Design promise:** high-contrast industrial dark UI (`#09090b` chassis), safety-amber
(`#f59e0b`) primary actions, hi-vis orange (`#ea580c`) results. Big steppers, preset chips,
unit badges, and fraction-friendly inputs built for glare, dust, and gloves.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Architecture

```
src/
├── app/                      # App Router: layout, page (home), tools/, privacy/
│   └── tools/concrete/concrete-slab/   # demo tool page (reference for Phase 2)
├── components/
│   ├── ui/                   # shadcn-style primitives (button, input, sheet, dialog…)
│   ├── layout/               # Navbar, Footer, CommandPalette (⌘K)
│   ├── estimate/             # EstimateDrawer Master Bid Cart
│   └── calculators/          # NumericInput, CalculationCard shell, ConcreteSlab demo
├── lib/
│   ├── math/units.ts         # precision arithmetic, ft-in-fractions, conversions, waste
│   ├── schemas.ts            # Zod contracts (inputs + persisted documents)
│   ├── export.ts             # JSON export envelope + browser file I/O
│   ├── tools-registry.ts     # ToolMetadata registry (drives nav, palette, directory)
│   └── tool-icons.tsx        # iconName → Lucide resolution
├── store/
│   ├── useEstimateStore.ts   # Zustand persist → localStorage key `contractor_active_estimate`
│   └── useUiStore.ts         # ephemeral UI state (drawer / palette open)
└── types/estimator.ts         # universal data contracts (Category, ToolMetadata,
                               # EstimateLineItem, MasterEstimateState, BidSummary)
```

## Phase 2 Navigation, directory & search (2026-10-05)

- **Central registry** `src/data/toolsRegistry.ts`: 7 `CategoryMetadata` hubs + 31
  `ToolMetadata` tools (sub-trades, tags, badges, outputs, ETAs). Sole source of truth.
- **Command menu** `src/components/layout/CommandMenu.tsx`: ⌘K fuzzy search with
  category chips, recent tools, empty-state suggestions; routes to `/tools/[slug]`.
- **Routes** `/` dashboard (hero search, metrics, category grid, recent rail),
  `/tools`, `/tools/[slug]` (breadcrumb + action bar + related sidebar + skeletons),
  `/categories`, `/categories/[category]` (sub-trade tabs + search).
- **Tool action bar** `useToolPageStore` + `useToolActions()`: Reset Inputs and
  Save/Restore JSON drafts per tool; old `/tools/:category/:slug` URLs 308-redirect.

## Key contracts

- **Estimate persistence** `useEstimateStore` persists the full `MasterEstimateState`
  (items, company, client, markup/contingency/tax %) to localStorage. Corrupt or
  version-mismatched payloads degrade to a fresh document; localStorage failures
  degrade to in-memory storage. Nothing ever touches a network.
- **Pricing** `computeBidSummary()` is the single pure function for
  Direct Cost → Markup → Contingency → Tax → Total Bid.
- **Adding a tool (Phase 2 pattern)** 1) add a `ToolMetadata` entry to
  `src/lib/tools-registry.ts` with `available: true`; 2) build the calculator
  component inside `<CalculationCard>` (see `ConcreteSlab.tsx`); 3) add the route
  at `src/app/tools/[category]/[slug]/page.tsx`; 4) implement `buildLineItem()`
  returning an `EstimateLineItem` payload the card wires the "Add to Master
  Estimate" button, toast, and drawer deep-link automatically.
- **Validation** calculator inputs use `src/lib/schemas.ts` helpers
  (`positiveDimension`, `wasteInput`, `unitCostInput`); estimate imports are
  rejected loudly by `masterEstimateSchema` instead of corrupting state.

## Phase 2 hooks (ready)

- `TOOL_CATEGORIES`, `TOOLS`, `toolHref()`, `searchTools()` drive the navbar,
  ⌘K palette, and `/tools` directory new registry entries appear everywhere.
- `NumericInput` supports `presets` (16″ O.C. / 24″ O.C., 4/12–8/12 pitches…)
  and `fractionFriendly` parsing (`12' 3-3/8"` → decimal feet).
- `CalculationCard` enforces the Net → Waste → Gross → BOM → Unit Cost → Total →
  **Add to Master Estimate** layout on every tool.
