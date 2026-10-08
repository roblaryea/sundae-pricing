# Sundae pricing-site runtime flow

> **Last verified:** local pricing checks and hosted pricing preview, 2026-10-08
> **Scope:** the `sundae-pricing` SPA and its published-catalogue dependency

## Boundary

`sundae-pricing` is a client application. It calculates and presents a quote, ROI context and a PDF summary. It does not create subscriptions, bill customers, write Stripe state or grant entitlements.

The published database catalogue in `sundae-backend` remains the runtime commercial authority. The public active response retrieved for this work is v1.8.2. Local fallback objects do not prove future catalogue alignment or final billing parity.

## Review deployment

The latest enhanced pricing preview is built from `1c13440` on `codex/pricing-buyer-review-20261008` at `https://sundae-pricing-k6zqhll1y-sundaes-projects-afd45f7e.vercel.app` (Vercel Ready / preview). It supersedes the earlier `9a49b90` preview. Use the owner-provided share link to establish preview access; configuration/PDF links need that access cookie. The URL-scoped share token is not stored in Git. The preview loads the published catalogue through its same-origin Vercel proxy. Companion backend/app/website changes are pushed draft PRs, not released receivers. Production and billing are unchanged. See the superseding review deployment record in `PRICING_AUDIT_REPORT.md`.

## Runtime sequence

1. `src/main.tsx` mounts the locale and application providers.
2. `src/App.tsx` routes `/` to `PricingOverview` and `/simulator` to `Simulator`.
3. Both pages call `useLivePricingCatalog()`.
4. `src/data/livePricing.ts` resolves the catalogue endpoint:
   - `VITE_PRICING_CATALOG_URL`, then `VITE_APP_URL`, when configured;
   - otherwise same-origin `/api/pricing/catalog/active` on `sundae.io`, subdomains and Vercel hosts;
   - no endpoint for local development unless explicitly configured.
5. Hosted environments require the published catalogue. `LivePricingGate` blocks the pricing UI if it is loading or unavailable.
6. The adapter normalizes actual `tiers/modules/bundles/watchtower/discounts`, validates supported curves/grants/caps/terms before mutation, and hydrates Core, Foresight, concepts, Crew SKUs/bundles, individual Watchtower prices and commitment percentages. Version/effective date are retained.
7. `useBuyerQuote` builds a v2 intent and calls `calculateBasketQuote`. Core/concepts and Crew use their appropriate engines; one eligible discount applies to the combined recurring subtotal. Unique Crew employees share a group pool; employee expansion is charged once at the highest selected rate, outside the discount.
8. Overview shows location count, Core/Crew/Both and whole-dollar base plan cards with applied discount context. Multi-location cards emphasize the average per location/month and retain the smaller total monthly investment directly underneath. Combined buyers edit one card set while the other selection stays in a summary. Mobile shows one complete selected card and native selector; a collapsed comparison becomes a per-plan list without horizontal scrolling. Inherited features are explicit. Unavailable Starter has no numerical price. A visible setup guide provides approved reference fees without inferring unresolved package setup assignments. Simulator has choose/refine/review screens. Operating-model selection recommends paid extensions without silently selecting them. Scope/term/headcount edits produce one consistent basket; Crew cards include entered employees. Unknown headcount prompts buyers beside the decision total. Saved state is disclosed and Start over resets configuration while retaining locale/theme. The header opens current review rather than restarting the simulator. Localized package purposes explain the buying decision without relying on technical module descriptions.
   Feature help beside Core/Crew features, comparisons and extensions uses plain buyer benefits. Hover/focus opens it, click/tap pins it, and Escape/outside interaction dismisses it. It is independently operable from native card selection buttons and checkboxes. Fixed-position espresso panels avoid scroll clipping and remain viewport bounded. Business-model cards use the matching onboarding icons and preserve multi-selection without adding charges.
