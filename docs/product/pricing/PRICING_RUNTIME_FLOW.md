# Sundae Pricing Site -- Runtime Flow Documentation

> **Last updated:** 2026-02-17
> **Source of truth:** Full codebase analysis of `sundae-pricing` repo
> **Pricing data effective:** January 1, 2026

---

## Scope & Boundaries

This repository (`sundae-pricing`) is a **standalone pricing and quote-generation site**. It is NOT a product backend.

- There is **NO backend / API server** in this repo.
- There is **NO checkout, billing, payment processing, or subscription management**.
- There is **NO entitlement issuance** (no license keys, feature flags, or access tokens).
- All pricing is **client-side computed** from static data objects in `src/data/pricing.ts`.
- Entitlements, billing, and subscription management would live in a separate `sundae-app` or backend system.

---

## Architecture Overview

| Concern | Technology |
|---|---|
| Build tool | Vite 7.x (`vite.config.ts`) |
| Framework | React 19 + TypeScript 5.9 |
| Styling | Tailwind CSS 4.x + `clsx` + `tailwind-merge` |
| State management | Zustand 5.x with `persist` middleware (localStorage key: `sundae-pricing-config`) |
| Routing | react-router-dom 7.x (BrowserRouter) |
| Animations | framer-motion 12.x |
| PDF generation | jsPDF 3.x (client-side) |
| Charts | Recharts 3.x |
| Icons | lucide-react |
| Deployment | Vercel (`vercel.json`) + GitHub Pages (`gh-pages`) |
| Testing | Vitest 4.x |

### Route Map

| Path | Component | Purpose |
|---|---|---|
| `/` | `PricingOverview` | Public pricing page with tier cards, feature tables, FAQ |
| `/simulator` | `Simulator` | 8-step guided quote builder / configurator |
| `/*` | `<Navigate to="/" />` | Catch-all redirect to home |

### Entry Point Chain

```
src/main.tsx
  -> ThemeProvider (src/contexts/ThemeContext.tsx)
    -> App (src/App.tsx)
      -> BrowserRouter
        -> Routes
          -> Layout (src/components/Layout.tsx)
            -> SiteHeader + SiteFooter
            -> PricingOverview | Simulator
```

---

## Flow A: Pricing Page View (`/`)

### Purpose
Display published pricing tiers, feature comparison tables, module add-on pricing, and FAQ for visitors who want to browse pricing without going through the configurator.

### Step-by-step

1. User visits `/`.
2. `App.tsx` renders `<Layout><PricingOverview /></Layout>`.
3. `PricingOverview.tsx` (`src/pages/PricingOverview.tsx`) initializes with:
   - Local state: `activeTab` (`'report' | 'core' | 'watchtower'`), `expandedSections` (collapsible state).
4. Imports static data:
   - `reportTiers`, `coreTiers`, `modules`, `watchtower`, `pricingFooter` from `src/data/pricing.ts`
   - `reportFeatureComparison`, `coreFeatureComparison` from `src/data/featureComparisons.ts`
   - `getCoreProAdvantageMessage()` from `src/utils/pricingCalculators.ts`
5. Renders three tabbed sections controlled by `activeTab`:

   **Report tab** (`activeTab === 'report'`):
   - 3 tier cards: Report Lite ($0/mo), Report Plus ($49/mo), Report Pro ($99/mo)
   - Each card shows: name, tagline, basePrice, additionalLocationPrice, aiCredits, visuals, refresh, features (first 5), bestFor
   - Collapsible `FeatureComparisonTable` with `reportFeatureComparison` data (10 categories, 3 tier columns)

   **Core tab** (`activeTab === 'core'`):
   - 3 tier cards: Core Lite ($169/mo), Core Pro ($319/mo), Enterprise (Custom)
   - Enterprise card links to `https://sundae.io/demo` instead of `/simulator`
   - Portfolio Pricing Advantage message (dynamic, from `getCoreProAdvantageMessage()` which computes the Core Pro vs Core Lite break-even at 31 locations)
   - Collapsible `FeatureComparisonTable` with `coreFeatureComparison` data (13 categories, 3 tier columns)
   - Module add-on table showing all 9 modules with orgLicensePrice, perLocationPrice, 5-location and 10-location example costs

   **Watchtower tab** (`activeTab === 'watchtower'`):
   - 4 cards: Competitive Intelligence ($399/mo), Event & Calendar Signals ($199/mo), Market Trends ($249/mo), Full Bundle ($720/mo)
   - Each card shows: basePrice, perLocationPrice, example costs at 1/5/10 locations
   - Bundle card shows savings badge ($127/mo base savings, 15%)
   - Strategic value disclaimer

