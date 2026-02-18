# Pricing Change Playbook

> Safe, repeatable process for making any pricing change in the Sundae pricing site.

## Pre-Change Checklist

Before modifying any pricing value:

- [ ] Confirm the change is approved (product/business sign-off)
- [ ] Identify the scope: which pricing fields are changing?
- [ ] Check the [PRICING_IMPACT_MATRIX.md](./PRICING_IMPACT_MATRIX.md) for all affected locations
- [ ] Create a feature branch from `develop`

## Step-by-Step Process

### 1. Edit the Source of Truth

**File:** `src/data/pricing.ts`

This is the **only** file where pricing values should be defined. All other files import from here.

```
Edit the relevant export:
- reportTiers (Report Lite/Plus/Pro)
- coreTiers (Core Lite/Pro/Enterprise)
- modules (Labor, Inventory, Purchasing, Marketing, Reservations, Profit, Revenue, Delivery, Guest)
- watchtower (Competitive, Events, Trends, Bundle)
- CLIENT_TYPE_RULES (discount tiers)
- EARLY_ADOPTER_TERMS (founding member program)
- enterprisePricing (volume/org license)
- watchtowerEnterprise (enterprise watchtower tiers)
- pricingFooter (effective date, currency, notes)
```

### 2. Update Bundle Math (if Watchtower changed)

If you changed any watchtower individual module price, recalculate:
```
bundle.basePrice = round(sum(individual basePrices) * 0.85)
bundle.perLocationPrice = round(sum(individual perLocationPrices) * 0.85)
bundle.individualBaseTotal = sum(individual basePrices)
bundle.individualPerLocTotal = sum(individual perLocationPrices)
bundle.baseSavings = individualBaseTotal - bundle.basePrice
bundle.perLocSavings = individualPerLocTotal - bundle.perLocationPrice
bundle.savingsPercent = 15
```

### 3. Update Hard-Coded UI Values

These files contain hard-coded pricing strings that must be manually updated:

| File | Hard-coded Value | When to Update |
|------|-----------------|----------------|
| `src/components/ConfigBuilder/LayerStack.tsx:28` | `"Starting at $0/month"` | If Report Lite basePrice changes |
| `src/components/ConfigBuilder/LayerStack.tsx:42` | `"Starting at $169/month"` | If Core Lite basePrice changes |
| `src/components/ConfigBuilder/LayerStack.tsx:59` | `"Add-on: From $199/mo"` | If cheapest Watchtower module changes |
| `src/data/featureComparisons.ts` | AI seat costs, credit top-ups, support add-ons, retention upgrades | If any add-on pricing changes |

### 4. Update Tests

**File:** `__tests__/pricing.test.ts`

Update expected values for any changed pricing field. Tests cover:
- Report tier price calculations
- Core tier price calculations
- Module pricing (org license + per-location)
- Watchtower pricing (base + per-location)
- Bundle savings math
- Discount stacking
- Enterprise pricing

### 5. Update Validation Scripts

**Files:**
- `scripts/validate-pricing.ts` — pre-build validation (runs automatically on `npm run build`)
- `scripts/qa-validate-pricing.ts` — comprehensive QA validation (`npm run qa`)

Update expected values in both scripts.

### 6. Append to Pricing Changelog

In `src/data/pricing.ts`, append to the `pricingChangelog` array:

```typescript
{
  id: 'update-YYYY-MM-DD',
  date: 'YYYY-MM-DD',
  summary: 'Brief description of what changed',
  sectionsTouched: ['Report tiers', 'Core tiers', 'Modules', 'Watchtower', ...],
  notes: 'Detailed notes about the change and reason'
}
```

### 7. Run Verification

```bash
# Run all checks
npm run validate:pricing   # Pre-build validation
npm run qa                  # Comprehensive QA
npm test                    # Full test suite
npm run build               # Verify build succeeds (includes validate:pricing)
```

### 8. Open PR

Use this PR description template:

```markdown
## Pricing Change: [Brief Title]

### What changed
- [List each pricing field that changed]
- [Old value] -> [New value]

### Why
- [Business reason for the change]

### Impact
- [List affected UI components]
- [List affected calculations]

### Verification
- [ ] `npm run validate:pricing` passes
- [ ] `npm run qa` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] Visually verified pricing page renders correctly
- [ ] Visually verified simulator calculates correctly
- [ ] pricingChangelog updated

### Changelog entry
```
id: update-YYYY-MM-DD
summary: ...
```
```

## Must-Update Artifacts Checklist

For **any** pricing change:
- [ ] `src/data/pricing.ts` (source of truth)
- [ ] `__tests__/pricing.test.ts` (test expectations)
- [ ] `scripts/validate-pricing.ts` (pre-build validation)
- [ ] `scripts/qa-validate-pricing.ts` (QA validation)
- [ ] `pricingChangelog` entry in `src/data/pricing.ts`

For **tier base price** changes:
- [ ] All of the above, plus:
- [ ] `src/components/ConfigBuilder/LayerStack.tsx` (hard-coded starting prices)

For **watchtower** changes:
- [ ] All of the above, plus:
- [ ] Bundle math recalculation
- [ ] `src/components/ConfigBuilder/LayerStack.tsx` (if cheapest module changed)

For **feature/entitlement** changes:
- [ ] All of the above, plus:
- [ ] `src/data/featureComparisons.ts` (feature comparison tables)
- [ ] `src/data/pricing.ts` features[] and limitations[] arrays

For **add-on pricing** changes (AI seats, credits, support, retention):
- [ ] `src/data/featureComparisons.ts` (hard-coded price strings)

## Breaking Change Rubric

| Change Type | Breaking? | Requires |
|-------------|-----------|----------|
| Price increase | Yes | 30-day notice per pricingFooter.changeNotice |
| Price decrease | No | Changelog entry |
| New tier added | No | UI component update + tests |
| Tier removed | Yes | Migration plan + customer comms |
| Feature moved between tiers | Yes | Customer comms if downgrade |
| New module added | No | UI update + pricing engine update |
| Module removed | Yes | Migration + entitlement cleanup |
| Discount change | Depends | If discount decreases, notify affected clients |
| Enterprise threshold change | Yes | Notify enterprise prospects |

## Common Pitfalls

1. **Forgetting to update the test** — The build will pass (validate-pricing only checks a subset), but CI tests will fail
2. **Not recalculating bundle math** — Bundle savings must match `15% * sum(individual prices)`
3. **Stale comments in usePriceCalculation.ts** — Comments reference old watchtower prices; update or remove
4. **Feature comparison table drift** — featureComparisons.ts has its own price strings that can drift from pricing.ts
5. **LayerStack hard-codes** — Easy to miss the 3 hard-coded price strings in this component
