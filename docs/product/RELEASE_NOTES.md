# Release Notes

## Local update — 2026-10-08 (unreleased)

Pricing now leads with location count and Core/Crew/Both, then follows a three-screen choose/refine/review journey. Core comparison and Crew presets are easier to scan; business-model extensions require explicit selection; ROI follows the estimate as an optional planning tool. Warm Sundae typography, cream surfaces and coral actions support desktop, mobile and light mode.

The catalogue adapter consumes the active response shape, concepts follow location bands, Crew collects unique headcount and payroll country, and Performance does not charge again for included Foresight. One basket carries pricing and payment timing into an English PDF and validated v2 links for share/demo/onboarding. Initial HTML includes a published Core/Crew snapshot and catalogue provenance.

Local verification: pricing unit suite (1,343 tests), Chromium buyer flows (32 scenarios), pricing lint/build/translation QA/handoff parity/pricebook validation passed. Website build/typecheck and targeted handoff checks passed. App source typecheck/targeted lint/auth tests passed; full app preflight stopped on stale support-article translations. Changes are modified-uncommitted or untracked; no deployment, pricing activation or Stripe mutation occurred. Full commercial and VCS boundaries are recorded in `pricing/PRICING_AUDIT_REPORT.md`.

---

> Generated on 2026-09-17

## Highlights

- **feat: v4.3 pricing model update** ([#1](https://github.com/roblaryea/sundae-pricing/pull/1))
- **feat: update pricing engine and data to v5.1** ([#2](https://github.com/roblaryea/sundae-pricing/pull/2))
- **feat: v5.1 copy alignment, emoji cleanup & CTA fixes** ([#3](https://github.com/roblaryea/sundae-pricing/pull/3))

## New

- feat: v4.3 pricing model update ([#1](https://github.com/roblaryea/sundae-pricing/pull/1)) — 2026-02-18
- feat: update pricing engine and data to v5.1 ([#2](https://github.com/roblaryea/sundae-pricing/pull/2)) — 2026-02-26
- feat: v5.1 copy alignment, emoji cleanup & CTA fixes ([#3](https://github.com/roblaryea/sundae-pricing/pull/3)) — 2026-02-26
- feat: Cross-Intelligence Correlation Engine pricing ([#6](https://github.com/roblaryea/sundae-pricing/pull/6)) — 2026-02-27
- feat: Surface Cross-Intelligence pricing across site ([#7](https://github.com/roblaryea/sundae-pricing/pull/7)) — 2026-02-27
- feat(simulator): sticky Back on every step + per-location savings column ([#12](https://github.com/roblaryea/sundae-pricing/pull/12)) — 2026-06-30
- feat(brand): smooth cream→clay logo gradient (retire banded strata) ([#19](https://github.com/roblaryea/sundae-pricing/pull/19)) — 2026-07-10
- feat(tiers): present Margin and Growth as a fork, and drop claims vendors disprove ([#34](https://github.com/roblaryea/sundae-pricing/pull/34)) — 2026-08-12
- feat(roi): decay recovery with estate maturity, and add Gulf/Europe/workforce rivals ([#36](https://github.com/roblaryea/sundae-pricing/pull/36)) — 2026-08-13
- feat(pricing): v1.8 bands, anchor relief model, and release guardrails ([#38](https://github.com/roblaryea/sundae-pricing/pull/38)) — 2026-08-22

## Improvements

- Feat/cross intel pricing visibility ([#9](https://github.com/roblaryea/sundae-pricing/pull/9)) — 2026-03-02
- Coral-S logo lockup + favicon; 'kingdom' → 'portfolio' copy ([#14](https://github.com/roblaryea/sundae-pricing/pull/14)) — 2026-07-03
- Pricing: coral-S favicon.ico + re-trigger production deploy ([#15](https://github.com/roblaryea/sundae-pricing/pull/15)) — 2026-07-03
- De-blue deprecated pricing assets + new PDF wordmark ([#16](https://github.com/roblaryea/sundae-pricing/pull/16)) — 2026-07-03
- chore(brand): archive deprecated blue-orb + old wordmark assets ([#20](https://github.com/roblaryea/sundae-pricing/pull/20)) — 2026-07-11

## Fixes

- fix: resolve icon string rendering & update stale v4.3 prices ([#4](https://github.com/roblaryea/sundae-pricing/pull/4)) — 2026-02-26
- fix: update Start Free Trial URL to sundae.io/sign-in ([#5](https://github.com/roblaryea/sundae-pricing/pull/5)) — 2026-02-26
- fix: align seat caps and QA validation to v5.1 pricing spec ([#8](https://github.com/roblaryea/sundae-pricing/pull/8)) — 2026-02-27
- fix: category-specific FAQs per product tab ([#10](https://github.com/roblaryea/sundae-pricing/pull/10)) — 2026-03-03
- fix: correct Cross-Intelligence Pro price in FAQ ([#11](https://github.com/roblaryea/sundae-pricing/pull/11)) — 2026-03-03
- fix(simulator): sticky step bar below header + scroll-to-top per step ([#13](https://github.com/roblaryea/sundae-pricing/pull/13)) — 2026-06-30
- fix(i18n): centralize UI micro-copy to tMicro across all 22 locales ([#17](https://github.com/roblaryea/sundae-pricing/pull/17)) — 2026-07-05
- fix(pricing): align header + footer chrome with the marketing site ([#18](https://github.com/roblaryea/sundae-pricing/pull/18)) — 2026-07-05
- fix(simulator): repair the locale packs that crashed the simulator in 18 locales ([#21](https://github.com/roblaryea/sundae-pricing/pull/21)) — 2026-08-10
- fix(simulator): localize the Avg label and make the copy resolver field-safe ([#22](https://github.com/roblaryea/sundae-pricing/pull/22)) — 2026-08-10
- fix(simulator): correct AI credits, and model operating model + tech stack ([#23](https://github.com/roblaryea/sundae-pricing/pull/23)) — 2026-08-11
- fix(simulator): repair the three mobile P0s ([#24](https://github.com/roblaryea/sundae-pricing/pull/24)) — 2026-08-11
- fix(simulator): substantiate the competitor claim, correct the discount rule ([#25](https://github.com/roblaryea/sundae-pricing/pull/25)) — 2026-08-11
- fix(crew): price Crew on its published marginal bands, not a flat anchor ([#26](https://github.com/roblaryea/sundae-pricing/pull/26)) — 2026-08-12
- fix(pdf): stop the exported quote making claims the screen does not ([#35](https://github.com/roblaryea/sundae-pricing/pull/35)) — 2026-08-13
- fix(pricing): nav parity with the marketing site ([#37](https://github.com/roblaryea/sundae-pricing/pull/37)) — 2026-08-19
- fix(pricing): outage copy a visitor can act on, in all 22 locales ([#39](https://github.com/roblaryea/sundae-pricing/pull/39)) — 2026-08-22
- fix(pricing): net-after-Core colour follows the sign ([#40](https://github.com/roblaryea/sundae-pricing/pull/40)) — 2026-08-22
- fix(pricing): balanced line breaks and aligned layer cards ([#41](https://github.com/roblaryea/sundae-pricing/pull/41)) — 2026-08-22
- fix(observability): isolate production pricing telemetry ([#42](https://github.com/roblaryea/sundae-pricing/pull/42)) — 2026-09-05

---

*35 PRs included in this release.*
