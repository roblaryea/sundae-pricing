# Pricing Audit Report — consolidated buyer audit, 2026-10-08

**Current status:** the pricing redesign and companion changes are committed and pushed on review branches. The pricing UI is deployed to a Vercel preview for independent review; companion app, website and backend changes are in draft PRs and are not part of this pricing-only deployment. No production promotion, catalogue activation or Stripe mutation was performed. This is not a billing-parity certification. Earlier local-state entries below are historical and are superseded by the deployment record.

**Audience:** internal engineering and QA. Catalogue revisions and IDs remain in audit evidence; customer screens, initial HTML, PDF text and outgoing selection links omit them. Customers see the effective date.

## Feature explanations and operating-model icons — 2026-10-08

Committed and pushed on `codex/pricing-buyer-review-20261008` in `79a3e14` (feature help/icons), `6b92d8d` (retained FAQ/footer) and `15c1d5c` (RTL theme control). The fixed reviewed preview is **https://sundae-pricing-m9u7fk38o-sundaes-projects-afd45f7e.vercel.app**, Vercel Ready / preview, built from `15c1d5c`. It supersedes the earlier preview below. The owner’s URL-scoped share link expires on 22 October 2026; its token is kept outside Git/PRs.

- Core card features, desktop/mobile comparisons, Crew cards/custom assembly, Foresight, concept extensions, Watchtower and Cross-Intelligence Pro have independently operable information icons. English explanations describe an operator decision and commercial benefit without promising savings. Payroll country support and specialist scoping remain explicit. Existing translated catalogue explanations are reused for older feature families; missing families and accessible help labels have copy for all 22 site locales.
- Help opens on hover or keyboard focus; click/tap pins it. Escape, a second click, another help control or an outside click dismisses it. Panels use Hanken typography and warm espresso, stay within the viewport and render above clipping/scroll containers. Plan cards now contain a native selection button and separate help buttons, avoiding nested interactive elements; the selection target still spans the card. Checkbox prices have accessible descriptions. Opening help cannot select a plan or add a paid capability.
- The seven business choices use the onboarding icon vocabulary: Store for a single brand, Building2 for diversified/franchise groups, Hotel, Truck for delivery kitchens, PartyPopper for catering/events and Factory for production. Selected state combines a coral border, icon treatment and check mark. Labels and keyboard access remain explicit; selecting a business model only recommends extensions.
- Companion review #48 identified stale commitment copy in the retained legacy FAQ (not mounted in the new overview/simulator). Incorporated its en/ar/fr/es schedule corrections and removed the obsolete footer revision fields; the footer fallback effective date is 23 August 2026. No new price-lock guarantee is added. Generated FAQs already suppress numeric claims structurally. Current buyer totals/payment terms continue to come from the catalogue-backed flow.
- Mobile image inspection found the theme thumb escaping its track in RTL because normal block alignment moved its origin to the right before a positive horizontal translation. It now has an explicit absolute origin, with English/Arabic/Urdu containment and toggle checks. The shared header is the only ThemeToggle consumer.
- Current validation: **50 targeted Chromium scenarios**, **42 files / 1,345 unit tests**, **ESLint without warnings**, and **TypeScript/Vite build** passed. The build includes translation QA, handoff parity, pricebook validation and initial HTML. The browser cases include hover/click/focus/Escape, untouched quote totals, whole-card selection, 22 locale help labels, English/Arabic mobile bounds, automated axe with help open, model icon selection, prior buyer enhancements, share/PDF and consent-aware event execution. Native in-app visual inspection confirmed the espresso help panel and branded icon grid. A real screen-reader session remains separate.

- Final hosted evidence: root and active-catalogue proxy returned HTTP 200. Native help displayed the Profit Intelligence explanation while the selected Foundation quote stayed $1,195/month. Franchise model selection and its help did not add a charge; explicit extension selection plus annual upfront payment produced $935.73/location/month, $2,807.20/month and $33,686.40 due upfront. The 375px Arabic header now keeps its theme thumb inside the switch; the English mobile model grid remains legible. English and the normal viewport were restored. Screenshots: `hosted-feature-help.png`, `hosted-business-icons.png` and `hosted-business-icons-mobile.png`.

### Earlier reviewer items: exact closure status

| Reviewer item | Test-preview result | Remaining boundary |
|---|---|---|
| 1. Hidden setup | Visible $0 self-service / $1,500–$7,500 assisted / from $12,500 complex guide, with expanded launch fees | Final setup follows confirmed scope; no invented package-to-class assignment |
| 2. Headline cents | Whole-dollar card prices; exact basket/payment/PDF amounts | None for the requested display change |
| 3. Hidden discounts | Applied discount labeled on cards and extensions; consistent net prices | Live final quote/billing parity remains a release gate |
| 4. Both card overload | One editable Core/Crew card set with the other in a summary | None for this presentation change |
| 5. Unavailable Starter price | No price above five locations; selection disabled | None for this presentation change |
| 6. Inherited features | Foundation inheritance explicit; Performance combines Margin/Growth | Comparison and help retain detailed feature coverage |
| 7. Mobile descriptions/comparison | Full selected card, native selector and collapsed per-plan comparison | Real-device/screen-reader release pass still needed |
| 8. Unknown employees | Prompt beside price and on Crew cards; entered workforce updates estimates | Payroll-country coverage/launch scope confirmed before setup |
| 9. Remembered selections | Saved-browser notice and Start over | Persistence is intentional and disclosed |
| 10. Header quote flow | Current-review link rather than restarting a competing simulator | Companion receivers require release |
| Crew inputs, eligible Watchtower, locales, PDF/share | Covered in targeted browser tests; previous native hosted walkthroughs also recorded below | Native hosted tooltip/icon/RTL checks passed on the recorded preview |
| Accessibility | Keyboard, accessible names/descriptions and axe pass | VoiceOver/NVDA session not performed |
| Funnel measurement | Consent-aware events exercised, including late consent and refinements | Production collection/dashboard verification and baseline remain open |
| Production provenance | Preview commits/deployments recorded; production unchanged | Companion backend/app/website releases, authenticated quotes, checkout, entitlements/trials and Stripe parity remain open |

