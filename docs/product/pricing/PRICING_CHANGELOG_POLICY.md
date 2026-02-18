# Pricing Changelog Policy

> How to maintain a traceable history of all pricing changes.

## Location

The pricing changelog lives in `src/data/pricing.ts` as the exported `pricingChangelog` array.

## Schema

```typescript
interface PricingChange {
  id: string;          // Format: 'update-YYYY-MM-DD' (or 'update-YYYY-MM-DD-N' for multiple same-day)
  date: string;        // ISO date: 'YYYY-MM-DD'
  summary: string;     // One-line description of the change
  sectionsTouched: string[];  // Which pricing sections were modified
  notes: string;       // Detailed explanation including rationale
}
```

## Valid `sectionsTouched` Values

| Value | Covers |
|-------|--------|
| `'Report tiers'` | reportTiers (Lite/Plus/Pro) |
| `'Core tiers'` | coreTiers (Lite/Pro/Enterprise) |
| `'Modules'` | modules object (all 9 modules) |
| `'Watchtower'` | watchtower object (Competitive/Events/Trends/Bundle) |
| `'Client type rules'` | CLIENT_TYPE_RULES (discount tiers) |
| `'Early adopter'` | EARLY_ADOPTER_TERMS |
| `'Enterprise pricing'` | enterprisePricing (volume/org license) |
| `'Watchtower enterprise'` | watchtowerEnterprise |
| `'Features comparison'` | featureComparisons.ts tables |
| `'Add-ons'` | AI seats, credit top-ups, support add-ons |
| `'Footer/meta'` | pricingFooter (dates, currency, notes) |

## How to Append an Entry

1. Open `src/data/pricing.ts`
2. Find the `pricingChangelog` array
3. Add a new entry at the **end** of the array (append, don't prepend)
4. Fill in all fields

Example:

```typescript
export const pricingChangelog: PricingChange[] = [
  // ... existing entries ...
  {
    id: 'update-2026-02-15',
    date: '2026-02-15',
    summary: 'Reduced Core Lite additional location price from $54 to $49',
    sectionsTouched: ['Core tiers'],
    notes: 'Competitive adjustment to match market. Approved by product team. PR #142.'
  }
];
```

## Rules

1. **Every pricing change gets a changelog entry** — no exceptions
2. **Entries are append-only** — never modify or delete historical entries
3. **Include PR links in notes** — e.g., `'PR #142'` or full URL
4. **Be specific in summary** — say exactly what changed, not "updated pricing"
5. **List all sections touched** — if a watchtower change also required bundle math update, list both `'Watchtower'` and `'Modules'` (if applicable)
6. **Date is the effective date** — when the change goes live, not when the PR was opened

## Querying the Changelog

The changelog is a TypeScript array, so it can be programmatically queried:

```typescript
import { pricingChangelog } from './data/pricing';

// Get changes in date range
const recent = pricingChangelog.filter(c => c.date >= '2026-01-01');

// Get changes that touched modules
const moduleChanges = pricingChangelog.filter(c =>
  c.sectionsTouched.includes('Modules')
);
```

## Integration with Release Notes

The `scripts/release_notes.ts` script can optionally pull from `pricingChangelog` to include pricing changes in release notes. Pricing changes should be categorized as "Breaking changes" if they involve price increases or tier restructuring.
