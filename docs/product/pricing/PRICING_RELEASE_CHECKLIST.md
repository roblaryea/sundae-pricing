# Pricing production closeout — 2026-10-09

Internal release evidence. Catalogue identifiers and this document must not appear in buyer exports.

The existing pricing site remains the entry point: choose a plan, refine relevant needs, review an estimate. The release preserves Sundae typography, espresso panels, prominent average/location/month, the right-aligned monthly total, a total-first mobile bar, automatic required business extensions, pooled employee allowances and 25 pricing locales.

## Coordinated release

| Component | Production release | Buyer code / production merge |
| --- | --- | --- |
| Pricing site | [#47](https://github.com/roblaryea/sundae-pricing/pull/47), [production domain](https://pricing.sundae.io/) | Buyer code `69a21897`; later documentation changes do not change the UI |
| Admin, catalogue adapter and account handoff | [#1841](https://github.com/Sundae-io/sundae-app/pull/1841), merged and production Ready | `a2c0e41266314d8d80afe13e7f3a0f648e61e6f4` |
| Catalogue policy and quote corrections | [#1958](https://github.com/Sundae-io/sundae-stable/pull/1958), merged and deployed | `5ff038e09cff235c482aaeab9a565ff81b9b7a36` |
| PostgreSQL numeric contract correction | [#1959](https://github.com/Sundae-io/sundae-stable/pull/1959), merged and deployed | `4a6e8ba6d3c4ccdad077572fdc3cd4c7f20d1f78` |
| Demo handoff | [#153](https://github.com/roblaryea/sundae-website/pull/153), merged and production Ready | `7228be62dc220fab211fe72204b39a749e9291f4` |

The older develop-based app/backend review PRs are not production release sources. Their broader develop history was deliberately excluded from the main release.

## Catalogue authority and timing

The commercial-policy migration completed in production. The reviewed source `869b1bc6-478b-45b4-83d8-9a3aae91b506` was cloned and published through the normal guarded Admin lifecycle as `de526f40-6af7-48d0-8c42-8980870b0acd` (`v1.8.2-policy-20261009`). The previous version was archived. The release command verified unchanged monthly economics and normal publication/Stripe reconciliation. A comparison of the old/new public projection found no changes to prices or allowance rules across 80 existing customer-facing entries.

The chain pricing.sundae.io → app.sundaetech.ai → api.sundaetech.ai returns the effective, authoritative published version and backend UTC `resolvedAt`. The final complete-feed validator passed against the unmodified production response, including a numeric discount ceiling. Hosted estimates and deployment builds reject incomplete commercial policies or missing original credit, seat and Watchtower eligibility rules. They do not substitute local reference economics.

`PRICING_AUTO_PUBLISH=true` was enabled on the production scheduler only after confirming zero pending scheduled versions. Its runtime pricing checker was observed running every 60 seconds. Activation still requires valid policy and successful Stripe reconciliation. Effective-version cache checks and visible-page/on-focus refresh propagate newly effective catalogue pricing. The refresh interval is not a promise of instantaneous browser updates.

## Verification

- Pricing: 45 files / 1,369 tests pass; lint, TypeScript/Vite build, 25-locale QA, production companion intent parity, price validation and strict live-catalogue prerender gate pass.
- Backend: final exact-head full quality/security CI passes, including 6,705 tests (3 skipped), schema/drift, persona and worker gates, lint, typecheck and build. Five focused real-PostgreSQL commercial-policy tests cover numeric reload/serialization, null preservation, draft controls, authentication and migration rollback/reapply.
- App: production-isolated full preflight passes. Exact-head CI passes: 908 files / 5,780 tests (1 skipped), plus relevant security/PWA/docs/Lighthouse/Vercel checks. Pricing handoff copy covers 25 locales without merging unrelated app-wide locale work.
- Website: exact-head quality/security/Vercel checks pass; production deployment Ready.
- Live public quote API: 32/32 scenarios match expected recurring monthly totals within cents tolerance after deployment. Cases include Core, Crew, combined scopes, volume and commitment discounts, extensions and the corrected Watchtower Complete total of $3,562/month for Growth at three locations.
- Earlier hosted native checks covered automatic Franchise, commitment selection, invalid Starter scope, branding/alignment, copied/reopened configuration, localized country text and eight locations / 200 employees / Crew Operating: 160 included, 40 extra, $1,312/month and $164/location/month. API recurring quote tests alone do not prove employee expansion billing; the separate pooled allowance/expansion logic and buyer calculator were also reviewed and tested.

## Verification boundaries

The final preview was opened through the native browser tool. The tool then became unavailable, so the final native click/mobile/locale walkthrough could not be repeated after the catalogue gate changes. Earlier hosted checks and the regression suite remain evidence; they are not labelled a new final-head native pass.

Real VoiceOver/NVDA certification remains unverified: the earlier VoiceOver launch timed out. Hosted native print/save opening was rejected by automatic browser approval review. Localized print source/unit checks cover the supported pricing locales, but no final native PDF pass is claimed. No alternative browser surface was used to bypass either restriction.

No paid checkout, subscription purchase, contractual acceptance or real demo-lead submission was performed. Production funnel code is instrumented and consent-gated; receipt of events in an external analytics dashboard is not certified by this release record.

## Recovery

Do not edit active catalogue rows or weaken publication checks. For an incomplete feed, the pricing page must block estimates. Keep existing pinned subscriptions intact; use the existing Admin version publication/rollback lifecycle and reconcile Stripe before switching commercial authority. Production deployment state is tracked by the linked PR and hosting records.
