# Pricing buyer clarity — finite review cut, 18 November 2026

Owner: the existing pricing chat (`01a132ae-a999-76d1-b50b-f3c8d24b95d1`).
Branch: `codex/pricing-buyer-clarity-20261118`.
Base: production navigation release `f8363faea16272161921e64356256f864432f9d9`.
Status: implemented and locally verified; **not accepted, merged or published**. Existing SEO delivery chat coordinates independent source/visual review. No new coding sessions or workers. Main-site files were not changed.

## Verified preimage and correction

| Finding | Current production symptom verified | This cut | Remaining boundary |
|---|---|---|---|
| F10 | 320×640: estimate bar 134 px, y=498–632; consent y=513–640, directly overlapping. | Compact estimate bar 66 px; one Review action on phone/tablet; Refine remains in flow. Consent makes estimate actions static and reserves its measured height. Header-aware scroll padding keeps the selected card title and first inclusion visible after scrolling it into view. Simulator step actions are in flow on small screens. | This does not claim the entire initial pricing form and first inclusion fit above the fold at 320×640. The unchanged shared navigation occupies 142 px. It resolves obstruction, not the separate F11 performance/layout-shift audit. |
| F12 | Live root/simulator share the old title/canonical. `/sitemap.xml`, `/llms.txt`, and an invented path all return 200 HTML. | 25 localized overview documents with canonical/hreflang/social metadata and WebPage schema; XML sitemap; plain-text llms; simulator noindex/follow; finite route rewrites and genuine static 404. | Exact HTTP status/content-type/query-rewrite checks require this cut's Vercel preview. Production unchanged until accepted release. |
| F13 | Current main-site provider reads/writes only origin-local `sundae-theme`; pricing does the same. | Pricing reads/writes a shared explicit theme cookie and synchronizes on focus/pageshow/storage. Dark-first preserved per Robert's preference. | **Not end-to-end complete:** main owner must adopt companion, then verify www light → pricing light → www light on deployed hosts. |
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
- [Companion patch](main-theme-companion.patch) applies cleanly against the main owner's checkout and was authored against `a7127e52:src/components/ui/ThemeProvider.tsx`. **It is a reviewable handoff, not an applied or runtime-qualified main-site fix.** Main owner retains that file and its integration/tests.

## Validation and observed results

- 1,448 tests in 51 unit test files pass, including shared-cookie precedence/blocked-storage checks and metadata/payment-label coverage for all 25 locales.
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

Publication gate: exact immutable source/visual acceptance from the existing reviewer and passing checks. Full F13 closure additionally needs the separately owned main companion and deployed cross-site retake. Do not treat this source cut as production evidence.
