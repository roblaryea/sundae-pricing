# Pricing Tests Audit

> Catalog of all pricing-related tests, validation scripts, and safety nets.

## Test Infrastructure

| Tool | Config | Command |
|------|--------|---------|
| Vitest | `vitest` (v4.0.16) | `npm test` / `npx vitest run` |
| tsx | scripts runner | `npx tsx scripts/*.ts` |

## Test Files

### 1. `__tests__/pricing.test.ts` (Primary Test Suite)

**Command:** `npm run test:pricing`

| Suite | Tests | Purpose |
|-------|-------|---------|
| Report Tier Pricing | 5 | Price calculations for Lite/Plus/Pro at various location counts |
| Core Tier Pricing | 3 | Price calculations for Core Lite/Pro, premium positioning |
| Module Pricing | 5 | Org license + per-location calculations for all modules |
| Watchtower Pricing | 4 | Base + per-location model, bundle auto-apply, savings |
| Discount Stacking | 4 | Growth 10%, Multi-site 15%, Enterprise 0%, Early adopter stacking |
| Enterprise Pricing | 2 | Threshold at 30+, Org License calculation |
| Data Integrity | 2 | multi-site key format, Early adopter terms |
| **No Duplicated Pricing Sources** | **6** | **NEW** — Structural integrity of tier/module/watchtower objects |
| **AI Credits Math** | **3** | **NEW** — Credits scale correctly with locations |
| **Bundle Discount Correctness** | **3** | **NEW** — Bundle math, savings %, includes array |
| **Client Type Detection** | **5** | **NEW** — Boundary testing for all client types |
| **Module Pricing (All 9)** | **5** | **NEW** — Every module has valid prices, included locations |
| **Watchtower Individual Pricing** | **4** | **NEW** — Base + per-location for each individual module |
| **Tier Hierarchy Invariants** | **7** | **NEW** — Prices/credits/seats always increase with tier |
| **Enterprise Pricing Structural** | **4** | **NEW** — Volume tiers sorted, per-loc price decreases with scale |

**Total: 62 tests** (25 original + 37 new safety nets)

### 2. `scripts/validate-pricing.ts` (Pre-Build Validation)

**Command:** `npm run validate:pricing`
**Runs automatically:** Yes — via `prebuild` hook in package.json

Validates a subset of critical pricing values:
- Report Lite is FREE, has 1 AI seat
- Report Plus visuals = 50, AI seats = 3, radius = "1-2km adjustable"
- Module prices (Labor, Inventory, Purchasing)
- Watchtower bundle savings = 15%
- multi-site key exists (hyphenated)
- Enterprise threshold at 30

### 3. `scripts/qa-validate-pricing.ts` (Comprehensive QA)

**Command:** `npm run qa`

Validates **69 fields** across all pricing data:
- All Report tier fields (prices, AI credits, seats, visuals)
- All Core tier fields (prices, AI credits, seats, dashboards, predictive days)
- All Module prices (org license, per-location, included locations)
- All Watchtower prices (base, per-location)
- Bundle math (individual totals, savings)
- Client type discount tiers
- Early adopter terms (discount, price lock, trial, credits)
- Enterprise min locations
- Break-even points

### 4. `scripts/pricing_audit.ts` (Full Audit)

**Command:** `npm run pricing:audit`

Runs all of the above plus:
- Hard-coded price scanning across src/
- Bundle math verification
- Entitlements consistency (tier hierarchy, client type detection, enterprise alignment)
- Generates `PRICING_AUDIT_REPORT.md`

## Issues Found and Fixed

### Fixed: Test expecting wrong Report Plus visuals

**Before:** Test expected `reportTiers.plus.visuals = 120`
**Source of truth:** `pricing.ts` has `visuals: 50`
**Fix:** Updated test to expect `50`

### Fixed: QA script stale expectations

**Before:** QA expected outdated values for:
- Report Plus visuals: 120 (actual: 50)
- Report Plus benchmarkRadius: "1-2km" (actual: "1-2km adjustable")
- Core Lite aiSeats: 5 (actual: 10)
- Core Lite customDashboards: 3 (actual: 30)
- Core Pro aiSeats: 10 (actual: 20)
- Core Pro customDashboards: 15 (actual: 75)

**Fix:** Updated all 6 values to match the source of truth

### Fixed: Stale comments in usePriceCalculation.ts

**Before:** Comments referenced old watchtower prices ($199/$99/$149, bundle $349, savings $98)
**Actual:** Prices are $399/$199/$249, bundle $720, savings $127
**Fix:** Updated comments to match current values

## Test Coverage Gaps

### Covered
- All tier base prices and per-location prices
- Module org license and per-location pricing for all 9 modules
- Watchtower base + per-location for all modules + bundle
- Discount stacking (growth, multi-site, enterprise, early adopter)
- Enterprise volume and org license calculations
- Data structural integrity (keys, IDs, hierarchy)
- AI credits math
- Bundle discount correctness
- Client type detection boundaries
- Tier hierarchy invariants

### Not Covered (Out of Scope for This Repo)
- Entitlement enforcement (no backend in this repo)
- Billing integration (no checkout in this repo)
- Feature flag gating (no runtime gating in this repo)
- UI rendering tests (no component tests currently exist)
- PDF export accuracy (would require visual regression testing)
- Competitor pricing accuracy (external data, not Sundae's pricing)

### Recommended Future Additions
1. **Component snapshot tests** — verify tier cards render correct prices
2. **E2E tests** — simulate the full configurator flow
3. **Visual regression** — screenshot comparison of pricing page
4. **Cross-repo entitlement tests** — validate main app's gating matches pricing claims