## Review deployment record — 2026-10-08


**Earlier enhanced preview (superseded above):** https://sundae-pricing-k6zqhll1y-sundaes-projects-afd45f7e.vercel.app — Vercel Ready / preview, built from `1c13440` on `codex/pricing-buyer-review-20261008`. This supersedes the older fixed preview described below. A new URL-scoped share link is supplied directly to the owner and expires on 22 October 2026; its token remains outside Git/PRs. Native hosted checks verified the Growth + Franchise configuration at three locations, annual upfront terms, emphasized $935.73/location/month, smaller $2,807.20/month investment and $33,686.40 subscription payment. Copy/reopen preserved these values. Hosted root and active-catalogue proxy returned HTTP 200.

### Follow-up buyer review fixes

- **Average-first hierarchy:** the average is now the emphasized amount on multi-location plan cards, the overview decision bar, refinement, review and PDF. The full monthly investment remains directly beneath the average on screen and alongside it in the PDF; payment timing stays explicit. At 120 Foundation locations, the exact discounted total is $15,290.25/month and the average is $127.42/location/month. It is a basket average, not a flat location tariff. One-location, incomplete Crew-selection and Enterprise estimates omit it.
- **Setup visibility:** a visible guide shows Crew Starter self-service at $0, assisted setup at $1,500–$7,500, and complex projects from $12,500. Expanded guidance includes the $2,500 standard launch. These approved reference fees are not inferred package assignments. The actual setup line remains separately scoped unless known; concepts and payroll are confirmed against launch scope. Recurring prices/catalogue/Stripe are unchanged.
- **Price clarity:** cards round to whole USD, with exact amounts retained in the basket, payment and breakdown. Cards and extension controls disclose the applied volume or subscription discount and use the same net discount basis. Employee expansion remains outside discounts. Unavailable Starter cards show the five-location limit without a price.
- **Plan structure:** combined buyers edit one Core or Crew card set while the other selection stays in a summary. Margin and Growth explicitly inherit Foundation; Performance inherits both and includes forecasting. Mobile uses a native plan selector and one complete selected card. Comparison is collapsed and becomes a per-plan feature list on mobile, eliminating horizontal table scrolling.
- **Buyer controls:** unknown workforce counts prompt buyers beside the monthly total and on Crew cards; entered employees update Crew card estimates. Saved-browser state is disclosed and a global Start over resets configuration while preserving locale/theme. The header Review estimate action opens the current review; the mobile decision bar provides the same path.
- **Mobile first price:** saved-state and detailed billing notices sit after the cards. Fresh 375px and 390px buyers see the first card price above the cookie banner. Native English/Arabic inspection confirms legible prices, average, controls and official brand assets.
- **Instrumentation:** semantic funnel calls cover the current journey. Two tests exercise the real transport wrapper, mocking only PostHog/Sentry boundaries: consent, initialization, opt-out, dispatch and query stripping. The browser test also exercises late consent and subsequent refinements. Preview/production analytics variables are configured; production receipt and conversion metrics were not measured.
- **Verification:** 42 unit-test files / 1,345 tests passed. The two targeted browser suites contain 42 Chromium scenarios covering the current buyer flow, 22 locale notices/totals/overflow, Crew employee/payroll inputs, eligible Watchtower, copied-link reopening, six PDF configurations, keyboard focus, reset and discounts. Desktop/mobile axe checks cover choose and refine. ESLint and TypeScript/Vite build passed, including translation QA, handoff parity, pricebook validation and initial-HTML generation. The exported mixed estimate's two pages were rasterized and inspected again. This is targeted verification, not full app preflight or a claim that legacy browser suites pass.
- **Remaining launch boundaries:** a real VoiceOver/NVDA session has not been performed; automated axe, keyboard and native accessibility-tree checks do not replace it. Pricing-only preview deployment does not release companion backend/demo/onboarding receivers. Backend Watchtower correction, authenticated final quotes, live checkout, entitlements/trial provisioning and production funnel measurement remain release checks. No real forms were submitted.

| Surface | Committed and pushed code | Draft review |
| --- | --- | --- |
| Pricing | `dc4c6e2`, `9a49b90` font-license formatting, and `1c13440` buyer-review enhancements | https://github.com/roblaryea/sundae-pricing/pull/47 |
| Backend | `c3abddb5` on a clean `origin/develop` worktree | https://github.com/Sundae-io/sundae-stable/pull/1903 |
| Website demo receiver | `bb728ca` on current `origin/main` | https://github.com/roblaryea/sundae-website/pull/153 |
| App account/onboarding receiver | `b20745d9d` on `origin/develop` | https://github.com/Sundae-io/sundae-app/pull/1823 |

