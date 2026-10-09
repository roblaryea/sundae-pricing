# Sundae pricing-site runtime flow

> **Last verified:** local pricing checks, 2026-10-09; earlier hosted preview, 2026-10-08
> **Scope:** the `sundae-pricing` SPA and its published-catalogue dependency

## Boundary

`sundae-pricing` is a client application. It calculates and presents a quote, ROI context and a PDF summary. It does not create subscriptions, bill customers, write Stripe state or grant entitlements.

The published database catalogue in `sundae-backend` remains the runtime commercial authority. The public active response retrieved for this work is v1.8.2. Local fallback objects do not prove future catalogue alignment or final billing parity.

## Review deployment

The latest 2026-10-09 refinements are in the Ready test preview **https://sundae-pricing-9l4j1ysn3-sundaes-projects-afd45f7e.vercel.app** (commit `99fef5c`). Earlier protected previews are historical. The preview loads the published catalogue through its same-origin Vercel proxy. Companion backend/app/website changes remain review work, not released receivers. Production and billing are unchanged. Preview access tokens are kept outside Git and PRs.

## Runtime sequence

1. `src/main.tsx` mounts the locale and application providers.
2. `src/App.tsx` routes `/` to `PricingOverview` and `/simulator` to `Simulator`.
3. Both pages call `useLivePricingCatalog()`.
4. `src/data/livePricing.ts` resolves the catalogue endpoint:
   - `VITE_PRICING_CATALOG_URL`, then `VITE_APP_URL`, when configured;
   - otherwise same-origin `/api/pricing/catalog/active` on `sundae.io`, subdomains and Vercel hosts;
   - no endpoint for local development unless explicitly configured.
5. Hosted environments require the published catalogue. `LivePricingGate` blocks the pricing UI if it is loading or unavailable.
6. The adapter normalizes actual `tiers/modules/bundles/watchtower/addons/discounts`, validates supported curves/grants/caps/terms before mutation, and hydrates Core, Foresight, concepts, Crew SKUs/bundles, individual Watchtower prices/allowances, package-specific Cross-Intelligence and commitment percentages. Optional published volume/cap/setup/bundle policies hydrate when present; `policyCoverage` records the boundary. Future-effective catalogues are rejected. Visible pages refresh every 60 seconds and on focus/visibility return; concurrent hydration is deduplicated. Version/effective date are retained internally.
7. `useBuyerQuote` builds a v2 intent and calls `calculateBasketQuote`. Core/concepts and Crew use their appropriate engines; one eligible discount applies to the combined recurring subtotal. Unique Crew employees share a group pool; employee expansion is charged once at the highest selected rate, outside the discount.
8. Overview shows location count, Core/Crew/Both and whole-dollar base plan cards with applied discount context. Multi-location cards emphasize the average per location/month and retain the smaller total monthly investment directly underneath. Combined buyers edit one card set while the other selection stays in a summary. Mobile shows one complete selected card and native selector; a collapsed comparison becomes a per-plan list without horizontal scrolling. Inherited features are explicit. Unavailable Starter has no numerical price. Setup guidance follows the selected plan and hides unpublished setup fees rather than implying self-service is free. Simulator has choose/refine/review screens. Specialist business choices automatically select their paid extensions, show the price and require removal of the business choice to remove the extension. Optional upgrades remain collapsed. Single brand/diversified group are exclusive; specialist activities can combine. Crew-only hides the Core business-model panel. Scope/term/headcount edits produce one consistent basket; Crew cards include published pooled employee allowances and entered workforce charges. Unknown headcount prompts buyers beside the decision total. Saved state is disclosed and Start over resets configuration while retaining locale/theme. The header opens current review. Location/model copy covers all 25 locales.
   Feature help beside Core/Crew features, comparisons, extensions and business choices uses plain buyer benefits. Hover/focus opens it, click/tap pins it, and Escape/outside interaction dismisses it. It is independently operable from native selection buttons and checkboxes. Fixed-position espresso panels avoid scroll clipping and remain viewport bounded. The franchise explanation distinguishes managing a network from operating franchise locations. Extensions are estimated across the entered locations; partial-group requirements are confirmed in the proposal.
9. The monthly-investment bar and quote review display the exact recurring cost. The mobile bar keeps the total primary and average secondary; multi-location cards/refinement/review retain the average emphasis. Review adds subscription payment timing, scoped setup, exclusions and effective date. The average divides the monthly basket by locations, including discounts and entered employee expansion; it is omitted for one location, incomplete Crew and Enterprise. Calculation cards use the full disclosure width; reached bands precede collapsed schedules. Extension controls use the same applied discount basis. Internal revisions/IDs are absent from buyer-facing screens. At 250+ locations or large workforce counts the headline and CTA use an Enterprise proposal; optional services and terms require confirmation, and price details/ROI are omitted. ROI is an optional Core planning model after review; valid edited assumptions survive reloads.
10. Print / save PDF opens a branded HTML document from the same basket and selected language, with native browser RTL/complex-script shaping, Fraunces/Hanken fonts, Sundae mark/wordmark, espresso investment panel and bulleted scope. The buyer reviews it and uses its print button. Blob navigation avoids the earlier about:blank font-loading issue. A load timeout releases an unresponsive document and returns a retryable failure. Individual Watchtower lines retain localized selected-service names. Share links retain `lang`. Demo/account links use validated `pricingIntent` v2; internal metadata, unknown properties and unrelated Core-only workforce fields are stripped. Complete individual Watchtower selections normalize to one bundle. Website/app intent copies remain synchronized. App authentication stores the intent for onboarding; receivers display it without entitlement or purchase mutations.
11. Consent-aware semantic funnel events describe selection and step/action changes. Late consent retries the visible view once; configuration changes on both pages and share/export outcomes are covered. Contact data and full configuration queries are excluded. Build-time prerendering places catalogue-backed price facts in initial HTML without internal revisions/IDs for JavaScript-free rendering.

## Known parity boundary

The deployed public active response does not yet publish volume tiers, the combined-discount ceiling, implementation-class fees or Watchtower Complete's fixed bundle policy. Cross-Intelligence package prices are now hydrated. Optional missing volume/cap/bundle policies use explicit reference values; unpublished setup amounts are hidden and confirmed separately. Backend PR #1903 adds existing database volume/cap policies to the response but remains undeployed. Setup/bundle policies still need an authoritative contract. Scheduled catalogue activation exists; its live enablement was not verified. Therefore:

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

The latest recorded full unit run passed 43 files / 1,357 tests. Of 69 relevant Chromium scenarios, one translated mobile overflow initially failed; all 22 impacted scenarios passed after the fix, with the other 47 passing in the earlier run. Lint and TypeScript/Vite build passed, including i18n QA, intent parity, pricing validation and prerender. Selected-language print/PDF checks cover fr/ru/ar/zh-Hans/hi/pap. The suites also cover 25 locale controls, automatic extensions, Crew overages/payroll, refresh, discounts, reset, feature help and desktop/mobile axe. A real screen-reader session and production funnel measurement remain pending. See the exact verification record in `PRICING_AUDIT_REPORT.md`.
