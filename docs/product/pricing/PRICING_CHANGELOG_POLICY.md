# Pricing changelog policy

> **Last verified:** 2026-09-18

The pricing-site changelog is the append-only `pricingChangelog` array in `src/data/pricing.ts`. It records candidate-model changes in this repository. It is not evidence that a database catalogue was published or activated.

Each entry must include:

- a stable ID and ISO date;
- the approved price-book/candidate version;
- every catalogue family or policy changed;
- the previous behavior and new behavior;
- commercial approval or decision reference;
- whether the backend catalogue and Stripe were changed, staged or left pending;
- existing-customer/grandfathering impact;
- validation evidence.

Do not edit or delete older entries to make the history look current. Append a correction if an older entry is wrong.

For an activated change, the release record must also name the immutable backend catalogue version, Stripe reconciliation result, activation timestamp and rollback version. Link the marketing/MSOT synchronization only after activation status is known.

Current caution: the v1.8 site candidate is ahead of the documented v1.7 published backend baseline. A changelog entry for v1.8 should describe it as a candidate until that runtime cutover is completed.
