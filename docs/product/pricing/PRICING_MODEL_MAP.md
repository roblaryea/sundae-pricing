# Sundae pricing model map

> **Last verified:** 2026-09-18
> **Candidate model:** `src/data/pricing.ts`
> **Runtime commercial authority:** published backend database catalogue

This map describes the v1.8 candidate implemented in the pricing site. It does not assert that v1.8 is active in production.

## Core packages

Core uses a first-unit anchor plus marginal location bands. Reaching a lower band never reprices earlier units.

| Package | First unit | Marginal rates for units 2–10 / 11–25 / 26–50 / 51–100 / 101–150 / 151–250 / 251+ |
|---|---:|---|
| Foundation | $1,195 | $175 / $150 / $125 / $115 / $110 / $105 / $100 |
| Margin | $1,650 | $245 / $210 / $175 / $165 / $155 / $145 / $140 |
| Growth | $1,925 | $260 / $225 / $190 / $180 / $170 / $160 / $150 |
| Performance | $2,980 | $409 / $348 / $290 / $275 / $255 / $245 / $230 |

The packages grant different domain sets. Margin and Growth are a cost-side/demand-side fork, not a simple upgrade ladder. The package-grant tests are the executable contract.

## Other catalogue families

- Foresight & Action: $495 first unit with $65 / $55 / $45 / $35 marginal bands.
- Concept extensions: franchise, hotel F&B, cloud kitchen, catering, production and rental commissary. They are banded; the retained `monthlyPrice` field is only a first-unit compatibility alias.
- Crew individual SKUs: Starter, Schedule, Manage, Time, Pay and People.
- Crew named-net bundles: Schedule & Time, Crew Operating and Crew Complete. Bundle prices are inputs, not a percentage derived from components.
- Watchtower: Competitive Intelligence, Event & Calendar Signals, Market Trends and a bundle.
- Implementation: charged once at the highest applicable class. Unknown per-SKU assignments remain contract-scoped rather than invented.

## Discounts and sales boundary

| Rule | Candidate value |
|---|---|
| Volume, 1–49 | 0% |
| Volume, 50–99 | 2.5% |
| Volume, 100–199 | 5% |
| Volume, 200–249 | 7% |
| 250+ | Enterprise approval; no self-serve quote |
| Monthly | 0% |
| Annual, paid quarterly | 5% |
| Annual, paid upfront | 12% |
| Two years, paid upfront | 20% plus 24-month price lock |

The larger of the volume or cadence discount applies; they do not stack. Early-adopter concessions share the 20% calculated-discount ceiling.

## v1.8-only candidate behavior

- Core and full Crew offers have extended marginal tails beyond 50 locations.
- Anchor relief is a per-customer, first-unit-only schedule; it is not a global list-price reduction.
- Existing 51–250-location customer treatment is unresolved. Do not call v1.8 active until the backend catalogue, Stripe mapping and renewal policy are approved.

## Verification sources

- `scripts/validate-pricing.ts` pins the candidate price matrix.
- `__tests__/pricing.v1_7.spec.ts` retains v1.7 structural/grant invariants that v1.8 did not change.
- `__tests__/anchorRelief.spec.ts`, `__tests__/conceptBands.spec.ts` and the Crew suites cover the new candidate mechanics.
- `src/data/livePricing.ts` defines the current published-catalogue overlay boundary.
