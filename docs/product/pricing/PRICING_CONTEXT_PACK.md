# Pricing Context Pack

> Read this first to understand Sundae pricing, its dependencies, and how to safely make changes.

## Architecture Overview

**What this repo is:** A standalone Vite + React + TypeScript SPA that serves as the Sundae pricing website and interactive quote configurator.

**What this repo is NOT:** A billing system, checkout flow, or entitlement enforcement layer. There is no backend. All pricing is computed client-side.

**Tech stack:** Vite 7, React 19, TypeScript 5.9, Tailwind CSS 4, Zustand 5, Framer Motion, recharts, jspdf, react-router-dom 7, vitest 4.

**Routes:**
- `/` — PricingOverview (static pricing page with tier cards and feature tables)
- `/simulator` — Simulator (8-step interactive configurator with quote builder)

## Source of Truth

**File:** `src/data/pricing.ts`

This is the **only** file where pricing values should be defined. It exports:

| Export | Contents |
|--------|----------|
| `reportTiers` | Report Lite ($0), Plus ($49), Pro ($99) — base + per-location pricing |
| `coreTiers` | Core Lite ($169), Pro ($319), Enterprise (custom) |
| `modules` | 9 add-on modules (Labor, Inventory, Purchasing, Marketing, Reservations, Profit, Revenue, Delivery, Guest) |
| `watchtower` | 3 individual modules (Competitive $399, Events $199, Trends $249) + Bundle ($720, 15% savings) |
| `CLIENT_TYPE_RULES` | Discount tiers: Independent 0%, Growth 10%, Multi-site 15%, Enterprise custom |
| `EARLY_ADOPTER_TERMS` | 20% discount, 24-month lock, 30-day trial, 500 bonus credits |
| `enterprisePricing` | Volume tiers (30-200+ locations) and Org License model |
| `pricingChangelog` | Append-only history of all pricing changes |
| `pricingFooter` | Effective date, currency, notices |

## Pricing Model Quick Reference

### Tiers
- **Report Lite:** FREE forever, 40 AI credits, 1 seat, basic benchmarking
- **Report Plus:** $49 + $29/extra loc, 150 credits, 3 seats, AI-parsed uploads
- **Report Pro:** $99 + $49/extra loc, 400 credits, 5 seats, API integration
- **Core Lite:** $169 + $54/extra loc, 800 credits, 10 seats, real-time POS, 4hr refresh
- **Core Pro:** $319 + $49/extra loc, 1400 credits, 20 seats, multi-POS, 2hr refresh
- **Enterprise:** Custom pricing, unlimited, dedicated CSM

### Modules (Core only, $org + $/extra location after 5 included)
Labor $139+$19, Inventory $139+$19, Purchasing $119+$15, Marketing $169+$25, Reservations $119+$15, Profit $199+$29, Revenue $99+$12, Delivery $129+$17, Guest $89+$10

### Watchtower (Core only, base + per-location)
Competitive $399+$49/loc, Events $199+$29/loc, Trends $249+$19/loc, Bundle $720+$82/loc (15% off)

### Discounts
Growth (3-24 locs): 10%, Multi-site (25-29): 15%, Enterprise (30+): custom. Early adopter: 20% (stacks).

## Major Flows

### Flow 1: Pricing Page (`/`)
`PricingOverview.tsx` → imports `reportTiers`, `coreTiers`, `modules`, `watchtower` from `pricing.ts` → renders tier cards → `FeatureComparisonTable` → `PricingFAQ`

### Flow 2: Quote Configurator (`/simulator`)
8 steps: PathwaySelector → LayerStack → TierSelector → LocationSlider → ModulePicker → WatchtowerToggle → ROISimulator → ConfigSummary

State: Zustand store (`useConfiguration.ts`) persisted to localStorage.

Price engine: `usePriceCalculation` hook → `pricingEngine.calculateFullPrice()` → returns total, breakdown, AI credits, discounts.

