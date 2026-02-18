# Pricing QA & Verification

All pricing logic flows from a single source of truth:

```
src/data/pricing.ts          → canonical pricing constants (v4.3)
src/lib/pricingEngine.ts     → all calculation functions
src/lib/watchtowerEngine.ts  → watchtower-specific calculations
generated/pricingSpec.v4_3.json → machine-readable spec with expected totals
```

## CI Commands

| Command | What it runs | Tests |
|---------|-------------|-------|
| `npm run test:pricing` | Vitest unit + scenario suite | 244 tests (62 + 182) |
| `npm run test:e2e:pricing` | Playwright simulator verification | 12 E2E scenarios |
| `npm run qa` | QA validation script | 78 field-level checks |
| `npm run validate:pricing` | Pre-build validation | Structural checks |
| `npm run pricing:audit` | Full audit (tests + scans + math) | Composite report |

### Quick validation

```bash
# Unit + scenario tests (fast, <1s)
npm run test:pricing

# E2E simulator tests (requires dev server, ~4s)
npm run test:e2e:pricing

# Full audit
npm run pricing:audit
```

## Test Suite Overview

### `__tests__/pricing.v4_3.spec.ts` (182 tests)

Scenario-driven tests organized in 8 categories:

| Section | Description | Count |
|---------|-------------|-------|
| A | Tier pricing (Report Lite/Plus/Pro, Core Lite/Pro at 1-50 locs) | 35+ |
| B | Module pricing (all 10 modules at various locations + setup fees) | 40+ |
| C | Watchtower pricing (competitive, events, trends, bundle) | 20+ |
| D | Bundle pricing (6 bundles at various locations) | 24+ |
| E | Pulse on Report Pro (unlock fees, module fees, scenario total) | 5+ |
| F | Discount stacking rules (volume vs billing, max 15%) | 5 |
| G | Setup fee discounts (3+ modules, complete intel, annual, enterprise) | 5 |
| H | Integration overlap credits (Pulse + Labor/Inventory) | 4 |

Plus: 5 complete pricing examples from spec, AI credits validation, prerequisite enforcement.

### `__tests__/pricing.test.ts` (62 tests)

Core pricing engine unit tests covering report tiers, core tiers, module pricing, watchtower bundle math, discount application, client type detection, and enterprise calculations.

### `e2e/pricing-simulator.spec.ts` (12 tests)

Playwright E2E tests that verify the simulator UI displays correct prices by:
1. Setting Zustand store state via the dev-mode `__SUNDAE_STORE__` hook
2. Navigating to the summary step
3. Asserting the rendered monthly total matches the pricing engine

Covers: Report Lite/Plus/Pro, Core Lite/Pro, modules, watchtower individual + bundle.

## Key Pricing Rules (v4.3)

- **Discounts**: Volume OR billing — whichever is larger, max 15%. Never stacked.
- **Modules**: Base includes 5 locations. Per-extra-location starts at location 6.
- **Setup fees**: One-time, NOT multiplied by location count.
- **Pulse unlock**: $99/mo on Report Pro (separate from $199/mo module fee).
- **Integration credits**: Pulse setup reduced when same systems used for Labor ($299) or Inventory ($499), capped at $399.
- **Watchtower**: Base + per-location model. ~18% bundle discount ($699 vs $847).
- **Enterprise**: Eligible at 201+ locations. Watchtower enterprise pricing is opt-in, not auto-applied.

## Changing Prices

1. Update `src/data/pricing.ts` (single source of truth)
2. Update `generated/pricingSpec.v4_3.json` expected totals
3. Run `npm run test:pricing` — fix any failures
4. Run `npm run pricing:audit` — verify full integrity
5. Run `npm run test:e2e:pricing` — verify UI renders correctly
