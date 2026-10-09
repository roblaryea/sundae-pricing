# Sundae pricing-site runtime flow

> **Last verified:** local pricing checks, 2026-10-09; hosted preview, 2026-10-09
> **Scope:** the `sundae-pricing` SPA and its published-catalogue dependency

## Boundary

`sundae-pricing` is a client application. It calculates and presents a quote, ROI context and a PDF summary. It does not create subscriptions, bill customers, write Stripe state or grant entitlements.

The published database catalogue in `sundae-backend` remains the runtime commercial authority. The public active response retrieved for this work is v1.8.2. Local fallback objects do not prove future catalogue alignment or final billing parity.

## Review deployment

The 2026-10-09 changes use the existing branch test preview: **https://sundae-pricing-git-codex-prici-ecf6e9-sundaes-projects-afd45f7e.vercel.app/**. Exact latest-head deployment provenance and hosted click checks are recorded in PR #47. The preview loads the deployed catalogue through its same-origin Vercel proxy. Companion backend/app/website branches remain review work; production and billing are unchanged. Preview access tokens stay outside Git and PRs.

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
8. Overview shows location count, Core/Crew/Both and whole-dollar base plan cards with applied discount context. Multi-location cards emphasize the average per location/month and retain the smaller total monthly investment directly underneath. Combined buyers edit one card set while the other selection stays in a summary. Mobile shows one complete selected card and native selector; a collapsed comparison becomes a per-plan list without horizontal scrolling. Inherited features are explicit. Unavailable Starter has no numerical price. Setup guidance follows the selected plan and hides unpublished setup fees rather than implying self-service is free. Simulator has choose/refine/review screens. Specialist business choices automatically select their paid extensions, show the price and require removal of the business choice to remove the extension. Optional upgrades remain collapsed. Single brand/diversified group are exclusive; specialist activities can combine. Crew-only hides the Core business-model panel. Scope/term/headcount edits produce one consistent basket; Crew cards include published pooled employee allowances and entered workforce charges. Unknown headcount prompts buyers beside the decision total. Saved state is disclosed and Start over resets configuration while retaining locale/theme. The header opens current review. Location/model copy and header/footer accessibility labels cover all 25 locales.
   Feature help beside Core/Crew features, comparisons, extensions and business choices uses plain buyer benefits. Hover/focus opens it, click/tap pins it, and Escape/outside interaction dismisses it. It is independently operable from native selection buttons and checkboxes. Fixed-position espresso panels avoid scroll clipping and remain viewport bounded. The franchise explanation distinguishes managing a network from operating franchise locations. Extensions are estimated across the entered locations; partial-group requirements are confirmed in the proposal.
9. The monthly-investment bar and quote review display the exact recurring cost. The mobile bar keeps the total primary and average secondary; multi-location cards/refinement/review retain the average emphasis. Review adds subscription payment timing, scoped setup, exclusions and effective date. The average divides the monthly basket by locations, including discounts and entered employee expansion; it is omitted for one location, incomplete Crew and Enterprise. Calculation cards use the full disclosure width; reached bands precede collapsed schedules. Extension controls use the same applied discount basis. Internal revisions/IDs are absent from buyer-facing screens. At 250+ locations or large workforce counts the headline and CTA use an Enterprise proposal; optional services and terms require confirmation, and price details/ROI are omitted. ROI is an optional Core planning model after review; valid edited assumptions survive reloads.
10. Print / save PDF opens a branded HTML document from the same basket and selected language, with native browser RTL/complex-script shaping, Fraunces/Hanken fonts, Sundae mark/wordmark, espresso investment panel and bulleted scope. The buyer reviews it and uses its print button. Blob navigation avoids the earlier about:blank font-loading issue. A load timeout releases an unresponsive document and returns a retryable failure. Individual Watchtower lines retain localized selected-service names. Share links retain `lang`. Demo/account links use validated `pricingIntent` v2; internal metadata, unknown properties and unrelated Core-only workforce fields are stripped. Complete individual Watchtower selections normalize to one bundle. Website/app intent copies remain synchronized. App authentication stores the intent for onboarding; receivers display it without entitlement or purchase mutations.
11. Consent-aware semantic funnel events describe selection and step/action changes. Late consent retries the visible view once; configuration changes on both pages and share/export outcomes are covered. Contact data and full configuration queries are excluded. Build-time prerendering places catalogue-backed price facts in initial HTML without internal revisions/IDs for JavaScript-free rendering.

## Known parity boundary

The final backend/app review changes implement versioned `commercialPolicy`: setup fees/floor flags, offer assignments and Watchtower Complete pricing/allowance. Draft-only Admin editing uses the existing catalogue publication lifecycle. Authoritative publish validation requires complete policy; the nullable migration does not alter the live version. The app public adapter maps the active policy, and the pricing adapter validates it before hydration. The server quote engine consumes the same stored policy.

The deployed feed still lacks those new fields until companion rollout and reviewed policy publication. Missing volume/cap/bundle policy retains explicit reference behavior; missing setup assignments are cleared and setup is scoped. Scheduled activation validates persisted policy and Stripe reconciliation in both the provider and queued job, and invalidates process-local pricing caches after commit. Read-only Railway inspection found production auto-publication unset; no flag was changed. `status: ready` means supported required fields validated, not full billing parity. Server-side eligibility/final quote checks still control activation.

Crew caps are hydrated and availability disclosures are parameterized across 25 locales. Buyer state preserves entered locations. `calculateBasketQuote` rejects an out-of-cap Crew selection before computing Crew lines; it suppresses average, review/export/handoff actions and asks for an eligible plan. This applies equally to store edits, persisted state, imported intent and catalogue refresh. Receivers validate structural intent without embedding a stale commercial cap.

Historical public stateless checks matched 31/32 deployed recurring totals; the remaining case applied a second Watchtower discount to an already-net bundle. Backend PR #1903 contains the correction and policy implementation. All 32 deterministic parity cases pass locally. Release and renewed authenticated/live parity checks remain required.

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

The final pricing unit run passed 43 files / 1,359 tests; lint and TypeScript/Vite build passed. Backend exact-head full quality/security CI passed, including 7,734 tests (3 skipped), migrations/schema/worker checks and build. Focused coverage passed 117 tests across 12 files against fresh PostgreSQL16, schema parity (1,218 tables / 6 views), typecheck and targeted lint. App targeted coverage passed 41 tests; full preflight completed with exit code 0 on `cd7b45425`, including support/i18n/PWA/full lint, all TypeScript projects and the Next.js build. The later app commit changes CI startup only; its public mobile and Crew a11y/performance workflows passed. Public mobile accessibility/best-practices/SEO scored 100 on sign-in and offline; development performance is diagnostic. Website receiver tests/typecheck and exact-head quality/security/Vercel checks passed. Full latest-head companion CI is recorded separately in the PRs. Latest hosted Crew checks confirmed allowances/overage and restoration of shared configuration; country names now localize consistently with the print document. Native PDF opening was blocked by browser approval review and VoiceOver launch timed out. Real screen-reader/print use, coordinated rollout/policy publication, authenticated billing/Stripe parity and production funnel measurement remain explicit release checks in [PRICING_RELEASE_CHECKLIST.md](./PRICING_RELEASE_CHECKLIST.md).
