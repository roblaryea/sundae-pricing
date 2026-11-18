# Pricing buyer clarity — finite review cut, 18 November 2026

Owner: the existing pricing chat (`01a132ae-a999-76d1-b50b-f3c8d24b95d1`).
Branch: `codex/pricing-buyer-clarity-20261118`.
Base: production navigation release `f8363faea16272161921e64356256f864432f9d9`.
Current status: **independently accepted, merged and published** through [PR62](https://github.com/roblaryea/sundae-pricing/pull/62), production merge `140def24416bebd7fd3dcae919463b0987f4424c`, live at https://pricing.sundae.io. Accepted application source: `e596b1d8a0b9ffc67c5a4db8c713ea67582c7d2e`; accepted evidence head: `135a591f391d4d34d5c5d84f4dc336f7bbc3abeb`. **F13 is closed** by the independently verified combined public release described below. Earlier preview receipts remain historical evidence. No new coding sessions or workers. This pricing work did not modify main-site files.

## Verified preimage and correction

| Finding | Current production symptom verified | This cut | Remaining boundary |
|---|---|---|---|
| F10 | 320×640: estimate bar 134 px, y=498–632; consent y=513–640, directly overlapping. | Compact estimate bar 66 px; one Review action on phone/tablet; Refine remains in flow. Consent makes estimate actions static and reserves its measured height. Header-aware scroll padding keeps the selected card title and first inclusion visible after scrolling it into view. Simulator step actions are in flow on small screens. | This does not claim the entire initial pricing form and first inclusion fit above the fold at 320×640. The unchanged shared navigation occupies 142 px. It resolves obstruction, not the separate F11 performance/layout-shift audit. |
| F12 | Live root/simulator share the old title/canonical. `/sitemap.xml`, `/llms.txt`, and an invented path all return 200 HTML. | 25 localized overview documents with canonical/hreflang/social metadata and WebPage schema; XML sitemap; plain-text llms; simulator noindex/follow; finite route rewrites and genuine static 404. | Preview HTTP checks pass: Arabic/French roots serve localized static metadata, XML sitemap is application/xml, llms is text/plain, unknown path is 404, simulator is noindex. These responses also passed public-production readback after the accepted release. |
| F13 | Current main-site provider reads/writes only origin-local `sundae-theme`; pricing does the same. | Pricing reads/writes a shared explicit theme cookie and synchronizes on focus/pageshow/storage. Dark-first preserved per Robert's preference. | **Closed:** independent public desktop and Arabic 390 px journeys verified cross-site light/dark continuity, browser Back, language/RTL, retained three-location Core Foundation quote ($1,545/month) and no horizontal overflow. See combined-release receipt below. |
| F20 | Card/summary repeated Monthly Investment; review emphasizes average; payment amounts lack explicit period; numeric effective date; custom capabilities show standalone prices even when a bundle bills them. | Family-qualified monthly totals on cards; total-primary review/PDF with secondary average; explicit monthly/quarterly/annual/24-month payment labels; named-month UTC effective date; visible non-stacking discount explanation; selected capability list separated from applied covering bundle. Checked bundle-covered rows show the billing bundle rather than a false marginal saving. | All arithmetic, eligibility, discounts, allowances, setup policy and implementation-cost ROI assumptions are unchanged. |

Navigation and LinkedIn fixes were already present in base PR61 and were not duplicated. Header changes only measure existing height for content scroll clearance; menu routes and quote-return history remain intact.

## Exact theme contract for main owner

- Cookie: **`sundae_theme`**. Values: **`light`** or **`dark`** only.
- Production attributes: `Domain=.sundae.io; Path=/; Max-Age=31536000; SameSite=Lax; Secure` (Secure on HTTPS).
- Preview/local: host-only cookie; never set a production parent domain on Vercel/local hosts.
- Precedence on initialization and return/focus: valid shared cookie → valid existing localStorage `sundae-theme` → **dark**. No OS inference.
- On toggle: update both localStorage and cookie, then the document class.
- Read before paint as well as React initialization. Storage denial must not prevent rendering.
- No query parameter. No return-link helper change: preserve locale, `cfg`, UTMs and existing `rememberPricingStepForReturn` behavior.
- [Companion patch](main-theme-companion.patch) applies cleanly against the main owner's checkout and was authored against `a7127e52:src/components/ui/ThemeProvider.tsx`. **It was the initial reviewable handoff; the separately owned main-site implementation is now publicly verified.** Main owner retains that file and its integration/tests. See combined-release closure below.

## Validation and observed results

- 1,449 tests in 51 unit test files pass, including shared-cookie precedence/blocked-storage checks and metadata/payment-label coverage for all 25 locales.
- All 39 pricing browser tests pass, including the prior ROI assumptions, exact quote/PDF intent, custom Crew bundle behavior, and consent/bar geometry at 320, 390 and 768 px.
- Lint, translation QA, TypeScript, catalogue validation and standalone production build pass. Optional sibling roots were absent to match Vercel, rather than claiming unrelated sibling parity.
- Real live-catalogue browser journey: seven-location Core Growth + Crew Operating, 150 employees, AE, annual paid quarterly: **$4,379.10/month**, average **$625.59/location/month**, quarterly payment **$13,137.30**. Arabic mobile navigation visited actual `https://www.sundae.io/ar/resources`, then browser Back restored review step 03, the same total and average.
- Custom Crew: at three locations, removing Crew Time leaves Manage + Schedule + Pay selected and the published covering Crew Operating price **$697/month**. The explanation says why that capability removal does not necessarily reduce the bill.
- The compact-bar test scrolls the selected card into view before asserting visibility; it is not a first-paint or performance claim.

## Visual evidence

- [Production overlap, 320](evidence/before-320.png)
- [Corrected visible card and 66 px bar, 320](evidence/after-320.png)
- [Total-primary review, light desktop](evidence/review-light.png)
- [Arabic mobile quote after real main-site navigation and Back](evidence/quote-return-arabic.png)
- [Custom capability selection and covering-bundle explanation](evidence/custom-crew.png)

Publication gate satisfied: the existing reviewer accepted the exact immutable application/evidence cut and hosted checks passed before PR62 merged. The separately owned main-site release and independent public cross-site retake also closed F13. Preview captures below remain historical; public-release receipts establish deployed behavior.

## Immutable source and preview receipt

- Application/configuration source: **`99400cb6d6efba92760d52bece107b3f2f1dbd6f`** on `codex/pricing-buyer-clarity-20261118`.
- Draft review: https://github.com/roblaryea/sundae-pricing/pull/62
- Tested deployment for that exact source: https://sundae-pricing-is0y71o15-sundaes-projects-afd45f7e.vercel.app (Vercel-protected preview).
- [Sanitized HTTP receipt](http-preview-evidence.json) contains status, MIME type, canonical, language and robots readbacks without authentication data.
- Preview testing caught and corrected root-locale rewrites being shadowed by the existing index file. Explicit locale routes now precede filesystem matching, with a regression check. Arabic and French static root responses now pass before JavaScript; the Arabic simulator remains noindex/follow.
- At this initial preview stage, later document/evidence commits were packaging-only and did not establish acceptance or publication. The accepted successor and subsequent production release are recorded below.

## Reviewer-correction successor

Source: **`e596b1d8a0b9ffc67c5a4db8c713ea67582c7d2e`**. This supersedes the application/configuration source above; the earlier preview remains historical evidence only. The independent reviewer accepted this exact application source and evidence head `135a591f391d4d34d5c5d84f4dc336f7bbc3abeb`; PR62 subsequently merged and was published.

- Both `/simulator` and `/simulator/` receive the localized simulator title after hydration. Normalization is confined to metadata pathname interpretation. Arabic locale, configuration handoff, totals and attribution parameters are checked for both forms.
- The actual inline pre-paint script now uses a valid shared cookie before attempting localStorage. Five VM tests execute the shipped HTML script, including a light cookie after unrelated cookies with storage blocked, dark-cookie precedence, cookie denial, fallback storage and both stores unavailable.
- The billed bundle explanation now explicitly lists additional supplied capabilities in all 25 locales. It reads the actual billed bundle and reuses the optimizer's existing entitlement expansion, including Manage → Schedule; requested capability selections and all optimizer arithmetic remain unchanged. Custom selections show one explanation even with their selector open.
- Three-location custom Manage + Schedule + Pay remains **$697/month**; the requested list excludes Time and the supplied-capability note says **“Also included in this bundle: Crew Time.”** Re-selecting Time removes the extras note without changing the total.

Validation: **1,458 tests in 52 unit files**, **41 pricing browser tests**, lint, translation QA, TypeScript, catalogue validation and standalone production build pass. Optional sibling roots were absent for this build; no cross-repository parity claim is made. Existing ROI checks continue to cover a temporary implementation-cost assumption affecting recovery and first-year returns while preserving the quote, plus unknown/floor-only implementation fees and reset on plan changes.

Updated visual evidence: [desktop custom bundle](evidence/custom-crew-successor.png) and [Arabic mobile custom bundle](evidence/custom-crew-successor-arabic-mobile.png). The latter is 390×844, has one bundle explanation and no horizontal overflow. Both were captured against the live published catalogue through a local same-origin proxy. These captures document the reviewed pre-publication cut; the public-release receipt below records subsequent deployed verification.

Successor preview: https://sundae-pricing-5kscgg59a-sundaes-projects-afd45f7e.vercel.app (Ready, exact source above). [Sanitized successor receipt](successor-preview-evidence.json) verifies HTTP 200, Arabic simulator title, canonical and noindex for both slash forms. Browser hydration and configuration/attribution retention pass locally for the same source. Direct preview browser access requires Vercel sign-in; no deployed browser-hydration claim is made.

## Combined public release — F13 closed

The existing SEO and positioning reviewers independently closed F13 against public main-site release **`25fcaa771e460c539770c498df2c9c6b10b8a8d3`** (website PR245) and pricing production **`140def24416bebd7fd3dcae919463b0987f4424c`** (PR62). Verified journeys:

- Desktop: main light → pricing light; pricing dark → main dark. Browser Back retained the three-location Core Foundation quote at **$1,545/month**.
- Arabic at 390 px: pricing light → main `/ar` light; main `/ar` dark → pricing dark; main `/ar` light → pricing light. Arabic language, RTL and quote selections persisted, with no horizontal overflow.

Independent [public receipt](/Users/robertlaryea/Documents/Dev/.codex-worktrees/sundae-website-buyer-clarity-20261118/output/seo/reviewer-theme-public-2026-11-18.log). Reviewer captures: sibling `output/playwright/buyer-clarity-20261118/reviewer-public-*` images in the same main-site worktree. The existing SEO completion matrix carries this finite closure.

The [pricing publication receipt](/Users/robertlaryea/Documents/Dev/wt-pricing-roi-review-20261117/output/playwright/pr62-production/release-receipt.json) also records public metadata, Crew bundle, quote-handoff and deployed inline-initializer checks. Subsequent website PR246 is reported merged/live as **`cf9b2a7587db2d3b4a8e024e7c92aa9376b69575`** after independent review and 616 rendered journeys, with key corrections read back publicly. It changed no pricing files or arithmetic.

This record reconciles completed independent verification. It introduces no pricing code change, repeated test run or new approval gate. All pricing and arithmetic acceptance remains unchanged.
