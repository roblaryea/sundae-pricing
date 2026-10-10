# Pricing mobile and payroll-country follow-up — 2026-10-10

## Country coverage

The live production selector contains 43 ISO country choices: 36 covered country codes and seven choices marked availability to confirm (AU, IN, JP, MY, NZ, SG, ZA). The 39-market description counts England, Scotland, Wales and Northern Ireland separately; the pricing handoff correctly represents them under GB / United Kingdom. The backend coverage matrix and app country-pack documentation agree on GCC + US + Canada + UK + EU-27. No covered ISO country code was missing. Country options now sort by localized names, with covered markets first, while retaining the existing ISO handoff codes and confirmation labels.

## Price hierarchy and mobile refinements

The overview bottom bar had intentionally emphasized the total following an earlier reviewer preference. The latest buyer instruction takes precedence: the location average is now larger than the total on desktop and mobile, with the total in a secondary right-aligned column. The combined-plan summary now follows the same hierarchy. The multi-location plan cards, refinement/review summaries and branded print document also emphasize the average. One-location estimates retain the monthly amount without a redundant average; enterprise/invalid selections retain their eligibility notices.

Mobile location buttons and the language selector now have 44px targets. The theme switch has a larger pointer area. Plan/country/employee inputs use 16px text to avoid iPhone input zoom. Simulator Back/Continue actions remain sticky and respect the safe-area inset. The existing mobile plan selector, full selected-card description, collapsed comparison and optional upgrades are retained.

## Verification

- Actual isolated production clicks: 43 country choices, 36 covered choices, GB selection and Crew Operating / 8 locations / 200 employees review; no horizontal overflow at 375px. No leads or purchases submitted.
- Local browser regressions: 19 tests passed, including 320/375/390/1440px, before/after scrolling, average greater than total, 25 locales, all country codes, GB handoff to review, Crew eligibility, Watchtower, saved-state reset and axe on mobile/desktop.
- Lint passed; 46 unit-test files / 1,377 tests passed; TypeScript/Vite build passed with locale, handoff parity and pricebook gates.
- The original old E2E fixture lacked the server clock and policy fields required by current strict catalogue validation. The two exercised suites now use a trimmed snapshot of the public effective production catalogue captured on 2026-10-10. This is test data only; buyer prices still use the live authoritative feed.
- This is responsive browser verification, not physical iPhone/Safari or VoiceOver certification.

Final production screenshots and raw logs are retained at `/tmp/sundae-mobile-review-20261010/`.