- Earlier fixed review deployment: `https://sundae-pricing-62tamebuk-sundaes-projects-afd45f7e.vercel.app`, built from `9a49b90`, Vercel status Ready / preview. A URL-scoped share link is supplied directly to the owner; its access token is deliberately absent from repository files and PRs. It expires on 22 October 2026. The unadorned URL requires Vercel access; reviewers must first open the supplied share link. Shared configurations and PDF links also require that preview access cookie.
- The hosted root and same-origin active-catalogue proxy returned HTTP 200 after share access. Native hosted buyer checks covered three-location Core Margin, an explicitly selected Franchise extension, annual quarterly terms, review amounts, PDF export and the manual-copy fallback when the browser blocks clipboard access. The monthly estimate was $2,740.75, average $913.58/location, with $8,222.25 due per quarter. The exported two-page PDF was downloaded, text-checked for matching amounts and absence of internal catalogue revisions, rasterized and visually inspected. Hosted sharing reopened the same $2,740.75 estimate. Crew Operating at three locations and 65 employees showed $697 base + $15 extra employees = $712/month; combined Core Margin/Crew showed $2,852/month. The 250-location combined route reached proposal review with prices/terms confirmed separately. A 390px Arabic combined review had equal viewport/content widths (no horizontal page overflow); English and the normal viewport were restored.
- Pricing verification remains 41 unit-test files / 1,343 tests, 32 targeted Chromium scenarios, ESLint and TypeScript/Vite build passed. Backend push passed lockfile, formatting, topology and full TypeScript gates on the isolated develop base; its 37 pricing calculator tests passed. Website TypeScript and two handoff tests passed on its isolated main base. App's two source TypeScript projects and the pre-push gate passed; seven pricing-intent tests passed. These are separate checks, not full app preflight.
- Review boundaries: the preview changes the pricing experience only. Demo/account CTAs still target the existing live destinations; the companion receivers need their own release before the complete new handoff is live. The backend Watchtower correction is pushed for review and remains undeployed. Final authenticated quotes, checkout, Stripe billing, entitlement provisioning, live trial eligibility and production funnel measurement remain unverified. Do not submit real forms or treat this estimate as a payable quote during review.

## Final local audit closure — 2026-10-08

- Average monthly cost per location appears below the primary monthly total in refinement, review and the PDF. It uses the same discounted basket, including entered additional-employee charges. It is omitted for one location, 250+ Enterprise and an incomplete Crew selection. The average label is available in all 22 site locales; the PDF remains English. This is the total divided by locations, not a flat per-location tariff.
- Individual Watchtower selections now retain their exact service names in the shared calculation and PDF. The full bundle retains its bundle label and already-net price. The legacy price-calculation consumer classifies the individual lines by stable service ID.
- Enterprise refinement shows proposal confirmation for optional extensions, individual Crew options and payment terms. It omits numerical discounts, calculated price details, the per-location average and the ROI illustration; reviewed/exported scope still preserves the buyer's selections.
- Package cards use short buying purposes in all 22 locales rather than reusing technical module catalogue descriptions. English primary card copy no longer contains CAC, COGS or P&L abbreviations. The initial HTML uses the same buying purposes and plain wording for location pricing.
- The corrected local backend calculator matched all **32 recorded monthly-normalized recurring cases** using the captured published Core curves and fixed Crew bundle inputs, with existing module/Watchtower/policy metadata. Five separate Watchtower fixed-bundle execution cases also passed: **37 tests total**. This is deterministic calculator coverage, not database, checkout or Stripe integration coverage. No published prices changed to satisfy these tests.
- Latest pricing checks: **41 files / 1,343 unit tests**, **32 Chromium scenarios**, **ESLint**, and **TypeScript/Vite build** passed. The build includes translation QA, handoff parity, pricebook validation and initial-HTML generation. Targeted backend ESLint passed. Current backend repository typecheck is blocked by two nullable-value errors in concurrently edited `tests/unit/foresight_backtest.spec.ts:37–38`; pricing tests passed independently.
- Native final buyer checks confirmed the secondary average wraps legibly at 390px in English and Arabic, with Enterprise extension and payment-term confirmation. The preview is left in English at its normal viewport.
- The refreshed PDF sample and previews were rasterized and inspected: **9 pages across 6 configurations**. Warm espresso, matched amount typography, scope bullets, selected service labels, secondary average, brand assets, totals, payment timing and page breaks remain readable.
- Current pricing additions are **untracked**: `src/lib/basketQuote.ts`, `src/lib/basketPdf.ts`, `src/lib/buyerCopy.ts`, `src/lib/buyerPlanCopy.ts`, `src/components/Pricing/PricingWorkspace.tsx`, `__tests__/buyerPricing.spec.ts`, PDF sample and previews. Existing pricing engine/hook, browser tests, prerender script's surrounding build integration and these tracked audit/runtime docs remain **modified-uncommitted**; `scripts/prerender-pricing.ts` itself is **untracked**. Backend `app/services/quote_engine.ts` is **modified-uncommitted**; `tests/unit/pricing_site_quote_parity.spec.ts`, `tests/fixtures/pricing_site_quote_cases.json` and `tests/unit/watchtower_fixed_bundle_quote.spec.ts` are **untracked**. No staging, commit or deployment by this task.

## Estimate design and buyer-language refinement — 2026-10-08

- The PDF amount panel uses the established warm espresso `#2A231C`. Monthly equivalent and payment amount share Hanken Grotesk Semibold, font size and baseline; large values shrink together. Fraunces remains for the wordmark and headings. The previous display-font/size split was an editorial choice, not a pricing requirement.
- PDF scope disclosures are bullets. They preserve the subscription duration, payment timing, employee count/included allowance/extra charge, discount exclusion, charges for the remaining time and subscription-period commitment, payroll-country confirmation, specialist usage exclusions, taxes/setup exclusions, estimate status and effective date. Payroll countries display their full English names where available. Enterprise employee allowances and prices require proposal confirmation instead of displaying illustrative amounts as confirmed terms.
- Website scope notes use semantic lists and show the entered employee count. English buyer copy replaces employee slots, objects, activation, marginal bands and setup class codes with plain wording. Handoff copy is synchronized into website/app; other locale text retains its existing meaning. The branded PDF remains English.
- Verification: pricing lint and TypeScript/Vite build passed, including translation QA, handoff parity, pricebook validation and prerender. **41 files / 1,343 unit tests passed. 32 Chromium scenarios passed** after final wording/layout refinements. Export checks include quarterly payment timing, additional employee arithmetic, unknown employee count, Enterprise Core/Crew confirmation and exclusion of internal IDs/jargon from PDF text. Website handoff: **2 passed**; app pricing-intent: **7 passed**.
- Rasterized and visually inspected the latest **9 pages across 6 PDF configurations**: mixed Core/Crew (2), simple Core (1), dense scope (2), Enterprise Core (1), Crew with unknown employee count (2), Enterprise Crew (1). The final mixed sample and both-page previews are refreshed. Its review link uses the persistent local preview at port 5183. A transient development hot-reload context error cleared on a settled reload; native preview clicks reached refinement and review successfully.
- VCS: pricing `src/contexts/LocaleContext.tsx`, `src/index.css`, `e2e/pricing-simulator.spec.ts` and this report are **modified-uncommitted**. Pricing `src/lib/basketPdf.ts`, `src/lib/buyerCopy.ts`, `src/lib/pricingPolicyCopy.ts`, `src/components/Pricing/PricingWorkspace.tsx`, `src/lib/pricingHandoffCopy.ts`, PDF sample and preview images remain **untracked**. Sibling app/website `src/lib/pricingHandoffCopy.ts` remain **untracked**. No staging, commit, deployment, billing rule or catalogue mutation. Existing release boundaries below still apply.

