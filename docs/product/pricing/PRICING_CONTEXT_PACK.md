# Pricing context pack

> **Last verified:** 2026-09-18
> **Repository:** `sundae-pricing`
> **Status:** v1.8 candidate UI; published backend catalogue remains the runtime commercial authority

## Read this first

This repository is a Vite 7, React 19 and TypeScript pricing website with an interactive quote simulator. It does not own subscriptions, invoices, Stripe state, entitlements or the active commercial catalogue.

The authority order is:

1. The published catalogue in `sundae-backend`, resolved through `PricingCatalogService`, is the runtime source for quotes and billing.
2. `sundae-backend/config/pricing_master.ts` is an explicitly enabled emergency/offline fallback, not proof of the live catalogue.
3. `src/data/pricing.ts` in this repository is the pricing-site model and current v1.8 candidate. It must not be described as the company-wide pricing authority.
4. `src/data/livePricing.ts` overlays a subset of numeric fields from `/api/pricing/catalog/active`. Hosted Sundae/Vercel environments fail closed when that catalogue cannot be loaded; local development may use the static candidate.

## Current release state

- v1.7 is the last documented published backend baseline.
- The pricing-site model contains the v1.8 extended Core/Crew band tails, payment-timing discounts and anchor-relief modelling.
- v1.8 must remain a candidate until an immutable backend catalogue is staged, Stripe parity is verified, and the renewal/grandfathering decision for existing 51–250-location customers is recorded.
- The site overlay currently patches Core packages, Foresight, concept SKUs and non-bundle Watchtower values. Crew pricing and discount policy are not supplied by that response shape. That gap must be closed before the candidate can be called runtime-aligned.
- A successful offline build proves internal v1.8 candidate consistency. It does not prove the live database catalogue or Stripe prices.

## Code map

| Area | File |
|---|---|
| Candidate catalogue and display metadata | `src/data/pricing.ts` |
| Published-catalogue overlay and fail-closed policy | `src/data/livePricing.ts` |
| Recurring price calculation | `src/lib/pricingEngine.ts` |
| Crew calculations and bundle replacement | `src/lib/crewPricing.ts` |
| Anchor-relief candidate | `src/lib/anchorRelief.ts` |
| Watchtower calculations | `src/lib/watchtowerEngine.ts` |
| Configurator state | `src/hooks/useConfiguration.ts` |
| Quote calculation orchestration | `src/hooks/usePriceCalculation.ts` |
| Pre-build contract | `scripts/validate-pricing.ts` |
| Backend cutover brief | `docs/pricing-v1.8-HANDOFF.md` |

## Product shape

- `/` renders the package overview.
- `/simulator` renders the guided configuration, quote, ROI and export flow.
- Core is sold as four packages: Foundation, Margin, Growth and Performance.
- The eleven Core domains are package components, not individually priced add-ons.
- Foresight & Action is a separate banded layer.
- Crew has six individual SKUs and three named-net bundles.
- Watchtower and concept extensions retain their own pricing models.
- Self-serve pricing ends at 250 units; 250+ is an Enterprise approval path.

## Required verification

```bash
npm run qa
npm test
npm run build
```

For release readiness, also verify the version-targeted backend catalogue, Stripe reconciliation and live endpoint response. Do not use the local build alone as activation evidence.
