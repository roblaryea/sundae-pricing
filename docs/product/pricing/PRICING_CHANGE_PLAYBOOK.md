# Pricing change playbook

> **Last verified:** 2026-09-18

## Authority rule

The published backend database catalogue is the commercial authority. `src/data/pricing.ts` is the pricing-site candidate model and local fallback; changing it alone must never be described as shipping a price change.

## Before changing a price

- Obtain product/finance approval and name the intended catalogue version.
- Identify existing subscriptions affected by the change.
- Decide grandfathering and renewal treatment.
- Review quote, Stripe, invoice, entitlement, marketing/MSOT, website and support impacts.
- Confirm whether the field is covered by the live overlay response. If not, add backend-to-site parity before activation.

## Implementation sequence

1. Update `src/data/pricing.ts` and the relevant engine only after approval.
2. Append a `pricingChangelog` entry; never rewrite older entries.
3. Update executable expectations in `scripts/validate-pricing.ts` and focused tests.
4. Run `npm run qa`, `npm test` and `npm run build`.
5. Create a new immutable backend catalogue version. Do not clear or rewrite the active version.
6. Validate the draft catalogue, sync immutable Stripe prices, and reconcile every product, currency, cadence and amount.
7. Verify version-targeted gross and net quotes, including discount exclusivity and Enterprise boundaries.
8. Update the marketing MSOT only after the approved runtime version is known. Static YAML is a marketing baseline, not proof of activation.
9. Activate the new backend version only after the commercial decision and rollback path are recorded.
10. Verify the active endpoint and hosted pricing UI, then update customer-facing effective-date/version copy.

## Required evidence

- approval and catalogue version;
- before/after quote matrix at band boundaries;
- existing-customer impact analysis;
- Stripe reconciliation result;
- live active-catalogue response/version;
- repository gates;
- MSOT and website synchronization;
- rollback/previous-version reference.

## Current v1.8 restriction

The site already contains v1.8 candidate bands and anchor relief, while the documented published backend baseline remains v1.7. Do not treat a green site build as permission to activate v1.8. Follow `docs/pricing-v1.8-HANDOFF.md` and close the full response-shape parity gap first.