## Local implementation record — 2026-10-08

- **PRICE-01–04:** normalize the actual published `tiers/modules/bundles/watchtower/discounts` response, validate required curves/grants/caps before hydration, and retain catalogue version/effective date. Hosted catalogue errors block stale prices. Concept add-ons now use their location bands. Crew allowance/rate inputs follow the published rules and pool unique employees once. Performance includes Foresight without charging it again and omits Delivery from the current grant comparison. Starter's full band schedule retains its five-location cap.
- **PRICE-05:** one basket supplies the rendered estimate and PDF; commitment/volume discounts are applied once to eligible recurring costs, while employee expansion stays outside the discount. Payment timing is explicit. Setup remains visibly scoped where its class is unresolved. The universal anchor-relief illustration is absent from the primary buyer flow.
- **UX-01–03:** price-first location input and Core/Crew/Both choice, compact Core cards with the domain comparison directly below, Crew presets with individual assembly secondary, and three simulator screens: choose, refine, review. Operating models recommend extensions; a separate explicit control adds the paid extension. The optional Core ROI model follows the quote and uses the chosen commitment, while disclosing excluded basket spend. Empty Crew selections cannot advance to review; Enterprise and review link creation validate the selection first, preventing the reproduced empty-Crew/250-location crash. Choosing a valid preset restores the proposal path.
- **FLOW-01–02:** offer selection persists into refinement/review. Validated, UTF-8-safe v2 intent carries selected scope, terms, workforce and extensions into share links, PDF, demo and the account/onboarding receiver. Outgoing intent strips internal catalogue metadata and unknown fields; legacy catalogue context is validated and discarded. Malformed/retired links retain the current selection. Returning visitors retain validated ROI assumptions. Complete individual Watchtower selections normalize to the same bundle in controls, imported links and saved state. URL intent grants no entitlements and does not constitute a payable quote. Marketing's diagnostic producer no longer emits contact data or retired tier/module fields in the URL.
- **MEASURE-01:** consent-aware semantic events cover first-price display, configuration changes on overview and simulator, steps, review, sharing, PDF, demo/account and catalogue errors. A view that was not delivered before consent retries once for the visible stage. Share success/fallback and PDF completion/failure are recorded. Query data is stripped from analytics/error URLs. A production funnel baseline remains a post-release measurement task; no production conversion result is claimed.
- **CONTENT-01:** new buyer controls and critical payment/workforce/setup disclosures have copy across the 22 offered locales. Receivers share generated localized context and canonical offer labels. PDF is intentionally canonical English. Percentage outcome claims, universal free-trial promises, persona reveals and achievements are absent from the primary route.
- **DISCOVER-01:** regular and GitHub build hooks inject catalogue-backed Core/Crew anchors, the one-location basis, exclusions and provenance into initial HTML. Raw HTML and a Chromium render with JavaScript disabled were checked. Search-engine indexing itself was not measured.
- **Design:** warm Sundae palette, Fraunces display type and Hanken Grotesk UI type; cream selection, coral actions, responsive comparison and quote surfaces. PDF uses the existing official mark, Fraunces wordmark/headlines, embedded Hanken fonts, vector text, a payment panel, aligned item rows, cohesive scope notes, page numbers and a configuration link. Brand assets are fetched only on export; failure is retryable. Simple and Enterprise samples fit one page; dense and mixed samples paginate coherently. Every generated sample page was rasterized and visually inspected. PDF remains canonical English.
- Mobile language selection now remains accessible through a compact globe control. 375/390px checks cover switching into RTL and back without page overflow. Native 390px review covered light/Arabic and English layouts. Shared stable discount keys and localized location labels replace stale English money-line fallbacks in both summary consumers.
- Calculation disclosures expose reached bands first, an optional full schedule, Watchtower/CI formulas, non-stacking discount schedules and the cap, exclusions, and reference implementation class fees with a scoped-proposal warning.
- Fresh-visitor browser checks at 375/390px confirmed the first price remains above the visible cookie banner in the tested 844px viewport; final mobile screenshots and header/locale checks reflect the compact language control. `screenshots/mobile-fresh.png` records the consent-visible layout.

### Audit closure matrix