### Flow 3: PDF Export
`ConfigSummary` → `pdfGenerator.ts` (jspdf) → generates quote PDF with 30-day validity.

## Impact Matrix

See [PRICING_IMPACT_MATRIX.md](./PRICING_IMPACT_MATRIX.md) for the complete mapping of which files are affected when any pricing field changes.

**Key insight:** Changing a value in `pricing.ts` automatically propagates to most UI through imports. But these files have **hard-coded copies** that must be updated manually:
1. `src/components/ConfigBuilder/LayerStack.tsx` — "$0/month", "$169/month", "$199/mo"
2. `src/data/featureComparisons.ts` — add-on prices (AI seats, credit top-ups, support)
3. `__tests__/pricing.test.ts` — expected values
4. `scripts/validate-pricing.ts` — validation expected values
5. `scripts/qa-validate-pricing.ts` — QA expected values

## Update Playbook (Summary)

1. Edit `src/data/pricing.ts`
2. If watchtower changed → recalculate bundle math
3. Update hard-coded values in LayerStack/featureComparisons if affected
4. Update tests and validation scripts
5. Append to `pricingChangelog`
6. Run: `npm run validate:pricing && npm run qa && npm test && npm run build`
7. Open PR with the pricing change template

Full details: [PRICING_CHANGE_PLAYBOOK.md](./PRICING_CHANGE_PLAYBOOK.md)

## Common Pitfalls

1. **Forgetting to update tests** — build passes (validate-pricing is a subset), but test suite fails
2. **Not recalculating watchtower bundle** — bundle savings must equal 15% of individual sum
3. **Stale feature comparison prices** — `featureComparisons.ts` has its own price strings
4. **Stale comments** — code comments reference old prices; misleading for future developers
5. **QA script drift** — `qa-validate-pricing.ts` can fall behind when pricing.ts is updated
6. **Enterprise threshold change** — must update `enterprisePricing.minLocations` AND `CLIENT_TYPE_RULES.enterprise.locationRange[0]` together

## Commands to Run

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build (auto-runs validate:pricing)

# Testing
npm test                       # Run all tests
npm run test:pricing           # Run pricing tests only
npm run validate:pricing       # Pre-build validation
npm run qa                     # Comprehensive QA (69 checks)
npm run pricing:audit          # Full audit (17 checks + report)
npm run pricing:audit:full     # Full audit + release notes

# Release
npm run release:notes          # Generate release notes from GitHub PRs
```

## Related Documentation

| Document | Purpose |
|----------|---------|
| [PRICING_MODEL_MAP.md](./PRICING_MODEL_MAP.md) | Complete pricing schema with all fields |
| [PRICING_IMPACT_MATRIX.md](./PRICING_IMPACT_MATRIX.md) | Where every field appears |
| [PRICING_CHANGE_PLAYBOOK.md](./PRICING_CHANGE_PLAYBOOK.md) | Step-by-step update process |
| [PRICING_CHANGELOG_POLICY.md](./PRICING_CHANGELOG_POLICY.md) | How to maintain changelog |
| [PRICING_RUNTIME_FLOW.md](./PRICING_RUNTIME_FLOW.md) | Data flow diagrams |
| [PRICING_TESTS_AUDIT.md](./PRICING_TESTS_AUDIT.md) | Test coverage catalog |
| [DUPLICATE_SOURCES_AUDIT.md](./DUPLICATE_SOURCES_AUDIT.md) | Hard-coded value inventory |
| [ENTITLEMENTS_ALIGNMENT_AUDIT.md](./ENTITLEMENTS_ALIGNMENT_AUDIT.md) | Consistency verification |
| [RELEASE_NOTES_PIPELINE.md](./RELEASE_NOTES_PIPELINE.md) | Release notes automation |
| [PRICING_AUDIT_REPORT.md](./PRICING_AUDIT_REPORT.md) | Latest audit results |
