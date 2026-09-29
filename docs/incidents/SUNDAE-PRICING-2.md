# SUNDAE-PRICING-2 investigation

Incident: INC-20260811-8165AADF. Task: f3c055f3.
Sentry: https://sundaeio.sentry.io/issues/7664803384/

## Evidence and limits

The supplied record reports one `ReferenceError: layer is not defined` event on
`/simulator`, first and last seen at 2026-08-11 00:47:35 UTC. It contains no
stack frames, release, environment, browser details, or breadcrumbs. An
unauthenticated read of the Sentry issue API returned HTTP 401 on 2026-09-29;
no authenticated Sentry connector or event logs were available in this task.

GitHub deployment records provide this correlation (not proof of attribution):

| Commit | Environment | Successful status time (UTC) |
| --- | --- | --- |
| `4c22de6` | Production | 2026-08-10 22:35:34 |
| `cccb088` | Preview | 2026-08-11 00:47:28 |

The preview succeeded seven seconds before the recorded event. Production
commit `db41ad0` was registered at 00:52:05, after the event. Both `4c22de6`
and `cccb088` already bind `layer` in Simulator. An isolated source snapshot of
`cccb088` passed its application TypeScript check. Current integration branch
`main` at `3493991` also binds `layer`. No missing binding was established,
and the deployment timeline cannot establish which bundle generated the event.
Do not infer that this incident was repaired by those releases or is resolved.

## Prepared change

Add a real-browser regression suite for initial `/simulator` rendering and
reactive pathway updates for Core, Crew, and Core + Crew. Require rendered
content and capture both uncaught page errors and console errors, because
React's error boundary can swallow an exception before `pageerror` sees it.
The suite captures initial and pathway screenshots in Playwright test results.
No application behavior or production configuration changes are proposed.

## Revalidation and approval boundary

From current `origin/main`, apply the PR commit, install dependencies, then run:

```sh
npx tsc -b --pretty false
npx eslint e2e/simulator-runtime.spec.ts
npm test
npx playwright install chromium
npx playwright test e2e/simulator-runtime.spec.ts --workers=1 --reporter=list
```

When dependencies or browser caches point outside an isolated workspace, use
local dependency copies and `PLAYWRIGHT_BROWSERS_PATH` inside that workspace.

Review this as regression coverage and an investigation, not a confirmed runtime
fix. An internal operator with Sentry access must retrieve the event's stack,
release, environment, request URL, and breadcrumbs; match the release to the
above deployment records and reproduce that exact bundle/interaction locally.
No customer fact is required at this stage. Production and recurrence monitoring
remain unverified. Merge and any later deployment require separate approval;
this task only prepares a draft PR and never merges or deploys it.

## Validation on the task branch

- Application and tooling TypeScript builds passed.
- ESLint passed for the new browser suite.
- All 1,339 unit tests across 40 files passed.
- All three new Chromium scenarios passed with no captured runtime errors.
- Chromium required an approved sandbox escalation for macOS browser startup;
  dependencies and downloaded browsers were kept inside this worktree.
- Screenshots are under `test-results/simulator-runtime-*/`: `initial.png`
  captures the unchanged integration behavior; `pathway.png` captures the
  pathway after its update. There is no historical crash screenshot or
  before/after runtime repair: the reported failure was not reproduced and
  no application code was changed.