| Finding | Local disposition | Release or commercial boundary |
|---|---|---|
| PRICE-01 | Actual catalogue shape validated and hydrated; error/retry exercised | Hosted endpoint and final billing still require release verification |
| PRICE-02 | Concept/Crew location bands, bundle substitution and copy corrected | Published commercial mechanics retained |
| PRICE-03 | Published staff allowances/rates, unique headcount and conditional payroll input | Object expansion and payroll implementation remain scoped in proposal |
| PRICE-04 | Current package grants shown; included Foresight not charged twice | No entitlement/provisioning mutation exercised |
| PRICE-05 | One monthly headline, explicit payment timing, scoped setup and current effective date | No unconditional introductory relief or trial promise |
| PRICE-06 | Backend Watchtower double-discount corrected locally; 37 execution tests including 32 recorded estimate cases | Deployed mismatch persists until backend release |
| FLOW-01 | Chosen package and scope retained through forward/back/edit | Browser scenarios passed |
| FLOW-02 | Validated share/PDF/demo/account intent; exact recipients checked | Account receiver displays/saves intent; activation and trial eligibility stay server controlled |
| MEASURE-01 | Semantic events, late consent, configuration and export outcomes exercised | Production baseline/conversion measurement awaits release |
| UX-01–03 | Price-first overview, nearby comparison, optional refinements, three screens, optional ROI | Desktop/mobile/RTL and keyboard paths exercised |
| CONTENT-01 | Critical localized commercial copy, stable money labels and customer metadata removal | Protected offer names remain canonical; PDF is English |
| DISCOVER-01 | Catalogue-backed initial HTML and JavaScript-free render checked | Search indexing is a post-release observation |

### Verification results

| Scope | Actual result |
|---|---|
| Pricing unit suite | 41 files, 1,343 tests passed |
| Pricing browser suite | 32 Chromium scenarios passed; includes 375/390px language/RTL, German, light mode, optional ROI, returning state, keyboard/focus, catalogue failure/retry, share success/fallback, late consent and simple/dense/Enterprise PDF text/amount/font checks |
| Native buyer walkthrough | Real published catalogue through same-origin local proxy; Growth/franchise opt-in, terms, share reopen, Crew allowance/overage and unsupported payroll scope; 390px light/RTL review; no console warnings/errors captured in the successful walkthrough. Native in-app download-event capture timed out; actual PDF download/content/layout verification uses Chromium exports |
| Pricing lint | Passed |
| Pricing build | TypeScript + Vite + initial-HTML generation passed; includes translation QA, handoff parity and pricebook validation |
| Shared handoff | `npm run qa:intent` checks byte parity when sibling repositories are available; `npm run sync:intent` regenerates contract/copy |
| Website | Typecheck, build and targeted lint passed; repository lint passed with warnings; two new handoff tests and 12 diagnostic/lead tests passed |
| Built demo recipient | Displayed exact Core/Crew, extension, term, employee count and country through a real local GET; no form submitted |
| App | Source typecheck and targeted lint passed; 14 targeted auth/return-path tests passed |
| Current handoff regressions | Website: 2 passed. App pricing-intent: 7 passed after customer metadata stripping and shared normalization |
| App full preflight | Stopped at support translation verification on stale `playbooks/notification-preferences.md` translations. Later gates were not reached; full preflight is not passing |
| Public backend quote comparison | 31/32 monthly-normalized recurring totals matched within one cent; remaining case is the deployed Watchtower double discount |
| Backend local correction | 37 QuoteEngine tests passed with deterministic catalogue input; touched-file ESLint passed. Current backend typecheck fails in two concurrent Foresight-test lines; no database integration, deployment or Stripe execution |

### Remaining commercial and release boundaries

The public catalogue does not expose every rule needed for a final invoice. Watchtower bundle mechanics, Cross-Intelligence, volume/cap policy and implementation classification still include approved local metadata. Specialist object charges and country-specific payroll implementation are visibly excluded/pending proposal confirmation. Some specialist public rows have pre-GTM caveats in backend documentation; the UI does not promise automatic activation. The public stateless quote endpoint was compared; authenticated net quotes, checkout, subscription activation, Stripe execution and live trial eligibility were not exercised.

**PRICE-06 — release blocker:** three-location Growth + complete Watchtower is $2,445 + the already-net $1,117 bundle = $3,562/month on the site. Deployed QuoteEngine subtracts another $201.06 (18%), returning $3,360.94/month. The local correction reports actual savings versus individual services as informational, matching existing fixed-price Crew bundle treatment. It does not alter published prices or charge a second discount. Monthly, annual-quarterly, annual-upfront, two-year-upfront and individual-service cases execute in the five regression tests. Raw comparison evidence: `public-quote-check.json`. Release the correction and rerun parity before claiming production alignment.

The account path saves and displays selection for onboarding; it does not automatically select entitlements in the organization wizard or purchase/provision the configuration. Existing access/invitation policy remains authoritative. All four repositories contain pre-existing/concurrent edits; those have been preserved.

### VCS state of runtime files for this change

**Pricing — modified-uncommitted:** `src/pages/PricingOverview.tsx`, `src/pages/Simulator.tsx`, `src/components/SiteHeader.tsx`, `src/components/PricingDisplay/ROISimulator.tsx`, `src/data/livePricing.ts`, `src/data/pricing.ts`, `src/hooks/useConfiguration.ts`, `src/index.css`, `src/lib/analytics.ts`, `src/lib/crewPricing.ts`, `src/lib/journey.ts`, `src/lib/pricingEngine.ts`, `src/lib/pricingI18n.ts`, `src/lib/sentryPolicy.ts`, `package.json`, `index.html`, `playwright.config.ts`, `e2e/pricing-simulator.spec.ts`, `scripts/qa-translation-quality.mjs` and the adjusted existing pricing tests/docs.

**Pricing — untracked:** `src/components/Pricing/PricingWorkspace.tsx`, `src/hooks/useBuyerQuote.ts`, `src/lib/basketQuote.ts`, `src/lib/basketPdf.ts`, `src/lib/buyerCopy.ts`, `src/lib/buyerAuxiliaryCopy.ts`, `src/lib/persistedPricing.ts`, `src/lib/pricingIntent.ts`, `src/lib/pricingHandoffCopy.ts`, `src/lib/pricingLinks.ts`, `scripts/prerender-pricing.ts`, `scripts/sync-pricing-handoff.ts`, `__tests__/buyerPricing.spec.ts`, `__tests__/fixtures/published-v1.8.2.json` and `docs/product/pricing/screenshots/`.