6. Below all tabs: Collapsible FAQ section with 3 hard-coded Q&As.
7. Pricing footer: effective date, tax note, change notice from `pricingFooter`.
8. All tier card CTAs navigate to `/simulator` via `react-router-dom` `useNavigate()`.

### Key Files

| File | Role |
|---|---|
| `src/pages/PricingOverview.tsx` | Page component, renders all tabs/cards/tables |
| `src/data/pricing.ts` | `reportTiers`, `coreTiers`, `modules`, `watchtower`, `pricingFooter` |
| `src/data/featureComparisons.ts` | `reportFeatureComparison`, `coreFeatureComparison` arrays |
| `src/utils/pricingCalculators.ts` | `getCoreProAdvantageMessage()`, `calculateCoreProBreakEven()` |
| `src/components/PricingOverview/FeatureComparisonTable.tsx` | Reusable comparison table component |

---

## Flow B: Quote Calculation (Simulator `/simulator`)

### Purpose
Guide the user through an 8-step journey to configure a Sundae stack, calculate pricing, project ROI, compare against competitors, and generate a PDF quote.

### Step-by-step

1. User visits `/simulator`.
2. `Simulator.tsx` (`src/pages/Simulator.tsx`) renders.
3. Reads `currentStep`, `journeySteps`, `newAchievements`, `showAchievement` from `useConfiguration()` Zustand store.
4. Shows `ProgressIndicator` (sticky bar below header) when `currentStep > 0`.
5. Renders one of 8 step components via `switch(currentStep)`:

#### Step 0: PathwaySelector (Persona Quiz)

**Component:** `src/components/PathwaySelector/PathwaySelector.tsx`

**Quiz questions** (from `src/data/personas.ts` -- `quizQuestions` array, 4 questions):

| # | `id` | Question | Type | Options |
|---|---|---|---|---|
| 0 | `locations` | "How many locations are in your kingdom?" | Single-select | solo (1), small (3), growing (8), enterprise (25) |
| 1 | `pain` | "What keeps you up at night?" | Multi-select (max 3) | 10 pain points (labor_costs, food_waste, supplier_prices, revenue_leakage, delivery_profitability, table_utilization, marketing_roi, guest_complaints, profit_visibility, competition) |
| 2 | `decisions` | "How do you make decisions today?" | Multi-select | 6 options (gut, pos, spreadsheets, fragmented, bi, ai) |
| 3 | `appetite` | "What's your analytics appetite?" | Single-select | exploring, ready, urgent |

**On quiz completion (`completeQuiz`):**
1. `calculatePersonaMatch(answers)` from `src/data/personas.ts` -- weighted scoring across 4 personas (explorer, optimizer, commander, strategist). Highest score wins.
2. `calculateModuleRecommendations(painSelections, locationAnswer, appetite)` from `src/lib/moduleRecommendationEngine.ts`:
   - Maps each selected pain point to primary/secondary module IDs via `PAIN_TO_MODULES` lookup table
   - Scores and ranks modules, capped by appetite (`exploring` = max 2, `ready` = max 3, `urgent` = max 4)
3. Calls `setModules(recommendedModuleIds)` to pre-select modules in store.
4. Calls `setLocations(locationOption.value)` to set location count from quiz answer.
5. Calls `setPersona(result.persona, confidence)`.
6. Shows persona reveal screen with confetti animation.
7. On "See Your Custom Stack" click: calls `loadFromPersona(persona)` which sets layer, tier, and watchtowerModules from persona's `recommendedPath`, then advances to step 1.

**4 Personas** (from `src/data/personas.ts`):

| ID | Name | Recommended Path | Location Range |
|---|---|---|---|
| `explorer` | The Data Explorer | `report-lite` | 1-2 |
| `optimizer` | The Efficiency Hunter | `core-lite` | 2-5 |
| `commander` | The Portfolio Commander | `core-pro` | 6-20 |
| `strategist` | The Market Strategist | `core-pro-watchtower` | 10-100 |

#### Step 1: LayerStack (Choose Report or Core)

**Component:** `src/components/ConfigBuilder/LayerStack.tsx`

- Shows two clickable layer cards: REPORT (starting $0/mo) and CORE (starting $169/mo)
- Shows non-clickable Watchtower info card (add-on, shown for awareness)
- On selection: calls `setLayer(layerId)`, `markStepCompleted('layer')`, advances to step 2

#### Step 2: TierSelector (Choose tier within layer)

**Component:** `src/components/ConfigBuilder/TierSelector.tsx`

- If `layer === 'report'`: shows 3 cards (Lite, Plus, Pro) from `reportTiers`
- If `layer === 'core'`: shows 3 cards (Lite, Pro, Enterprise) from `coreTiers`
- Highlights recommended tier via `suggestOptimalTier(locations, layer)` from `usePriceCalculation.ts`
- Shows feature comparison table below cards
- For Core layer: shows dynamic Core Pro advantage message from `getCoreProAdvantageMessage()`
- On selection: calls `setTier(tierId)`, advances to step 3