9. The overview monthly-investment bar and quote review display the exact recurring cost. Review adds subscription payment timing, scoped setup, exclusions and effective date. The emphasized average on overview/refinement/review/PDF divides the monthly basket by locations, including discounts and entered employee expansion; it is omitted for one location, incomplete Crew and Enterprise. The full monthly investment remains smaller and visible directly beneath the average on screen; the PDF places it alongside the larger average and shows the subscription payment estimate below. Extension controls use the same applied discount basis. Internal revisions/IDs are absent from buyer-facing screens. At 250+ locations the headline and CTA use an Enterprise proposal; optional services and terms require proposal confirmation, and price details/ROI are omitted. ROI is a separate optional Core planning model after review; valid edited assumptions survive reloads.
10. Branded vector PDF consumes the same basket without recalculation, embedding licensed Fraunces and Hanken fonts and the existing Sundae mark. Individual Watchtower lines retain the selected service names. Share/demo/account links use validated `pricingIntent` v2; internal catalogue metadata and unknown properties are stripped. Complete individual Watchtower selections normalize to one bundle. Website and app copies plus localized receiver labels are synchronized by `scripts/sync-pricing-handoff.ts`. App authentication stores the intent for onboarding; receivers display it without entitlement or purchase mutations.
11. Consent-aware semantic funnel events describe selection and step/action changes. Late consent retries the visible view once; configuration changes on both pages and share/export outcomes are covered. Contact data and full configuration queries are excluded. Build-time prerendering places catalogue-backed price facts in initial HTML without internal revisions/IDs for JavaScript-free rendering.

## Known parity boundary

The public active response does not carry every field needed for a final invoice. Watchtower bundle mechanics, Cross-Intelligence, volume/cap policy and implementation classification still include approved local metadata. Therefore:

- `status: ready` proves that required supported families/fields validated and hydrated;
- it does not prove full pricing-site/backend parity;
- activation requires server-side eligibility and final quote checks, not only a 200 catalogue response.

This is an explicit release gate, not a documentation ambiguity.

Public stateless quote checks on 2026-10-08 matched 31/32 recurring totals after normalizing contract-period totals to monthly. The remaining deployed case charges a second Watchtower bundle discount against an already-net price. `sundae-backend/app/services/quote_engine.ts` has a local correction plus 37 execution tests (32 captured estimate cases and five fixed-bundle cases). The deterministic inputs include published Core curves and fixed Crew bundles; this does not execute the database or billing. All 32 local estimate cases match. Deployment and renewed production parity checks remain required. The isolated backend review branch passed its full TypeScript pre-push gate; earlier nullable-value errors were in concurrent original-worktree Foresight edits. The correction remains undeployed. See `PRICING_AUDIT_REPORT.md` and `public-quote-check.json`.

For genuine local catalogue QA, opt into Vite's same-origin development proxy (the remote endpoint does not allow direct localhost CORS):

```bash
SUNDAE_DEV_CATALOG_PROXY=true VITE_PRICING_CATALOG_URL=http://127.0.0.1:5183 VITE_REQUIRE_LIVE_PRICING=true npm run dev -- --port 5183 --host 127.0.0.1
```

The proxy targets only the official pricing host and changes no production CORS policy.

## Main state and calculation path

```text
published backend catalogue
        |
        v
src/data/livePricing.ts -----> validated in-memory catalogue hydration
        |                              |
        |                              v
        +-------------------- src/data/pricing.ts (local metadata/fallbacks)
                                       |
                                       v
                  pricingEngine / crewPricing
                                       |
                                       v
                   useConfiguration + useBuyerQuote
                                       |
                                       v
                             basketQuote
                                       |
                                       v
                 PricingOverview / Simulator / basketPdf
                                       |
                                       v
                    pricingIntent -> demo / onboarding
```

## Safe change sequence

1. Record the approved commercial change and affected catalogue version.
2. Change the candidate model and its tests.
3. Stage a new immutable backend catalogue; never mutate an active version in place.
4. Reconcile Stripe products/prices and versioned backend responses.
5. Verify gross and net quotes for monthly, annual-quarterly, annual-upfront and two-year-upfront terms.
6. Decide renewal/grandfathering treatment before activation.
7. Activate the backend version, then verify the normal active-catalogue endpoint and hosted pricing UI.

## Local gates

```bash
npm run qa
npm test
npm run lint
npm run build
npm run test:e2e:pricing
env -u NO_COLOR npx playwright test e2e/pricing-simulator.spec.ts e2e/pricing-review-enhancements.spec.ts
npm run qa:intent
```

These gates validate the repository. They do not replace live catalogue and Stripe verification.

The buyer follow-up verification passed 1,345 unit tests and 42 targeted Chromium scenarios. The new suite includes 22 locales, discount/average consistency, combined selection, Starter availability, reset/current-review behavior and desktop/mobile axe on choose/refine. Native accessibility names and keyboard focus were inspected; a real screen-reader session and production funnel measurement remain pending.
