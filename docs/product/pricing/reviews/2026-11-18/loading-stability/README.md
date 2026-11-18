# Pricing loading stability — F11 review cut

Application source: **`d74a09f29c77a876ba35d68cd925468b8fee0d74`**, branch `codex/pricing-loading-stability-20261118`, isolated from published pricing **`b3410c3ac2c0bd4f577e04eec8e3ced86409a6b0`**. Prepared for the existing owner's independent review; **not merged or published**. No main-site, app or marketing worktree was edited.

## Confirmed producer and bounded correction

The required-catalogue gate used a short loading card. At 412×823 the footer sat at **y=556** during loading and moved to **y=1774.44** when the form became available, contributing **CLS 0.324422843**. Route Suspense also removed the entire navigation/layout while chunks loaded, and the generated static discovery page was replaced by different markup. The UI font stylesheet was discovered through an external Google CSS `@import` chain.

This cut keeps React navigation/footer mounted across route loading, uses a responsive structural loading form without calculating or exposing a quote, and shares the same hero between pending and validated pages. The generated localized documents now render that actual loading tree with the actual header/footer; existing Core/Crew discovery copy remains in a no-JavaScript section. Locale metadata, canonical/hreflang, schema, sitemap, genuine 404 and simulator noindex behavior are retained. The static shell respects the existing pre-paint light/dark class using both exact approved PNGs; client branding and theme handlers are unchanged.

The existing validated catalogue request starts before lazy routes and React effects. A fast failure stays blocked until the existing retry/refresh path runs; mounting a subscriber does not silently retry it. Skeletons are inert/hidden from assistive technology while a localized status remains available. Actual quotes and child effects remain behind the authoritative gate. No guessed page min-height or hidden footer is introduced. The footer naturally remains below the initial viewport; its below-fold position can still advance as validated details are added. This is first-viewport stability, not a claim that all page pixels retain their position during loading or scrolling.

Unmodified WOFF2 subsets of the existing Hanken Grotesk/Fraunces faces are self-hosted, with the same Unicode coverage and requested weight ranges. The two Latin faces are preloaded. [Original URLs, hashes and byte provenance](font-provenance.json) are included; the existing OFL licenses remain in `public/fonts`. This changes delivery, not the typeface or approved wordmark.

## Matched lab result

Three sequential before/after pairs, same local gzip server, same URL/API proxy, Lighthouse **13.6.0**, mobile 412×823 and simulated network/CPU settings. Every run uses a distinct empty Chrome profile; storage reset is disabled because the profiles are already fresh. No concurrent owner Lighthouse run overlapped. All six final runs have **no warnings or runtime error**. Unrelated host load was high and is retained in the raw/config receipts, qualifying absolute timing. The local build forces the same required live-catalogue path for loopback; it does not bypass catalogue validation or use a price fixture. Optional sibling roots were absent for the standalone build.

| Median | Published-source build | Candidate |
|---|---:|---:|
| CLS | 0.324422843 | 0.000 |
| First contentful paint | 2.054s | 0.931s |
| LCP | 6.029s | 5.681s |
| Total blocking time | 41ms | 61ms |
| Performance score | 60 | 79 |

CLS is **0.324422843 in every before run and 0 in every after run**. After first paint is 0.917–0.933s. **LCP remains 5.454–5.736s**; the final candidate audit identifies consent-banner text. The useful heading is already present in the static shell. Existing consent UI/behavior is unchanged. This cut does **not** close the broader LCP/performance item or establish field/CrUX improvement; only the matched layout-stability and first-paint findings are supported.

[All metrics/configs/candidates](performance/summary.json) · [build hashes and environment](performance/build-manifest.json) · [owner production diagnostic with its two cache-clear warnings](performance/production-diagnostic.json). Production baseline numbers are diagnostic context, not the comparison denominator.

| Raw immutable report (gzip JSON) | Before | After |
|---|---|---|
| Pair1 | [before](performance/lighthouse-before-1.json.gz) | [after](performance/lighthouse-after-1.json.gz) |
| Pair2 | [before](performance/lighthouse-before-2.json.gz) | [after](performance/lighthouse-after-2.json.gz) |
| Pair3 | [before](performance/lighthouse-before-3.json.gz) | [after](performance/lighthouse-after-3.json.gz) |

The harness and paired-run script are included under `performance/`; they are local evidence tools, not deployed application code. Raw reports can be inspected with Python gzip/json tools. The local absolute paths in the harness reflect this run and must be adjusted to reproduce elsewhere.

## Visual and geometry evidence

- [Published loading card/footer in view,412 dark](evidence/before-dark-412-pending.png) → [candidate loading form,412 dark](evidence/after-dark-412-pending.png) → [validated page](evidence/after-dark-412-ready.png).
- [Candidate before any app JavaScript,412 dark](evidence/after-dark-412-static.png); [light](evidence/after-light-412-static.png). Heading geometry is identical before JavaScript, during catalogue loading and after validation: **x16,y184.5,width380,height64.78**.
- [Light loading](evidence/after-light-412-pending.png), [light validated](evidence/after-light-412-ready.png), and [actual footer still visible in flow](evidence/after-light-412-footer.png).
- [Desktop light static shell](evidence/after-light-1440-static.png) → [validated desktop](evidence/after-light-1440-ready.png).
- [Arabic390 static shell](evidence/after-dark-390-ar-static.png) → [validated Arabic](evidence/after-dark-390-ar-ready.png).
- [320px delayed loading](evidence/pending-320.png) → [validated](evidence/ready-320.png).

[Raw visual readbacks](visual-receipt.json) record the initial/pending/ready heading and footer positions, computed footer visibility, decoded approved PNG sizes, exact **$1,195/month** one-location Foundation quote, RTL and no overflow. Every candidate visual case recorded CLS 0. Static/interactive primary assets still decode 480×120 and render 144×36 with the correct dark/white original.

## Regression boundary

Existing accepted **1,458 unit tests / 41 pricing journeys** are the carried baseline. This successor adds **six focused browser checks** for slow prices at 320/412/1440, request start while a page chunk is held, failure blocking/retry, and delayed Arabic shared-intent retention. These pass. **22 catalogue/journey unit checks** and **three existing failure/retry/PDF handoff journeys** also pass, along with lint, translation QA, TypeScript, catalogue validation, standalone build, and static-shell/meta/discovery checks for all 50 localized documents. No claim is made that an interrupted broad browser invocation completed.

No pricing arithmetic, entitlements, allowances, implementation policy, ROI formulas, PDF code, approved brand asset bytes, preference storage, navigation destinations, quote intent or UTM logic changed. The source adds only the loading/static shell, request timing/failure guard, font delivery and focused coverage. Publication remains with the existing SEO owner after independent acceptance.