**Website — modified-uncommitted:** `src/lib/diagnostic/pricingLink.ts`, `src/app/demo/page.tsx`, `src/components/marketing/LeadCaptureForm.tsx`, `package.json`. **Untracked:** `src/lib/pricingIntent.ts`, `src/lib/pricingHandoffCopy.ts`, `tests/pricing-handoff.test.mjs`.

**App — modified-uncommitted:** `src/components/auth/SignInRouteClient.tsx`, `src/app/onboarding/OnboardingPageClient.tsx`. **Untracked:** `src/components/onboarding/PricingIntentContext.tsx`, `src/lib/auth/pricing-intent.ts`, `src/lib/auth/pricing-intent.test.ts`, `src/lib/pricingIntent.ts`, `src/lib/pricingHandoffCopy.ts`.

**Further pricing runtime files — modified-uncommitted:** `package-lock.json`, `vite.config.ts`, `src/components/Summary/ConfigSummary.tsx`, `src/hooks/usePriceCalculation.ts`, `src/lib/quoteSummaryCopy.ts`. **Untracked:** `src/hooks/usePricingTelemetry.ts`, `src/lib/pricingPolicyCopy.ts`, embedded fonts and their licenses in `public/fonts/`, `docs/product/pricing/public-quote-check.json`, branded PDF sample under `output/pdf/` and export preview under `docs/product/pricing/screenshots/`.

**Backend — modified-uncommitted:** `app/services/quote_engine.ts`. **Untracked:** `tests/unit/watchtower_fixed_bundle_quote.spec.ts`. Other Foresight work was left intact. Repository diff checks passed in the four touched repositories; no files were staged or committed by this task.

## Objective and agreed direction

Help a buyer see a relevant subscription estimate immediately, understand the meaningful package differences, refine only the inputs that affect their purchase, and carry one consistent quote into sharing, sales and onboarding.

Retain the published commercial model for this work. Simplify its presentation and decision flow. A change to Watchtower/Cross-Intelligence pricing, package prices, discount rules, implementation policy or trial availability is a separate commercial change; it must not happen implicitly during the UX redesign.

Use **location count first**, alongside a Core / Crew / Both selector with plain-language explanations. Do not require the operating-model questionnaire before showing prices. Business setup and product need are independent: a franchise or diversified group may want Core, Crew, or both. Adapt subsequent labels and choices from the canonical onboarding models.

## Evidence and limits

Evidence combines the live pricing overview, Core and Crew simulator walkthroughs, a 390 × 844 mobile view, local pricing/marketing/onboarding source, the supplied second review, and public catalogue responses retrieved on 2026-10-08.

- Active catalogue: `v1.8.2`, version ID `869b1bc6-478b-45b4-83d8-9a3aae91b506`; published/effective `2026-08-23T02:06:52.442+00:00`. Authority: `https://api.sundaetech.ai/api/v1/pricing/catalog/versioned`; site adapter endpoint: `https://pricing.sundae.io/api/pricing/catalog/active`.
- A read-only comparison checked **20 candidate recurring curves at 345 sample points**: four Core packages, Foresight, six concept mappings, six Crew SKUs and three Crew bundles. No gross recurring-total difference was found at those points. Counts above the self-serve threshold were arithmetic reference checks, not purchasable quotes. This does not verify discounts, employee/object overages, implementation, entitlements, tax, Stripe, or deployed calculation code.
- The six local concept curves are banded, but `calculateConceptPrice` and `calculateAddOnsPrice` still use the first-unit `monthlyPrice` as a flat total. At three locations, Franchise is $745 on its curve but $595 through the add-on calculation; Hotel F&B is $565 versus $395. The same defect was reproduced for the other four concepts. This is a calculation-path defect as well as a copy defect.
- Crew caps/rates differ between site metadata and the live catalogue for the six inspected Crew SKUs. Example: Crew Manage locally has 15 included employees/location and $2 overage; the live rule has 20 and $3. Crew Starter retains 15 included employees but the live overage is $2 versus $1 locally. The builder does not collect employee counts, so a location-only estimate cannot be described as a complete employee-adjusted price.
- The live catalogue loader expects `corePackages`, `foresightAction`, and `concepts`; the actual response exposes `tiers`, `modules`, `addons`, `bundles`, `watchtower`, and `discounts`. It can mark the fetch ready without applying those missing families. Matching static values today do not establish future synchronization.
- Named funnel helpers (`trackSimulatorStarted`, `trackPricingConfigured`, `trackCtaClicked`) have definitions but no call sites under `src`. PostHog page/autocapture initialization exists and is consent-dependent. This means missing explicit funnel instrumentation, not proof that no analytics data exists.
- Initial live HTML has an empty root and a JavaScript-required notice, with no pricing body content. JavaScript-capable crawlers may still render it; actual search/AI indexing behavior was not tested.
- The second review's 375px measurements (approximately 980px to first price and 11,300px page height) remain reviewer-reported. The independent 390px check confirmed header overlap and no package price on the initial screen, without establishing those exact measurements.
- Existing September handoff/context documents asserting an unpublished v1.8 candidate or a v1.7 live baseline are historical assumptions superseded by the retrieved active catalogue. Their proposed rollout steps must not be replayed against production on that basis.

## Consolidated backlog and acceptance criteria

