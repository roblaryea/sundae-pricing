# Pricing Audit Report

> Generated: 2026-02-17

## Overall Status: PASS

| Metric | Count |
|--------|-------|
| Passed | 17 |
| Failed | 0 |
| Warnings | 3 |
| Total Checks | 20 |

## Warnings

- **[Hard-coded Prices]** src/components/ConfigBuilder/LayerStack.tsx contains hard-coded prices
  - Verify these match src/data/pricing.ts
- **[Hard-coded Prices]** src/data/featureComparisons.ts contains hard-coded prices
  - Verify these match src/data/pricing.ts
- **[Hard-coded Prices]** src/components/Summary/PricingFAQ.tsx contains hard-coded prices
  - Verify these match src/data/pricing.ts

## All Checks

| Status | Category | Check |
|--------|----------|-------|
| PASS | Tests | Pricing test suite passes |
| PASS | Validation | Pre-build validation (validate-pricing.ts) passes |
| PASS | Validation | QA validation (qa-validate-pricing.ts) passes |
| PASS | Bundle Math | individualBaseTotal matches sum of individual base prices |
| PASS | Bundle Math | baseSavings = individualTotal - bundlePrice |
| PASS | Bundle Math | individualPerLocTotal matches sum |
| PASS | Bundle Math | perLocSavings = individualPerLocTotal - bundlePerLoc |
| PASS | Bundle Math | Savings percent is 15% |
| PASS | Hard-coded Prices | No unexpected hard-coded dollar amounts in UI |
| WARN | Hard-coded Prices | src/components/ConfigBuilder/LayerStack.tsx contains hard-coded prices |
| WARN | Hard-coded Prices | src/data/featureComparisons.ts contains hard-coded prices |
| WARN | Hard-coded Prices | src/components/Summary/PricingFAQ.tsx contains hard-coded prices |
| PASS | Entitlements | Report tier prices increase Lite < Plus < Pro |
| PASS | Entitlements | Core Lite < Core Pro base price |
| PASS | Entitlements | Report AI credits increase with tier |
| PASS | Entitlements | Report AI seats increase with tier |
| PASS | Entitlements | Client type detection boundaries correct |
| PASS | Entitlements | Enterprise min locations aligned across data sources |
| PASS | Entitlements | All 9 modules present |
| PASS | Entitlements | All modules include 5 locations |

## How to Run

```bash
# Standard audit
npm run pricing:audit

# Full audit with release notes
npm run pricing:audit:full
```
