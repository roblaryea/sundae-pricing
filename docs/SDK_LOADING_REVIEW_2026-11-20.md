# Pricing SDK loading — 20 November 2026

Base: `74e27c48cf87056796db5a2cba4ffab6b3f3fc28`. This bounded cut defers optional PostHog and Sentry downloads until the existing analytics-consent path. The first quote no longer depends on those libraries. Event names, URL sanitization, Sentry sampling/environment/replay policy, catalogue, quote arithmetic, configuration links and visual design are preserved.

The SDK implementation is extracted into `analyticsRuntime.ts`. The small `analytics.ts` facade shares one pending import, retains only actions initiated after consent, checks consent again before initialization/delivery, and contains optional loading failure without a page reload. An immediate post-consent action retains a snapshot of its primitive properties. ErrorBoundary sends the same error and component stack through that facade. The SDK chunk rule precedes the React vendor rule so the Sentry React integration is not eagerly imported with React itself.

## Verification

- Full applicable prebuild, TypeScript/Vite production build and discovery prerender pass in the canonical isolated checkout. Lint passes.
- 1,486 unit tests across 54 files pass, including asynchronous initialization, fast consented actions, withdrawal while loading, optional load failure, missing service configuration and preserved exception context.
- 37 existing loading, consent-contrast and location-gate browser checks pass.
- Three final built-browser cases pass: a real three-location quote reaches `$1,545/mo` while optional SDK loading is held; its fast review event subsequently reaches an intercepted local transport; a failed optional runtime still permits the same quote; Arabic mobile/light retains RTL, the correct total and no overflow. No lead, onboarding, booking or external email is submitted.
- The final SDK transport case uses an explicit standard Chrome user agent and a synthetic non-project key; all PostHog requests are intercepted and fulfilled locally. It proves SDK request/capture behavior, not delivery into the production PostHog project. Earlier unsupported test-runtime imports, a wrong button selector and an incomplete default-headless transport attempt are retained as failed/incomplete test receipts; they are not represented as passes or product defects.

## Matched laboratory performance

Three alternating before/after pairs use Lighthouse 13.6 mobile simulation, gzip static serving, fresh browser profiles and the same exact snapshot of the public active catalogue. No analytics consent is given. All six reports have no warnings and zero CLS.

| Median | Before | Revised |
| --- | ---: | ---: |
| Script transfer | 651,366 bytes | 506,833 bytes |
| LCP | 5,891.9 ms | 5,207.1 ms |
| First contentful paint | 936.1 ms | 945.1 ms |
| Performance score | 79 | 81 |

Initial script transfer falls 22.2%; median lab LCP improves 11.6%. This is a bounded improvement, not closure of broader performance work, a field/CrUX result or evidence of ranking/conversion uplift. The remaining all-language payload is not refactored in this cut. Source review, hosted checks and an actual production retake are required before calling the change live.

## Cross-repository boundary retained

The first build in an ambient `/tmp` layout correctly failed the unchanged handoff gate. `/tmp/sundae-app` resolves to the separate messaging checkout, whose tracked `src/lib/pricingIntent.ts` from app source `5e006aa7bd51e358567f3a1748ab71ec120660bf` adds a Crew Lite greater-than-five-location rejection absent from pricing main and website main. The exact observed difference is retained; cross-repo app parity is not claimed.

No handoff contract, copy or gate source changes in this cut. The canonical isolated layout exercises the gate's existing in-repository copy check, with absent siblings explicitly reported as skipped. A separate invocation with `SUNDAE_WEBSITE_HANDOFF_ROOT=/tmp/sundae-search-health-20261119-root` passes against the actual selected website source. No substitute app source was generated to obtain a pass, and the app mismatch is not folded into SDK work.

Detailed local evidence is retained by the website/SEO owner under `/tmp/sundae-search-health-20261119-root/output/seo/followthrough-*20261120*`. Build, lint and unit/browser logs are `/tmp/sundae-pricing-deferred-*20261120.log`; the initial failure remains `/tmp/sundae-pricing-deferred-build-20261120.log`. The final canonical source checkout is `/tmp/sundae-pricing-followthrough-20261120/sundae-pricing`.