| ID | Priority / sequence | Finding and root cause | Required result / acceptance |
|---|---|---|---|
| PRICE-01 | P0 — foundation | Catalogue fetch succeeds against an incompatible response shape; hydration covers only a subset and can leave static prices active. | Normalize actual catalogue keys, IDs and rules across supported offers. Retain version/effective-date metadata. Require successful validation of required data before presenting a confirmed price; visibly distinguish unavailable/indicative estimates. Unknown or retired keys cannot become offers. |
| PRICE-02 | P0 — foundation | Concept curves and add-on calculations disagree; overview still says flat/no per-location pricing for concepts and Crew. | Resolve supported concept and Crew recurring totals from the published curves through one calculation path. Overview, picker, summary and exports agree at the same scope; remove contradictory copy and comments. Check progressive boundaries and bundle replacement without a second bundle discount. |
| PRICE-03 | P0 — foundation | Workforce allowances/overages are stale, and relevant quote inputs are absent. | Hydrate published allowances/rates; verify per-SKU/bundle overage semantics. Collect employee counts or clearly label the base estimate and excluded overages. Apply payroll country and relevant object-count questions conditionally. Do not infer a universal overage rule from one SKU. |
| PRICE-04 | P0 — foundation | Core Performance's local feature grant and the public catalogue differ: site lists Delivery and offers Foresight as an expansion; catalogue `includedModuleIds` includes Foresight. | Reconcile catalogue price metadata with authoritative entitlement rules before publishing the package comparison. Normalize known ID aliases (`revenue`/`revenue_assurance`, `guest`/`guest_experience`) and investigate substantive differences. No charge for an already-included capability. |
| PRICE-05 | P0 — foundation | Summary displays list price and an unconditional relief scenario as competing buyer prices; implementation can remain scoped. | Headline the actual applicable payable recurring amount and payment schedule. Show an introductory price only when eligibility and billing support are resolved; otherwise label it an illustration. Disclose future increases and one-time fees. Unknown implementation must remain visibly excluded/pending, never represented as $0. Derive effective date from catalogue metadata. |
| FLOW-01 | P1 — recovery | Core and Watchtower overview selection handlers only navigate to the simulator. | Persist the selected offer and relevant scope before navigation; the destination renders that selection. Verify both fresh and returning visitors; explicitly handle Watchtower's Core prerequisite. |
| FLOW-02 | P1 — recovery | Trial link loses configuration; export/demo/summary can recompute or transmit different subsets. Existing `cfg` producers/readers disagree. | Define and validate a shared, versioned configuration transport, supporting Core/Crew/Both, exact scope, concept/Watchtower selection, commitment and payment timing. Connect the real account/onboarding receiver and resolve actual trial eligibility. Treat URL data as intent, not an authoritative payable quote; recalculate server-side. PDF, demo, share and onboarding preserve the same selection and quote/version context. |
| MEASURE-01 | P1 — before redesign rollout | Defined semantic funnel events are unused. | Instrument first price displayed, configuration change, refinement/step progression, quote review, PDF/share/demo/trial actions, and catalogue/quote failures. Honor consent and initialization; prevent duplicate events and exclude contact details or complete configuration URLs. Establish baseline for consented traffic and state its coverage limitation. |
| UX-01 | P1 — main redesign | First-screen hierarchy teaches billing mechanics and product architecture before showing a buyer price. | One pricing surface with exact location input, Core/Crew/Both needs selector and live scope totals. First screen exposes a useful base subscription estimate. On mobile, lead with the recommended option and compact alternatives; selection and primary totals remain reachable. Fix logo/CTA overlap at 375px and 390px. |
| UX-02 | P1 — main redesign | Outcome/package differences are obscured by repeated bands, scale examples, credits and large catalogues. | Move the short domain comparison alongside package cards. Keep Margin and Growth visibly distinct branches. Prefer existing Crew presets, with individual-SKU configuration secondary. Put arithmetic, full bands, AI allowances and implementation definitions in accessible breakdowns. Show the bands used by the current estate first; keep the full schedule available. |
| UX-03 | P1 — main redesign | Six-question discovery, persona reveal, gamification, ineligible Watchtower and compulsory ROI delay quote access. | A refinement path targeting at most three screens: confirm relevant scope/needs, resolve bill-affecting inputs/eligible extensions, then review. Remove persona reveal, achievements/confetti and duplicate location buckets from the primary route. ROI becomes optional after the quote; preserve editable assumptions and modelled-versus-measured disclosures. |
| CONTENT-01 | P1 — release | Savings percentages, trial wording, effective dates and translated commercial copy can overstate or contradict current offers. | Verify claim evidence and units; distinguish planning assumptions from proven customer outcomes. Prefer capability descriptions on primary cards. Trial copy matches actual eligibility. Price mechanics, currencies, dates and exclusions stay aligned across supported locales and exports. |
| DISCOVER-01 | P2 — discoverability | Pricing facts are absent from initial HTML. | Provide indexable pricing/product explanation through an appropriate rendering or prerendering approach for this Vite deployment. Include provenance/effective-date handling and verify raw HTML plus a rendering crawler. Do not introduce a framework migration solely to fix this. |

## Target buyer experience

1. **See prices:** exact location/operating-unit count and Core / Crew / Both selector. Core shows the four package totals; Crew leads with existing presets; Both combines a selected Core package and Crew preset into a clear basket. Show currency, pricing basis and excluded setup/unknown overages beside the estimate.
2. **Compare outcomes:** compact domain comparison immediately below or beside the totals. Each option has a plain-language purpose and a few meaningful differences.
3. **Refine relevant needs:** operating model filters and recommends specialist extensions. Selecting a business model does not silently add a paid SKU; an explicit extension control shows its incremental cost. Show conditional employee, payroll-country, object-count and integration inputs only where relevant. Preserve a direct comparison path for buyers who know what they want.
4. **Review one quote:** recurring payable total, commitment, actual amount/payment timing, relevant scope/allowances, one-time setup or scoping requirement, tax treatment and any applicable future price changes. Route 250+ units and earlier enterprise requirements to a sales-scoped path; published tail bands remain reference inputs.
5. **Continue or share:** eligibility-appropriate trial/onboarding or scoped proposal, plus demo, share link and PDF. ROI and detailed competitor comparison are secondary, optional explorations.