#### Step 3: LocationSlider (1-500 locations)

**Component:** `src/components/ConfigBuilder/LocationSlider.tsx`

- Logarithmic slider with fixed scale points: `[1, 5, 10, 30, 50, 100, 250, 500]`
- Uses `locationToPercent()` / `percentToLocation()` for logarithmic mapping
- Manual text input supported (up to 9999)
- Enterprise tier enforces minimum 101 locations
- Shows live pricing: total monthly and per-location (calculated via `usePriceCalculation` with no modules/watchtower)
- Scale labels: Independent (1-2), Small Portfolio (3-9), Growth Stage (10-24), Enterprise (25-50), Regional Chain (51-100), Major Chain (101-250), National Scale (251+)
- On continue: checks `getSkipToStep(layer, tier)` -- Report tiers skip modules/watchtower and go to step 6 (ROI); Core tiers go to step 4 (Modules)

#### Step 4: ModulePicker (Toggle modules, Core only)

**Component:** `src/components/ConfigBuilder/ModulePicker.tsx`

- Shows all 9 modules from `src/data/pricing.ts` as toggle cards
- **9 Modules** (all Core-only add-ons):
  - Labor Intelligence ($139 org + $19/loc from #6)
  - Inventory Connect ($139 org + $19/loc from #6)
  - Purchasing Analytics ($119 org + $15/loc from #6)
  - Marketing Performance ($169 org + $25/loc from #6)
  - Reservations Intelligence ($119 org + $15/loc from #6)
  - Profit Intelligence ($199 org + $29/loc from #6)
  - Revenue Assurance ($99 org + $12/loc from #6)
  - Delivery Economics ($129 org + $17/loc from #6)
  - Guest Experience ($89 org + $10/loc from #6)
- Each card shows: name, description, calculated price for current locations, ROI potential
- Detects Labor + Inventory combo ("Efficiency Combo Unlocked!")
- Shows running total with Tenzo savings comparison
- On continue: advances to step 5 (Watchtower)

#### Step 5: WatchtowerToggle (Toggle watchtower, Core only)

**Component:** `src/components/ConfigBuilder/WatchtowerToggle.tsx`

- 3 individual module cards + 1 bundle card:
  - Competitive Intelligence ($399 base + $49/additional loc)
  - Event & Calendar Signals ($199 base + $29/additional loc)
  - Market Trends ($249 base + $19/additional loc)
  - Full Watchtower Bundle ($720 base + $82/additional loc, 15% savings)
- Auto-suggests bundle when individual total exceeds bundle price
- When all 3 individual modules selected, auto-converts to bundle (in `useConfiguration.toggleWatchtowerModule`)
- Uses `calculateWatchtowerPrice()` from `src/lib/watchtowerEngine.ts` for live pricing
- Enterprise watchtower pricing kicks in at 30+ locations (flat tiers from `watchtowerEnterprise`)
- On continue: advances to step 6 (ROI)

#### Step 6: ROISimulator

**Component:** `src/components/PricingDisplay/ROISimulator.tsx`

- See [Flow D: ROI Calculation](#flow-d-roi-calculation) for detailed calculation logic.
- Collects business inputs via sliders, computes projected savings, shows breakdown.
- On continue: advances to step 7 (Summary)

#### Step 7: ConfigSummary (Final pricing + export)

**Component:** `src/components/Summary/ConfigSummary.tsx`

- See [Flow C: PDF Export / Email Quote](#flow-c-pdf-export--email-quote) for export details.
- See [Flow E: Competitor Comparison](#flow-e-competitor-comparison) for comparison details.
- Triggers confetti animation on mount.
- Renders collapsible sections:
  1. Configuration & Investment Summary (always open) -- shows tier, locations, modules, watchtower, AI credits, monthly total, annual total, per-location, price breakdown
  2. What's Included (collapsible, open by default on desktop) -- tier feature list
  3. View Full Competitor Comparison (collapsible, closed by default) -- CompactCompetitorCompare
  4. Watchtower Strategic Value (collapsible, open by default, only if watchtower selected) -- WatchtowerValue
  5. FAQ (collapsible, closed by default) -- PricingFAQ
  6. CTA row: EmailQuoteButton, PDFExportButton, BookDemoButton
  7. "Ready to Get Started?" CTA with "Start Free Trial" button
  8. Contact link to `https://www.sundae.io/contact`
  9. Pricing footer with effective date, currency, tax note, change notice

### State Management (Zustand Store)

**File:** `src/hooks/useConfiguration.ts`

**Store name:** `sundae-pricing-config` (localStorage key)

**Persisted state** (via `partialize`):
```typescript
{
  layer: 'report' | 'core' | null
  tier: 'lite' | 'plus' | 'pro' | 'enterprise'
  locations: number
  modules: string[]              // e.g. ['labor', 'inventory', 'marketing']
  watchtowerModules: string[]    // e.g. ['bundle'] or ['competitive', 'events']
  competitors: {
    current: CompetitorId[]
    evaluating: CompetitorId[]
    primaryComparison: CompetitorId
  }
  quizAnswers: Record<string, string>
  persona: Persona | null
  roiInputs: ROIInputs
  unlockedAchievements: string[]
  totalPoints: number
}
```

**Non-persisted state:**
- `currentStep` (number, 0-7)
- `journeySteps` (8 steps with completion flags)
- `newAchievements`, `showAchievement`, `isAnimating` (UI state)

**Key actions:**
- `setLayer(layer)` -- sets layer
- `setTier(tier)` -- sets tier, clears modules/watchtower if Report tier (they don't support add-ons)
- `setLocations(locations)` -- sets location count
- `toggleModule(moduleId)` -- toggles module in/out of selection
- `toggleWatchtowerModule(moduleId)` -- toggles watchtower; auto-converts 3 individual to bundle
- `setROIInputs(partial)` -- merges partial ROI inputs
- `loadFromPersona(persona)` -- sets layer, tier, watchtowerModules from persona path (does NOT overwrite modules -- those come from the recommendation engine)
- `reset()` -- resets to initial state
- `checkAchievements()` -- called after most state changes, unlocks gamification badges

**Tier availability rules** (inline in `setTier`):
- Report tiers: modules = false, watchtower = false
- Core tiers: modules = true, watchtower = true

### Price Calculation Chain

**Hook:** `src/hooks/usePriceCalculation.ts` -- `usePriceCalculation(layer, tier, locations, modules, watchtowerModules, clientProfile?)`

**Engine:** `src/lib/pricingEngine.ts` -- `calculateFullPrice(config)`

Calculation sequence:

```
usePriceCalculation()
  -> convertToEngineConfig()        // normalize inputs
  -> calculateFullPrice(config)     // main entry point
       |
       +-- if report: calculateReportPrice(tier, locations)
       |   Formula: basePrice + max(0, locations - 1) * additionalLocationPrice
       |
       +-- if core: calculateCorePrice(tier, locations)
       |   Formula: basePrice + max(0, locations - 1) * additionalLocationPrice
       |
       +-- for each selected module: calculateModulePrice(moduleId, locations)
       |   Formula: orgLicensePrice + max(0, locations - includedLocations) * perLocationPrice
       |   Note: includedLocations = 5 for all modules
       |
       +-- if watchtower selected: calculateWatchtowerPrice(selected, locations)
       |   -> delegates to watchtowerEngine.calculateWatchtowerPrice()
       |   Individual: basePrice + max(0, locations - 1) * perLocationPrice
       |   Bundle: $720 + max(0, locations - 1) * $82
       |   Enterprise (30+ locs): flat tier pricing from watchtowerEnterprise
       |
       +-- applyDiscounts(subtotal, clientProfile)
       |   1. Client type discount (growth=10%, multi-site=15%, enterprise=0/custom)
       |   2. Early adopter discount (20%, stacks on remainder)
       |   3. Custom negotiated discount (stacks on remainder)
       |
       +-- Returns PriceResult:
             { subtotal, discountsApplied[], total, perLocation, annualTotal,
               aiCreditsTotal, aiSeatsTotal, breakdown[] }
```

**Returned `PriceCalculation` object** (from hook):
```typescript
{
  total: number          // monthly total after discounts
  perLocation: number    // total / locations
  breakdown: PriceBreakdown[]  // line items with item, price, perLocation, category, note
  annualTotal: number    // total * 12
  annualPerLocation: number
  aiCredits: number      // sum of tier + early adopter bonus
  aiSeats: number        // from tier
  subtotal: number       // before discounts
  discounts: DiscountLine[]
  savings: { tenzo: { monthly, setup, firstYear } }
}
```

### Key Files for Flow B

| File | Role |
|---|---|
| `src/pages/Simulator.tsx` | Orchestrates 8-step journey, renders current step component |
| `src/hooks/useConfiguration.ts` | Zustand store -- all configuration state + actions |
| `src/hooks/usePriceCalculation.ts` | React hook wrapping pricingEngine |
| `src/lib/pricingEngine.ts` | `calculateFullPrice()`, `calculateReportPrice()`, `calculateCorePrice()`, `calculateModulePrice()`, `calculateWatchtowerPrice()`, `applyDiscounts()` |
| `src/lib/watchtowerEngine.ts` | `calculateWatchtowerPrice()` -- base+per-location model, enterprise tiers |
| `src/data/pricing.ts` | All pricing data (tiers, modules, watchtower, client types, early adopter, enterprise) |
| `src/data/personas.ts` | `quizQuestions`, `personas`, `calculatePersonaMatch()`, `achievements` |
| `src/lib/moduleRecommendationEngine.ts` | `calculateModuleRecommendations()`, `PAIN_TO_MODULES`, `APPETITE_MODIFIERS` |
| `src/utils/pricingCalculators.ts` | `calculateCoreProBreakEven()`, `getCoreProAdvantageMessage()`, `suggestOptimalTier()` |
| `src/utils/tierAvailability.ts` | `getSkipToStep()` -- determines which steps to skip for Report tiers |
| `src/types/configuration.ts` | TypeScript interfaces for Configuration, PriceBreakdown, PriceCalculation |
| `src/components/PathwaySelector/PathwaySelector.tsx` | Step 0: Persona quiz |
| `src/components/ConfigBuilder/LayerStack.tsx` | Step 1: Layer selection |
| `src/components/ConfigBuilder/TierSelector.tsx` | Step 2: Tier selection |
| `src/components/ConfigBuilder/LocationSlider.tsx` | Step 3: Location count slider |
| `src/components/ConfigBuilder/ModulePicker.tsx` | Step 4: Module marketplace |
| `src/components/ConfigBuilder/WatchtowerToggle.tsx` | Step 5: Watchtower toggle |
| `src/components/PricingDisplay/ROISimulator.tsx` | Step 6: ROI calculator |
| `src/components/Summary/ConfigSummary.tsx` | Step 7: Final summary |

---

## Flow C: PDF Export / Email Quote

### Purpose
Allow users to download a branded PDF quote and/or email it to the Sundae sales team.

### PDF Generation

**Component:** `src/components/Summary/PDFExport.tsx` (exports `PDFExportButton`)

**Generator:** `src/lib/pdfGenerator.ts` -- `generateQuotePDF(layer, tier, locations, selectedModules, watchtowerModules, pricing)`

**PDF construction** (using jsPDF):

1. **Header** (dark background):
   - Attempts to load Sundae wordmark logo from `/logos/sundae-wordmark.png`; falls back to "SUNDAE" text if image fails
   - Subtitle: "Decision Intelligence for Restaurants"
   - Quote ID: `SUN-{base36 timestamp}` (e.g. `SUN-M7K3P2`)
   - Generated date and valid-until date (30 days from generation)

2. **Configuration Summary section:**
   - Platform name (e.g. "CORE Pro")
   - Location count
   - Selected modules list
   - Watchtower selection

3. **Pricing Box** (light background):
   - Monthly investment (large)
   - Per-location cost
   - Annual total

4. **Price Breakdown table:**
   - Each line item from `pricing.breakdown`
   - Discount lines (if any) in green

5. **Competitor Comparison section** (if savings exist):
   - Uses `calculateAllComparisons()` from `src/data/competitorPricing.ts`
   - Shows up to 3 competitors with: name, their cost, Sundae cost, savings
   - "Best Savings" highlight bar
   - Disclaimer: "Competitor pricing based on public information and industry estimates"

6. **Footer** (on all pages):
   - "Sundae.io | Decision Intelligence for Restaurants"
   - Quote ID
   - Page numbers
   - "This quote is for informational purposes"

**Quote validity:** 30 days from generation date.

### Email Quote

**Component:** `src/components/Summary/EmailQuoteButton.tsx`

1. Generates the same PDF via `generateQuotePDF()`.
2. Downloads the PDF as `Sundae-Quote-{locations}loc-{date}.pdf`.
3. Shows an alert instructing user to attach the downloaded PDF.
4. Opens `mailto:sales@sundae.io` with pre-filled:
   - Subject: `Sundae Quote Request - {N} Locations`
   - Body: Configuration summary (platform, locations, monthly/annual investment, modules, watchtower) + instruction to attach PDF

### Book Demo

**Component:** `src/components/Summary/BookDemoButton.tsx`

- Opens `https://www.sundae.io/demo` in new tab with query params:
  - `locations`, `tier` (e.g. `core-pro`), `monthly`, `modules` (comma-separated), `source=pricing-configurator`

### Key Files

| File | Role |
|---|---|
| `src/components/Summary/PDFExport.tsx` | `PDFExportButton` -- download trigger |
| `src/components/Summary/EmailQuoteButton.tsx` | `EmailQuoteButton` -- PDF download + mailto |
| `src/components/Summary/BookDemoButton.tsx` | `BookDemoButton` -- links to sundae.io/demo |
| `src/lib/pdfGenerator.ts` | `generateQuotePDF()` -- jsPDF document builder |
| `src/data/competitorPricing.ts` | `calculateAllComparisons()` -- used in PDF for competitor comparison |

---

## Flow D: ROI Calculation

### Purpose
Project conservative, defensible operational savings based on the user's selected modules and business metrics.

### Input Collection

**Component:** `src/components/PricingDisplay/ROISimulator.tsx` (Step 6)

**Inputs collected** (from `roiInputs` in Zustand store):

| Input | Default | Range | Conditional |
|---|---|---|---|
| `monthlyRevenue` | $100,000 | $50K - $500K | Always shown |
| `laborPercent` | 32% | 20% - 40% | Always shown |
| `foodCostPercent` | 29% | 20% - 40% | Always shown |
| `marketingSpend` | $2,000 | $0 - $10K | Only if Marketing module selected |
| `deliveryRevenuePct` | 0% | 0% - 50% | Only if Delivery module selected |
| `hasReviewData` | false | toggle | Only if Guest Experience module selected |
| `reservationNoShowRate` | 15% | -- | Collected but not currently used in UI slider |

### Calculation Engine

**Hook:** `src/hooks/useROICalculation.ts` -- `useROICalculation(config, inputs, platformCost)`

**Savings assumptions** (`SAVINGS_ASSUMPTIONS` constant, single source of truth):

| Module | Min % | Mid % | Max % | Base Amount | Per-Location Cap |
|---|---|---|---|---|---|
| `labor` | 0.5% | 1.0% | 1.5% | total monthly revenue | $2,500 |
| `inventory` | 0.3% | 0.65% | 1.0% | total monthly revenue | $1,500 |
| `purchasing` | 0.2% | 0.5% | 0.8% | total monthly revenue | $1,500 |
| `reservations` | 0.5% | 1.25% | 2.0% | total monthly revenue | $1,500 |
| `marketing` | 5% | 10% | 15% | total marketing spend (all locations) | $1,000 |
| `profit` | 0.2% | 0.5% | 0.8% | total monthly revenue | $1,200 |
| `revenue` | 0.05% | 0.15% | 0.25% | total monthly revenue | $500 |
| `delivery` | 0.2% | 0.5% | 0.8% | delivery revenue (monthlyRevenue * deliveryRevenuePct/100) | $800 |
| `guest` | 0.05% | 0.1% | 0.2% | total monthly revenue (soft benefit) | $300 |

**Calculation steps:**

1. For each selected module:
   - Compute `midAmount = baseAmount * midPct`
   - Apply per-location cap: `cappedAmount = min(midAmount, maxCap * locations)`
   - If required input missing (marketing spend = 0 for marketing module, delivery % = 0 for delivery), amount = 0
   - Guest Experience: counted in total only if `hasReviewData = true`
2. Sum all counted savings into `totalSavings`.
3. Apply global guardrails:
   - Max total savings per location: $8,000/month
   - If total exceeds cap, scale all lines proportionally
4. Calculate ROI metrics:
   - `roi = totalSavings / platformCost` (capped at 15x)
   - `paybackDays = ceil((platformCost / totalSavings) * 30)` (floored at 14 days minimum)

**Returns `ROICalculation`:**
```typescript
{
  monthlySavings: number
  annualSavings: number
  roi: number           // e.g. 3.5 (meaning 3.5x)
  roiPercent: number    // e.g. 350
  paybackDays: number
  savingsLines: SavingsLineItem[]  // per-module breakdown with ranges and tooltips
  breakdowns: Record<string, number>
  projectedImprovements: Record<string, number>
}
```

### UI Display

- 4 headline metrics: Monthly Savings, Annual Savings, ROI Multiple, Payback Period
- Per-module savings breakdown with progress bars, hover tooltips showing min/max range
- Missing-input warnings (e.g. "Add marketing spend to estimate savings")
- Soft benefit indicator for Guest Experience when not counted in totals
- Platform cost vs savings comparison card
- Top savings categories callout
- `generateROIDescription()` produces a human-readable summary sentence

### Key Files

| File | Role |
|---|---|
| `src/hooks/useROICalculation.ts` | `useROICalculation()` hook, `SAVINGS_ASSUMPTIONS`, `GUARDRAILS`, `generateROIDescription()`, `getTopSavingsCategories()` |
| `src/components/PricingDisplay/ROISimulator.tsx` | Step 6 UI -- sliders, results display, savings breakdown |

---

## Flow E: Competitor Comparison

### Purpose
Show how Sundae's pricing compares against alternatives, with verification levels and honest positioning.

### Data Sources

Two parallel competitor data systems exist in the codebase:

1. **`src/data/competitors.ts`** -- Competitor profiles with feature flags, pain points, Sundae advantages. Used for qualitative comparisons. Defines 10 `CompetitorId` values: `tenzo`, `nory`, `marketman`, `restaurant365`, `powerbi`, `tableau`, `looker`, `excel`, `pos-native`, `nothing`.

2. **`src/data/competitorPricing.ts`** -- Quantitative pricing calculators with verification levels. The primary data source for cost comparisons. Defines `COMPETITOR_PRICING` with per-competitor `calculate()` functions. 7 competitors with calculators: `tenzo`, `nory`, `restaurant365`, `powerbi`, `spreadsheets`, `marketman`, `sevenShifts`.

3. **`src/lib/competitorEngine.ts`** -- Legacy competitor engine with 10 per-competitor cost calculators. Used by `competitorEngine.calculateCompetitorCost()` and `calculateSavings()`. Includes both direct-cost competitors and opportunity-cost models (Spreadsheets, POS-native, Nothing).

### Verification Levels

| Level | Meaning | Show in comparison? |
|---|---|---|
| `verified` | From public pricing page | Yes |
| `estimated` | Industry research + estimates | Yes |
| `unverified` | Pricing not publicly available | No (filtered out) |

**Verified competitors:** Tenzo, MarketMan, 7shifts
**Estimated competitors:** Restaurant365, Power BI, Spreadsheets
**Unverified (excluded):** Nory

### Comparison Calculation

**Function:** `calculateAllComparisons(locations, modules, sundaeMonthlyCost)` from `src/data/competitorPricing.ts`

1. Iterates over competitor IDs: `['tenzo', 'nory', 'powerbi', 'spreadsheets', 'restaurant365', 'marketman', 'sevenShifts']`
2. Calls each competitor's `calculate(locations, modules)` function
3. Filters out: null results, unverified competitors, competitors with `showPricing: false`
4. Computes savings: `competitorFirstYear - sundaeAnnual`
5. Sorts by highest first-year savings

**Each comparison result:**
```typescript
{
  competitor: { id, name, icon, category }
  competitorCost: { monthly, firstYear, ongoing, setupFee, breakdown }
  sundaeCost: { monthly, annual }
  savings: { firstYear, ongoing, monthly }
  notes: string | null
  limitations: string[]
}
```

### UI Display

**Component:** `src/components/Summary/CompactCompetitorCompare.tsx`

- Expandable competitor cards sorted by savings (highest first)
- Each card shows: competitor name, category, verification badge, first-year savings
- Expanded view: side-by-side cost breakdown, notes, limitations, pricing source link
- "Best Savings Opportunity" highlight card
- Honest positioning: competitors where Sundae costs more are shown separately with note: "Some point solutions may be cheaper if you only need specific features"
- "View assumptions" toggle shows pricing sources and methodology

### Key Files

| File | Role |
|---|---|
| `src/components/Summary/CompactCompetitorCompare.tsx` | UI component in ConfigSummary |
| `src/data/competitorPricing.ts` | `COMPETITOR_PRICING`, `calculateAllComparisons()`, `calculateCompetitorComparison()`, verification levels |
| `src/data/competitors.ts` | `competitors` profiles, `CompetitorId` type, feature flags, pain points |
| `src/lib/competitorEngine.ts` | Legacy per-competitor cost calculators, `calculateSavings()`, `getDefaultCompetitors()` |
| `src/config/pricingAssumptions.ts` | Canonical constants: `SPREADSHEETS_LABOR_RATE_USD = $25`, `TENZO_PER_LOCATION_PER_MODULE = $75` |

---

## Gamification / Achievement System

The configurator includes a lightweight achievement system to encourage engagement.

**Tracked in Zustand store:** `unlockedAchievements[]`, `totalPoints`, `newAchievements[]`, `showAchievement`

**Achievements** (from `src/data/personas.ts`):

| ID | Name | Trigger | Points |
|---|---|---|---|
| `explorer` | Data Explorer | Quiz completed | 10 |
| `stack-builder` | Stack Builder | Tier selected | 20 |
| `module-master` | Module Master | 2+ modules selected | 30 |
| `intelligence-commander` | Intelligence Commander | Watchtower selected | 50 |
| `roi-believer` | ROI Believer | ROI calculated | 25 |
| `sundae-ready` | Sundae Ready | All steps completed | 100 |
| `savings-hero` | Savings Hero | 50%+ savings vs competitor | 40 |
| `efficiency-expert` | Efficiency Expert | Labor + Inventory combo | 35 |
| `full-stack` | Full Stack Operator | All 9 modules selected | 75 |
| `empire-builder` | Empire Builder | 10+ locations | 45 |

**Display:** `AchievementNotification` component (`src/components/shared/AchievementNotification.tsx`) shows toast notifications with auto-dismiss after 3 seconds.

---

## Data Flow Diagram (Simplified)

```
[User Input]
     |
     v
[Zustand Store]  <-- useConfiguration()
  |  layer, tier, locations, modules, watchtowerModules, roiInputs
  |
  +---> usePriceCalculation()
  |       |
  |       +---> pricingEngine.calculateFullPrice()
  |       |       |
  |       |       +---> calculateReportPrice() / calculateCorePrice()
  |       |       +---> calculateModulePrice() (per module)
  |       |       +---> calculateWatchtowerPrice() -> watchtowerEngine
  |       |       +---> applyDiscounts()
  |       |       |
  |       |       +---> PriceResult { total, perLocation, breakdown[], annualTotal, ... }
  |       |
  |       +---> PriceCalculation (augmented with tenzo comparison)
  |
  +---> useROICalculation(config, roiInputs, platformCost)
  |       |
  |       +---> Per-module savings using SAVINGS_ASSUMPTIONS
  |       +---> Global guardrails (cap, min payback)
  |       +---> ROICalculation { monthlySavings, roi, paybackDays, savingsLines[] }
  |
  +---> calculateAllComparisons(locations, modules, total)
  |       |
  |       +---> Per-competitor calculate() functions
  |       +---> Filter + sort by savings
  |       +---> ComparisonResult[]
  |
  +---> generateQuotePDF(...)
          |
          +---> jsPDF document with header, config, pricing, competitors, footer
          +---> Returns Blob for download or email attachment
```

---

## Pricing Formulas Reference

### Tier Base Price
```
monthly = basePrice + max(0, locations - 1) * additionalLocationPrice
```

### Module Price
```
monthly = orgLicensePrice + max(0, locations - includedLocations) * perLocationPrice
```
Where `includedLocations = 5` for all modules.

### Watchtower Price (Individual)
```
monthly = basePrice + max(0, locations - 1) * perLocationPrice
```

### Watchtower Price (Bundle)
```
monthly = $720 + max(0, locations - 1) * $82
savings = (sum of individual prices) - bundle price  // ~15% discount
```

### Watchtower Price (Enterprise, 30+ locations)
Flat monthly tiers from `watchtowerEnterprise`:
- 30-50 locations: Bundle = $2,500/mo
- 51-100 locations: Bundle = $4,000/mo
- 101+ locations: Custom pricing

### Discount Stacking
```
1. subtotal = sum of all line items
2. after_client_discount = subtotal * (1 - clientTypeDiscount%)
   - independent: 0%
   - growth (3-24 locs): 10%
   - multi-site (25-29 locs): 15%
   - enterprise/franchise: 0% (use volume pricing instead)
3. after_early_adopter = after_client_discount * (1 - 20%)
4. after_custom = after_early_adopter * (1 - customDiscountPercent%)
5. total = round to 2 decimal places
```

### Core Pro vs Core Lite Break-even
```
Core Lite: $169 + (n-1) * $54
Core Pro:  $319 + (n-1) * $49
Break-even at n = 31 locations (Pro cheaper from n = 32+)
```

### Tenzo Comparison
```
tenzo_monthly = locations * moduleCount * $75
tenzo_setup = locations * moduleCount * $350
tenzo_firstYear = (tenzo_monthly * 12) + tenzo_setup
```

---

## Important Implementation Notes

1. **No server-side rendering.** This is a pure SPA. All computation happens in the browser. The Vite dev server and Vercel deployment serve static files only.

2. **State persistence.** The Zustand store persists to `localStorage` under key `sundae-pricing-config`. This means a returning visitor sees their previous configuration. The `reset()` action clears this.

3. **No authentication.** There are no user accounts, logins, or sessions. Anyone can access the pricing page and simulator.

4. **Pricing data is static.** All prices come from TypeScript constants in `src/data/pricing.ts`, last updated January 1, 2026. There is a pre-build validation script (`npm run validate:pricing`) that checks pricing data integrity.

5. **PDF generation is client-side.** The jsPDF library generates PDFs entirely in the browser. No server is involved. The PDF includes a 30-day validity disclaimer.

6. **Competitor pricing is sourced from public information.** Verification levels (verified/estimated/unverified) are tracked per competitor. Unverified competitors are excluded from comparison displays.

7. **ROI projections use conservative midpoint assumptions.** Guardrails prevent unrealistic claims: max $8K savings/location/month, max 15x ROI, min 14-day payback.

8. **Module recommendations are deterministic.** The `moduleRecommendationEngine.ts` maps pain point selections to module IDs via a fixed lookup table. No ML or dynamic personalization.

9. **The quiz pre-selects modules but the user can edit.** `loadFromPersona()` sets layer/tier/watchtower, while `setModules()` is called separately with recommendation engine output. Both are editable in subsequent steps.

10. **Report tiers skip steps 4-5.** Report tiers do not support modules or watchtower add-ons. The flow skips directly from LocationSlider (step 3) to ROISimulator (step 6) via `getSkipToStep()`.
