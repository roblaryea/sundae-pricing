# Entitlements Alignment Audit

> Validates that the pricing model's claims about features, limits, and entitlements are consistently enforced in the codebase.

## Architecture Note

**This repository (`sundae-pricing`) is a standalone pricing/quote website.** It does NOT contain:
- Backend subscription management
- Billing/checkout logic
- Entitlement issuance or enforcement
- Feature flag gating
- Module access control
- AI credit tracking or consumption

Entitlement enforcement would live in the main Sundae application (separate repo). This audit therefore focuses on **internal consistency** — verifying that claims made on the pricing site match the data model, and that the data model is self-consistent.

---

## Audit 1: AI Credits — Math Consistency

### Report Tiers

| Tier | Base Credits | Per Location | @ 5 Locations | Formula |
|------|-------------|-------------|---------------|---------|
| Lite | 40 | 8 | 40 + 4*8 = 72 | base + (locations-1) * perLocation |
| Plus | 150 | 30 | 150 + 4*30 = 270 | base + (locations-1) * perLocation |
| Pro | 400 | 80 | 400 + 4*80 = 720 | base + (locations-1) * perLocation |

### Core Tiers

| Tier | Base Credits | Per Location | @ 5 Locations | Formula |
|------|-------------|-------------|---------------|---------|
| Lite | 800 | 160 | 800 + 4*160 = 1,440 | base + (locations-1) * perLocation |
| Pro | 1,400 | 280 | 1,400 + 4*280 = 2,520 | base + (locations-1) * perLocation |
| Enterprise | Unlimited | Unlimited | Unlimited | N/A |

**Status: CONSISTENT**
- `pricingEngine.ts` `calculateReportPrice()` and `calculateCorePrice()` both compute `base + (locations - 1) * perLocation` for AI credits
- The formula is correct and matches the pricing data

### AI Credit Actions

| Action | Cost | Documented In |
|--------|------|---------------|
| Chat with visual | 2 credits | reportTiers.pro.features[12] |
| Standard AI query | 1 credit (implied) | Not explicitly documented |

**Status: PARTIAL — "Chat with visual (2 credits)" only mentioned in Report Pro features**

---

## Audit 2: AI Seats

| Tier | AI Seats | Documented |
|------|----------|------------|
| Report Lite | 1 | pricing.ts, featureComparisons.ts |
| Report Plus | 3 | pricing.ts, featureComparisons.ts |
| Report Pro | 5 | pricing.ts, featureComparisons.ts |
| Core Lite | 10 | pricing.ts, featureComparisons.ts |
| Core Pro | 20 | pricing.ts, featureComparisons.ts |
| Enterprise | Unlimited | pricing.ts, featureComparisons.ts |

**Additional AI Seat Pricing (from featureComparisons.ts only):**
- Report: $12/seat (Lite), $10/seat (Plus), $8/seat (Pro)
- Core: $5/seat (Lite), $5/seat (Pro), N/A (Enterprise)

**Status: CONSISTENT between pricing.ts and featureComparisons.ts**

---

## Audit 3: Benchmark Features

| Feature | Report Lite | Report Plus | Report Pro | Core Lite | Core Pro | Enterprise |
|---------|------------|-------------|------------|-----------|----------|------------|
| Metrics | 5 | 15 | 30 | 30+ | 30+ | 30+ |
| Radius | 1km locked | 1-2km | 1-3km | 1-5km | 0.5-10km | Custom |
| Filters | "All restaurants" | 1 filter | 2 filters | 3+ filters | Unlimited | Unlimited |

**Status: CONSISTENT**
- pricing.ts data matches featureComparisons.ts claims
- Core features tables correctly show 3+ / unlimited filters

---

## Audit 4: Data Retention

| Tier | Retention | Documented |
|------|-----------|------------|
| Report Lite | Current month + 90 days | pricing.ts, featureComparisons.ts |
| Report Plus | Current month + 1 year | pricing.ts, featureComparisons.ts |
| Report Pro | Current month + 2 years | pricing.ts, featureComparisons.ts |
| Core Lite | Current month + 2 years | pricing.ts, featureComparisons.ts |
| Core Pro | Current month + 3 years | pricing.ts, featureComparisons.ts |
| Enterprise | Custom (5+ years) | pricing.ts, featureComparisons.ts |

**Status: CONSISTENT**

---

## Audit 5: Module Availability by Tier

`src/utils/tierAvailability.ts` defines `TIER_AVAILABILITY`:

| Layer/Tier | Modules | Watchtower |
|------------|---------|------------|
| report-lite | No | No |
| report-plus | No | No |
| report-pro | No | No |
| core-lite | Yes | Yes |
| core-pro | Yes | Yes |
| core-enterprise | Yes | Yes |