## Decisions resolved for the UX work

- Keep multiple internal pricing mechanics while presenting a single understandable total. Do not migrate Watchtower or Cross-Intelligence Pro to bands during this redesign.
- Publish implementation as a separate charge/estimate when supported, and an explicit scoping requirement otherwise. Move class tables into the calculation details; do not hide possible setup costs.
- Use actual quote eligibility for the headline price. The four-year relief illustration cannot be treated as a universal offer merely because its maths exists in frontend source.
- Reuse the idea of `cfg`, with a corrected shared schema and an actual onboarding receiver. The current base64 link is insufficient: marketing still emits retired `report`/tier/module fields, while the simulator expects `corePackage`/`addOns`. A shareable configuration is not a fixed commercial quote.
- Treat locations as sufficient for the **first base subscription estimate**, not necessarily the final bill. Crew employees, specialist object counts and setup can add bill-affecting inputs.
- Confirm trial coverage from runtime policy. Do not extend a Core trial promise to Crew or specialist offers based on copy alone; eligible CTAs can be configured after that check.

## Work sequence and verification

**A — pricing foundation:** PRICE-01 through PRICE-05. Before a visual rework, demonstrate catalogue-to-calculation parity and resolve substantive entitlement differences. Preserve the active catalogue and subscription-pinned versions; no production pricing mutation is part of this brief.

**B — recover buyer intent and measure:** FLOW-01, FLOW-02, MEASURE-01, plus the mobile header fix. These deliver value independently of the main redesign. Capture a useful baseline before switching the main experience; avoid sending real email or creating accounts in automated checks.

**C — presentation and shorter journey:** UX-01 through UX-03 and CONTENT-01. Share responsive components and calculation state between desktop/mobile; do not maintain separate pricing formula implementations. Retain backwards navigation, keyboard focus, accessible controls, locale behavior and user edits.

**D — discoverability and release validation:** DISCOVER-01 and full flow verification. Test single-location, group, franchise, Crew-only, Both and diversified-group scenarios; watch enterprise boundaries, unsupported payroll countries, unknown setup, malformed/retired links, fresh/returning state and catalogue failure. Quote/PDF/demo/share/onboarding values must agree for the same configuration and version.

Financial tests should cover band boundaries, non-retroactive marginal pricing, concept add-on inclusion, Crew dependencies and bundle substitution, employee/object overages, eligible discounts and future relief phases. Separate gross curve checks from backend net quote parity and Stripe billing verification.

Release checks: inspect repository VCS state; run the pricing repository's actual validation, unit tests, lint/build and targeted Playwright flows. Where app/marketing/backend receivers change, run their applicable contract and release checks. Report each result separately and identify any live billing or browser checks not performed. No historical PASS or local build is evidence of current production alignment.

## Source map for implementation

- `src/data/livePricing.ts`, `src/data/pricing.ts`: catalogue normalization, display metadata, version/date, allowances, grants.
- `src/lib/pricingEngine.ts`, `src/lib/crewPricing.ts`, `src/lib/watchtowerEngine.ts`, `src/hooks/usePriceCalculation.ts`: actual calculation paths and basket totals.
- `src/pages/PricingOverview.tsx`, `src/components/SiteHeader.tsx`: price-first hierarchy, offer selection and mobile header.
- `src/lib/journey.ts`, `src/pages/Simulator.tsx`, `src/components/PathwaySelector/PathwaySelector.tsx`: shorter/adaptive journey and link reader.
- `src/components/ConfigBuilder/*`, `src/components/Summary/*`, `src/lib/pdfGenerator.ts`: conditional inputs, comparison, consistent quote and export/handoff.
- `src/lib/analytics.ts`, `src/main.tsx`, `src/components/CookieConsent.tsx`: consent-aware funnel instrumentation.
- `sundae-website/src/lib/diagnostic/pricingLink.ts`: shared configuration producer.
- `sundae-app/src/lib/operator-models.ts`, `src/components/onboarding/*`, and registration/auth intent handlers: operating-model vocabulary and receiving configuration through account creation/sign-in.
- Backend published catalogue, quote services, entitlement policy and trial/provisioning services: authoritative price, eligibility and commercial behavior.

---

# Historical Pricing Audit Report

> **Historical snapshot.** This 2026-05-28 report predates the v1.7 cutover and v1.8 candidate. Its PASS result is not current release evidence.

> Generated: 2026-05-28

## Overall Status: PASS

| Metric | Count |
|--------|-------|
| Passed | 17 |
| Failed | 0 |
| Warnings | 1 |
| Total Checks | 18 |

## Warnings

- **[Hard-coded Prices]** src/data/featureComparisons.ts contains hard-coded prices
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
| PASS | Bundle Math | Savings percent is 18% (~18%) |
| PASS | Hard-coded Prices | No unexpected hard-coded dollar amounts in UI |
| WARN | Hard-coded Prices | src/data/featureComparisons.ts contains hard-coded prices |
| PASS | Entitlements | Report tier prices increase Lite < Plus < Pro |
| PASS | Entitlements | Core Lite < Core Pro base price |
| PASS | Entitlements | Report AI credits increase with tier |
| PASS | Entitlements | Report AI seats increase with tier |
| PASS | Entitlements | Client type detection boundaries correct (v4.3) |
| PASS | Entitlements | Enterprise min locations aligned across data sources |
| PASS | Entitlements | All 11 paid modules present (matches backend MODULE_PRICING) |
| PASS | Entitlements | All modules include 3 base locations (v5.1) |

## How to Run

```bash
# Standard audit
npm run pricing:audit

# Full audit with release notes
npm run pricing:audit:full
```
