# Pricing release checklist — 2026-10-09

Internal release evidence. Do not include catalogue identifiers or this document in buyer exports.

## Review scope

The existing pricing site remains the buyer entry point. The implemented flow is choose → refine → review, with 25 locales, automatically linked business extensions, catalogue-based employee charges, a clear average/location/month and full monthly total, and branded localized print documents.

| Component | Review branch / PR | Last code reviewed |
| --- | --- | --- |
| Pricing site | `codex/pricing-buyer-review-20261008` / [#47](https://github.com/roblaryea/sundae-pricing/pull/47) | `2e37de7` |
| Admin, public feed and account handoff | `codex/pricing-account-handoff-review-20261008` / [#1823](https://github.com/Sundae-io/sundae-app/pull/1823) | `3200ee862` |
| Catalogue, quote and activation | `codex/pricing-quote-parity-review-20261008` / [#1903](https://github.com/Sundae-io/sundae-stable/pull/1903) | `df4a8d35` |
| Demo handoff | `codex/pricing-demo-handoff-review-20261008` / [#153](https://github.com/roblaryea/sundae-website/pull/153) | `643b092` |

Pricing code preview: [immutable deployment](https://sundae-pricing-p0t8e4kol-sundaes-projects-afd45f7e.vercel.app/) and [stable branch preview](https://sundae-pricing-git-codex-prici-ecf6e9-sundaes-projects-afd45f7e.vercel.app/). Later pricing documentation commits do not change the buyer code.

## Completed preparation

- Pricing: 43 files / 1,359 unit tests, lint and TypeScript/Vite build passed. The build also checks 25 locale packs, companion intent parity and catalogue-backed initial HTML.
- App: exact-head public mobile and Crew a11y/performance workflows passed. The public mobile audit scored accessibility/best-practices/SEO at 100 on sign-in and offline; dev-mode performance scores are diagnostics, not production performance certification. 41 focused localization/intent/adapter tests passed. Full local preflight passed on `cd7b45425`; the later commit changes only CI startup. Changed-file done-gate typecheck/lint/wiring passed with browser checks explicitly skipped.
- Backend: exact-head full quality/security CI passed on `df4a8d35`, including 7,734 tests (3 skipped), migrations/rollback/schema parity, pricing drift, persona/queue/worker gates and build. 117 focused tests across 12 files passed on a fresh isolated PostgreSQL16 database. Typecheck, targeted lint and pre-push formatting/lockfile/topology checks passed. Full schema parity: 1,218 tables / 6 views. Reconciliation and audit calls in activation tests were stubbed; no external financial action occurred.
- Website: receiver tests/typecheck and exact-head quality/security/Vercel checks passed.
- Hosted pricing: shared Crew Operating configuration restored eight locations, 200 employees and United Arab Emirates; 160 employees included, 40 charged, $1,312/month and $164/location/month. The country renders its localized name; Russian summary/country copy was checked. Header language/homepage and footer landmark labels cover all 25 locales; social link names use their actual branded destinations. Earlier hosted checks covered required Franchise selection, commitment, invalid Starter scope, branding and price alignment.
- Both scheduled activation paths now validate commercial policy, reject failed/skipped Stripe reconciliation for authoritative versions, preserve the active version on rejection and clear process-local caches after commit.

CI evidence is recorded in the companion PR descriptions. A passing local preflight does not replace an incomplete or failed hosted run.

## Coordinated release sequence

1. Finish exact-head CI and review the four linked PRs. Deploy to the agreed test environment first. No PR merge or production promotion has been performed by this review.
2. Apply the nullable commercial-policy migration with the backend release, then release the app's Admin editor/public adapter and the two intent receivers. Confirm the active public response remains available and customer-safe before moving pricing traffic.
3. Create or clone a catalogue draft in Sundae Admin. Review setup fees, minimum-fee flags, package/Crew setup assignments, Watchtower Complete amounts/allowance, volume tiers, discount ceiling, grants, caps and payment schedules. Seeds are review defaults, not approval of a price change. Keep active versions immutable.
4. Reconcile Stripe and run authenticated quote comparisons on that draft. Check monthly, annual-quarterly, annual-upfront and two-year-upfront terms, Core/Crew/Both, employee allowance boundaries, Watchtower bundle pricing and Enterprise boundaries. Confirm actual test-mode checkout totals, subscription finalization and entitled features/trials.
5. Publish or schedule the reviewed draft through the existing Admin lifecycle. Read the ordinary active endpoint and verify effective date, policy fields, prices and terms against the published draft. Reopen the pricing page and confirm refresh, share, demo/account links and print totals agree. Check each running web process; process-local invalidation is not a fleet-wide instantaneous update guarantee.
6. If scheduled activation is desired, explicitly approve operational enablement after reviewing pending versions. Read-only inspection found `PRICING_AUTO_PUBLISH` unset on production scheduler/web/consumer services. Authoritative activation also requires successful Stripe reconciliation; do not enable the flag as a substitute for publication validation.
7. Before launch, complete a real VoiceOver/NVDA walkthrough and native print/save-PDF review in representative Latin, Arabic/RTL and complex-script locales. The attempted VoiceOver launch timed out; hosted native PDF opening was blocked by browser approval review. Source/unit coverage is not evidence those native checks passed.
8. After approved production rollout, confirm consented events reach the production funnel and establish a baseline for plan choice → review → demo/account. No production conversion result is claimed.

## Stop and recovery conditions

Keep the current catalogue active if draft validation/reconciliation fails. For a missing catalogue or unsupported policy response, the hosted pricing gate must block estimates rather than display stale amounts. Preserve already pinned subscriptions when correcting an active offer; use the existing Admin rollback/publication controls with an approved previous version and renewed reconciliation. Do not edit active rows or disable commercial checks to force a release.

No production services, catalogue rows, Stripe state or auto-publication flags were changed during these checks.
