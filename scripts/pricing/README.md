# Pricing QA and verification

> **Last verified:** 2026-09-18

The local pricing-site model is the v1.8 candidate in `src/data/pricing.ts`. The published backend database catalogue remains the commercial runtime authority; local validation does not prove activation or Stripe parity.

## Gates

| Command | Purpose |
|---|---|
| `npm run qa` | Validate the v1.8 candidate matrix and structural rules |
| `npm test` | Run all Vitest suites |
| `npm run test:pricing` | Run the focused v1.7-invariant and live-overlay suites |
| `npm run qa:i18n` | Validate pricing locale quality |
| `npm run build` | Run translation QA, pricing validation, TypeScript and Vite build |
| `npm run test:e2e:pricing` | Exercise the simulator in Playwright |

## Main contracts

- `scripts/validate-pricing.ts`: candidate v1.8 numeric and policy assertions.
- `__tests__/pricing.v1_7.spec.ts`: retained v1.7 package/grant invariants.
- `__tests__/livePricing.test.ts`: published-catalogue normalization and environment policy.
- `__tests__/anchorRelief.spec.ts`: first-unit relief candidate.
- `__tests__/conceptBands.spec.ts` and Crew suites: band and bundle mechanics.

For a release, pair these gates with version-targeted backend catalogue checks, Stripe reconciliation and a live `/api/pricing/catalog/active` verification.