**Status: CONSISTENT**
- `canAccessModules()` returns true only for core tiers
- `canAccessWatchtower()` returns true only for core tiers
- `shouldShowStep()` correctly hides module/watchtower steps for report tiers
- Pricing page (PricingOverview.tsx) shows modules section under Core tiers only

---

## Audit 6: Rollover Policy

| Tier | Rollover | Max |
|------|----------|-----|
| Report Lite | None | 0 |
| Report Plus | 25% | 50 |
| Report Pro | 25% | 100 |
| Core Lite | 25% | 200 |
| Core Pro | 25% | 350 |
| Enterprise | N/A (unlimited) | N/A |

**Status: CONSISTENT** — values match between pricing.ts and feature lists

---

## Audit 7: Support SLA

| Tier | Support Level |
|------|--------------|
| Report Lite | Email (72hr) |
| Report Plus | Email + Chat (24hr) |
| Report Pro | Email + Chat (12hr) |
| Core Lite | Email + Chat + Phone (4hr) |
| Core Pro | Email + Chat + Phone (2hr priority) |
| Enterprise | Dedicated CSM (24/7, 15min SLA) |

**Add-on Support (featureComparisons.ts):**
- Priority Support (2hr SLA): +$149/mo
- Premium Support (24/7, 1hr SLA): +$299/mo

**Status: CONSISTENT**

---

## Audit 8: Feature List vs Limitations Consistency

### Report Lite
- Claims: "No API integration" in limitations ✓
- Claims: "No dashboard sharing" in limitations ✓
- Claims: "No rollover credits" in limitations ✓
- Data: `dataInput: 'Manual CSV'` matches limitation ✓

### Report Plus
- Claims: "No API integration" in limitations ✓
- Claims: "Single segment filter only" in limitations ✓
- Data: `segmentFilters: '1 simultaneous filter'` matches ✓

### Report Pro
- Claims: "Next-day data (not real-time)" in limitations ✓
- Claims: "Chat with visual (2 credits)" in features ✓
- Data: `dataInput: 'API integration (automated)'` matches features ✓

### Core Lite
- Claims: "Single POS system only" in limitations ✓
- Data: `multiPOS: false` matches ✓
- Claims: "14-day forecasting" in limitations ✓
- Data: `predictiveDays: 14` matches ✓

### Core Pro
- Claims: "Multi-POS support (unlimited systems)" in features ✓
- Data: `multiPOS: true` matches ✓
- Claims: "30-day predictive forecasting" in features ✓
- Data: `predictiveDays: 30` matches ✓
- No limitations listed (empty array) — this is intentional for the top-tier core product

**Status: ALL CONSISTENT**

---

## Audit 9: Discount Stacking Logic

`pricingEngine.ts` `applyDiscounts()`:
1. Client type discount applied first (growth 10%, multi-site 15%, enterprise 0%)
2. Early adopter discount (20%) applied on discounted amount
3. Stacking: 1000 * 0.9 (growth) * 0.8 (early adopter) = 720

**Test coverage:** ✓ (pricing.test.ts line 148-156)

**CLIENT_TYPE_RULES alignment:**
- independent: 0% ✓
- growth: 10% ✓
- multi-site: 15% ✓
- enterprise: 0% (uses volume/org pricing instead) ✓
- franchise: 0% (uses enterprise pricing) ✓

**Status: CONSISTENT**

---

## Audit 10: Enterprise Threshold

- `enterprisePricing.minLocations = 30` ✓
- `CLIENT_TYPE_RULES['enterprise'].locationRange = [30, null]` ✓
- `detectClientType(30)` returns `'enterprise'` ✓
- `BREAK_EVEN_POINTS.enterprise.locations = 30` ✓

**Status: CONSISTENT**

---

## Issues Found

### Issue 1: Add-on Prices Not in Source of Truth (Low Severity)
AI seat prices, credit top-up prices, and support add-on prices exist only in `featureComparisons.ts`. They should be added to `pricing.ts` for completeness.

### Issue 2: "Chat with visual (2 credits)" Only in Report Pro (Info)
This credit cost information is only mentioned in Report Pro features. If it applies to all tiers, it should be documented more broadly.

### Issue 3: No Runtime Entitlement Enforcement (Expected)
This repo is a pricing site only. Actual entitlement enforcement must be verified in the main Sundae application.

---

## Recommendations

1. **Add `addOnPricing` to pricing.ts** — Extract AI seat costs, credit top-ups, and support add-on prices into the canonical source
2. **Document credit costs broadly** — If "chat with visual = 2 credits" is universal, add it to a shared location
3. **Cross-repo entitlement audit** — Conduct a separate audit of the main Sundae app to verify feature gating matches pricing claims
