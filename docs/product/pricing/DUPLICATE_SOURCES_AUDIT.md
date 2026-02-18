# Duplicate Sources of Truth Audit

> Identifies all locations where pricing values are defined outside the canonical source (`src/data/pricing.ts`) and whether they should be refactored.

## Canonical Source

**File:** `src/data/pricing.ts`
**Status:** Single source of truth for all Sundae pricing data
**Exports:** `reportTiers`, `coreTiers`, `modules`, `watchtower`, `CLIENT_TYPE_RULES`, `EARLY_ADOPTER_TERMS`, `enterprisePricing`, `watchtowerEnterprise`, `BREAK_EVEN_POINTS`, `competitorPricing`, `pricingFooter`, `pricingChangelog`, `detectClientType`

---

## Duplicate #1: LayerStack.tsx Hard-Coded Prices

**File:** `src/components/ConfigBuilder/LayerStack.tsx`
**Lines:** 28, 42, 59

| Hard-coded String | Canonical Value | Source |
|-------------------|----------------|--------|
| `"Starting at $0/month"` | `reportTiers.lite.basePrice = 0` | pricing.ts:52 |
| `"Starting at $169/month"` | `coreTiers.lite.basePrice = 169` | pricing.ts:179 |
| `"Add-on: From $199/mo + per-location"` | `watchtower.events.basePrice = 199` (cheapest) | pricing.ts:569 |

**Verdict: SHOULD REFACTOR**
These strings can be derived from the pricing data. Replace with template literals importing from pricing.ts.

**Proposed Fix:**
```typescript
import { reportTiers, coreTiers, watchtower } from '../../data/pricing';

// In layers array:
startingPrice: `Starting at $${reportTiers.lite.basePrice}/month`
startingPrice: `Starting at $${coreTiers.lite.basePrice}/month`

// For watchtower:
const cheapestWatchtower = Math.min(
  watchtower.competitive.basePrice,
  watchtower.events.basePrice,
  watchtower.trends.basePrice
);
startingPrice: `Add-on: From $${cheapestWatchtower}/mo + per-location`
```

---

## Duplicate #2: Feature Comparison Table Prices

**File:** `src/data/featureComparisons.ts`
**Lines:** 39, 55-57, 90-92, 161, 208-209, 236-240

These are **add-on prices** (AI seats, credit top-ups, support tiers, data retention upgrades) that are NOT defined in pricing.ts:

| Value | Where | In pricing.ts? |
|-------|-------|----------------|
| `$12/seat/mo` (Report Lite AI seat) | featureComparisons.ts:39 | No |
| `$10/seat/mo` (Report Plus AI seat) | featureComparisons.ts:39 | No |
| `$8/seat/mo` (Report Pro AI seat) | featureComparisons.ts:39 | No |
| `$5/seat/mo` (Core AI seat) | featureComparisons.ts:161 | No |
| `$19/mo` retention upgrade | featureComparisons.ts:55-56 | No |
| `$32/mo` retention upgrade | featureComparisons.ts:57 | No |
| `$29/mo` retention upgrade | featureComparisons.ts:57,208 | No |
| `$49/mo` retention upgrade | featureComparisons.ts:209 | No |
| `$30/$20/$15` credit top-ups (100) | featureComparisons.ts:90 | No |
| `$85/$65` credit top-ups (500) | featureComparisons.ts:91 | No |
| `$160/$120` credit top-ups (1000) | featureComparisons.ts:92 | No |
| `$12/$10` credit top-ups (Core 100) | featureComparisons.ts:236 | No |
| `$50/$40` credit top-ups (Core 500) | featureComparisons.ts:237 | No |
| `$90/$70` credit top-ups (Core 1000) | featureComparisons.ts:238 | No |
| `$149/mo` priority support | featureComparisons.ts:239 | No |
| `$299/mo` premium support | featureComparisons.ts:240 | No |

**Verdict: DOCUMENT — ACCEPTABLE DUPLICATION**

These are add-on/upsell prices that only appear in the feature comparison tables. They represent a secondary pricing surface. The ideal fix would be to add an `addOnPricing` section to pricing.ts and import from there, but the current scope is limited to the feature comparison table display only. The risk is low since these values change infrequently.

**Recommendation:** Add a comment header in `featureComparisons.ts` noting that these prices should be cross-referenced with pricing.ts when updating, and consider extracting them to pricing.ts in a future refactor.

---

## Duplicate #3: usePriceCalculation.ts Stale Comments

**File:** `src/hooks/usePriceCalculation.ts`
**Lines:** 103-105, 132-133

Stale comments reference old watchtower prices:
```
// Individual prices: $199 + $99 + $149 = $447
// Bundle price: $349
// Savings: $98
```

Current actual prices: `$399 + $199 + $249 = $847`, bundle `$720`, savings `$127`.

**Verdict: FIX — STALE COMMENTS**
These comments are incorrect and misleading. They should be updated or removed.

---

## Duplicate #4: Competitor Pricing Data

**File:** `src/data/competitorPricing.ts`
**Lines:** Multiple

Contains hard-coded competitor prices (Tenzo $75/loc/module, MarketMan $250/loc, etc.). These are NOT duplicates of Sundae pricing — they are third-party prices.

**File:** `src/data/pricing.ts:810-826`
Also contains a `competitorPricing` export with Tenzo data.

**Verdict: MINOR DUPLICATION**
Tenzo pricing exists in both `pricing.ts` (legacy) and `competitorPricing.ts` (detailed). The `pricing.ts` version is marked "For backward compatibility" and is not imported by any component (only used in tests and the pricing engine's `calculateTenzoPrice` function, which uses its own constants from `competitorPricing.ts`).

**Recommendation:** Remove `competitorPricing` export from `pricing.ts` in a future cleanup, since `competitorPricing.ts` is the authoritative source for competitor data.

---

## Duplicate #5: pricingAssumptions.ts

**File:** `src/config/pricingAssumptions.ts`

Contains `SPREADSHEETS_LABOR_RATE_USD = 25` and Power BI cost assumptions. These are NOT Sundae pricing values — they are competitor/market assumptions used in ROI calculations.

**Verdict: NOT A DUPLICATE — CORRECT SEPARATION**
These are configuration assumptions for competitor cost modeling, appropriately separated from Sundae's own pricing.

---

## Duplicate #6: WatchtowerValue.tsx Revenue Assumption

**File:** `src/components/Summary/WatchtowerValue.tsx:22`

Contains `$100,000` monthly revenue per location assumption for watchtower value calculations.

**Verdict: ACCEPTABLE — UI ASSUMPTION**
This is a display assumption, not a pricing value. It could be made configurable via the ROI inputs but is reasonable as a default.

---

## Summary Table

| # | Location | Type | Severity | Action |
|---|----------|------|----------|--------|
| 1 | LayerStack.tsx | Hard-coded prices | Medium | **Refactor to import from pricing.ts** |
| 2 | featureComparisons.ts | Add-on pricing strings | Low | Document; future refactor to pricing.ts |
| 3 | usePriceCalculation.ts | Stale comments | Low | **Fix comments** |
| 4 | pricing.ts competitorPricing | Legacy duplicate | Low | Remove in future cleanup |
| 5 | pricingAssumptions.ts | Market assumptions | None | Correct separation |
| 6 | WatchtowerValue.tsx | Display assumption | None | Acceptable |

## Actions Taken

1. **LayerStack.tsx** — Documented; refactor recommended in next sprint
2. **usePriceCalculation.ts** — Stale comments identified for fix
3. **featureComparisons.ts** — Documented as known secondary pricing surface
