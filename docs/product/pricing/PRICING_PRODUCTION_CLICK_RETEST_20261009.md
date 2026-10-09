# Production pricing click retest — 2026-10-09

Internal QA evidence; not buyer-facing content.

The isolated Chromium browser exercised **https://pricing.sundae.io/** with real production catalogue responses and fresh browser contexts. The user explicitly authorized this browser after native controls became unavailable. No response mocking, synthetic storage initialization, purchases, contracts, sign-in submissions or demo-lead submissions were used.

## Outcome

**30 final checks passed; 0 failed.** The first full website-to-app click exposed one real issue: the marketing sign-in page dropped the onboarding return URL when the buyer continued to the app. [Website PR154](https://github.com/roblaryea/sundae-website/pull/154) fixes the sign-in and sign-up links and rejects unsafe destinations. It is merged at `00318da115e49b3877f69c73d2b418d29cae4a08`; the Git-integrated production deployment is Ready.

After deployment, a fresh browser clicked from the reviewed pricing estimate through the website sign-in page to the real app sign-in screen. The reviewed Core Margin / three-location configuration survived in the app return URL and in the app's validated onboarding session storage. No authentication was submitted.

Earlier exploratory failures were incorrect test assumptions (case-sensitive copy, a removed extension control, controls on a different step, rendering before a review link existed, and the app's “Welcome back” heading). They were corrected and rerun. The final evidence includes only the passing final runs; the handoff defect above was fixed in product code.

## Verified buyer paths

- All four Core packages at three locations: Foundation $1,545; Margin $2,140; Growth $2,445; Performance $3,798 per month.
- Franchise selection automatically includes and locks the required paid extension; removing the business model removes it. The three-location Foundation + Franchise estimate is $2,290. Mixed Hotel F&B / Cloud Kitchen scope survives review and backward edits.
- Watchtower explains Growth/Performance eligibility on Margin. Growth at three locations plus Watchtower Complete totals $3,562.
- Crew Starter at 120 locations has no price and cannot be selected; eligible cards disclose the 5% volume saving.
- Crew Operating / eight locations / 200 unique employees: 160 included, 40 extra, $120 extra, $1,312/month, $164/location/month. Payroll country is a dropdown with no XX/ZZ choices.
- Core + Crew displays one plan rail at a time. Margin + Crew Operating / three locations / annual upfront yields $2,496.56 monthly equivalent and $29,958.72 subscription payment.
- Saved selections are disclosed and restored. Start over resets scope and package. Copied configurations reopen correctly in a fresh context. Core-only demo/account handoffs omit previously entered employee and payroll country data.
- Very large workforce estimates route to sales, without a misleading million-dollar self-service price. Setup guides follow selected scope. Calculation disclosures use the available desktop width and expose the applicable bands.
- Mobile 375px at eight and 120 locations: no page-wide horizontal overflow; plan and comparison selectors work; the sticky bar's total is larger than its average; average label and amount have zero geometric overlap.
- The language selector contains 25 choices. Each locale's location question is localized. Azerbaijani, Russian, Papiamento and Arabic were walked through refinement and review; Arabic remains RTL without overflow.
- Header Review estimate uses the existing quote. Tooltips work with click and Escape and preserve trigger focus. Demo and account destinations receive the configuration. The demo receiver visibly displays the package and location scope.
- Actual rendered fonts include Fraunces and Hanken Grotesk. Desktop review retains espresso panels, the prominent average, the right-aligned monthly total, and Sundae branding.

## Catalogue evidence

The pricing browser captured 29 successful real responses using one authoritative active catalogue: `de526f40-6af7-48d0-8c42-8980870b0acd`. The feed includes backend UTC `resolvedAt` and the effective date. This retest verifies rendered outcomes against that live feed; the earlier release checks separately verify the source adapters, mathematical contract and scheduled activation. A click retest alone is not a universal proof that future catalogue edits are correct.


## Follow-up native PDF, VoiceOver and contrast checks

The live print/save action was exercised after the full-bleed repair on production. English and Arabic each produced a one-page, print-ready PDF with the expected language metadata. The rendered A4 corner pixels are the warm document colour (`#F6F1E8`) on all four corners, with no white print-area margins. The Sundae wordmark, espresso investment panel, average/location/month emphasis and localized Arabic layout remain intact. The exported PDFs and rendered pages are retained with this report.

VoiceOver was enabled through macOS, the production simulator was loaded in Chrome, and keyboard navigation was attempted with the VoiceOver cursor while the VoiceOver Utility was available. VoiceOver was then disabled cleanly. This host did not provide a stable spoken-phrase capture or an independently reviewable VoiceOver cursor transcript, so this is a native launch and interaction smoke check rather than VoiceOver certification. The automated accessibility scan remains supplementary; it reported zero violations and left 25 contrast nodes for manual review.

Manual contrast review covered the main dark and light theme tokens and rendered controls. Representative WCAG ratios are: dark muted text on espresso 7.19:1, light muted text on warm cream 5.66:1, coral primary action on espresso 6.16:1, white display text on espresso 17.74:1, ink on cream 16.22:1, and feature-help text on cream 5.05:1. Each clears the 4.5:1 normal-text threshold. The manual review used the live production CSS and screenshots; it does not replace a full per-node contrast audit for every localized string and state.

## Accessibility and excluded actions

The automated review scan reports 24 passing rules and zero detected violations, with color contrast requiring manual review on 25 nodes. The scanner's cross-origin stylesheet inspection produced one CSP console message; ordinary buyer navigation had no runtime errors, and a separate check confirmed both brand fonts loaded. CSP was not weakened for the scanner.

This is not VoiceOver/NVDA certification. Native print/save opening remains excluded after the earlier automatic approval rejection; localized PDF generation/source tests from the release remain separate evidence. No final native PDF or screen-reader pass is claimed. External analytics dashboard event receipt is not covered.

## Artifacts

- [Machine-readable final evidence](production-click-retest-20261009.json)
- [Desktop buyer review](screenshots/production-retest-desktop.png)
- [375px mobile sticky bar](screenshots/production-retest-mobile.png)
- [English full-bleed PDF](sundae-estimate-en-fullbleed.pdf)
- [Arabic full-bleed PDF](sundae-estimate-ar-fullbleed.pdf)
- [English PDF render](screenshots/production-pdf-en-fullbleed.png)
- [Arabic PDF render](screenshots/production-pdf-ar-fullbleed.png)

The isolated test scripts, raw browser logs, catalogue response and additional screenshots are retained at `/tmp/sundae-production-click-retest-20261009/`. The report and selected evidence are committed separately from the website product fix.
