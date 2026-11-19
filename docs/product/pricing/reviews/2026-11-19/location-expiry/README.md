# Remembered location expiry — 19 November 2026

Application source: `471cc4d12f67a94953cacefce6db0c8b83691aa0`.
Base: published selection-scope merge `ac8b2bc4d068561bb0e76ea1328267d072679407`.
Branch: `codex/pricing-location-expiry-20261119`.
Status: implemented and locally verified; exact-cut independent review/publication pending.

## Approved behavior

A deliberately entered location count stays confirmed for **24 hours of inactivity**, measured as elapsed milliseconds rather than a midnight/calendar reset. At exactly 86,400,000 ms without activity it expires. On the next landing, return or action, the overview field is blank and prices are hidden until a location count is entered again.

Visits, route changes between overview/simulator, foreground return, trusted pointer/key input and completed scrolling renew an unexpired count. Background catalogue polling, rendering and passive background time do not. There is no continuous wheel/mousemove write loop. Expiry does not interrupt a comparison while the visitor is interacting.

The browser persistence includes a private `locationsLastActiveAt` value. It is validated together with the saved configuration and explicit confirmation. Missing, malformed, non-finite, negative and future activity timestamps cannot unlock the overview. Untimestamped older saved configurations ask for the location count once, because their age cannot be established. Clear and Start over also remove confirmation/activity.

Explicit valid simulator/configuration links continue to supply their own count and start a fresh activity window, even when browser storage contains an expired different footprint. The public link format and pricing intent remain unchanged. Other quote choices are retained; this expires location confirmation, not a shared quote or account.

## First-return action safety

The first native click or Enter on Review after an idle day must not navigate using stale confirmation. Overview/header actions check current state. Merely blurring an unchanged field no longer re-confirms its old count. A location edit left pending for a day cannot re-confirm on blur, and a delayed first-entry commit cannot confirm an old draft. Normal simulator numeric normalization is preserved.

No price book, calculation engine, Core/Crew summary contract, ROI/PDF policy, UI design, theme, identity, navigation destinations or metadata contract changed.

## Finite runtime verification

All evidence below uses the existing browser test harness and published-policy fixture at the catalogue boundary. Time is controlled in the real browser; this does not claim a physical 24-hour wait or public deployment verification.

| Scenario | Verified result |
|---|---|
| Stored count age 86,399,999 ms | Count 3 retained; $1,545 Core Foundation quote visible; visit renews activity |
| Stored count age 86,400,000 ms | Blank field, no displayed total or monetary main content |
| Stored count age 86,400,001 ms | Same expired behavior |
| Untimestamped legacy count / future timestamp | Requires entry again |
| Interaction at +23 h, revisit at +25 h | Count and chosen Core Margin remain; no midnight reset; $2,140 quote retained across review/back |
| Actual automatic minute catalogue refresh | Request repeats, stored activity does not change |
| Idle time advanced a further day, simulated foreground-return event | Confirmation expires, field blank, activity null |
| First mouse/keyboard Review after 24 idle hours | Remains on overview and asks for locations, both with unchanged and unfinished edited fields |
| Clear / Start over | Count is gated and saved activity becomes null |
| Explicit shared quote over expired stored 99-location quote | Opens intended 3-location $1,545 quote immediately; fresh activity persists on return to overview |

- **78 browser checks pass**: 28 location-entry/expiry cases, 41 configured simulator journeys, 6 loading cases and 3 consent/contrast cases. Existing configured fixtures now deliberately seed a recent timestamp rather than bypassing expiry globally.
- **1,480 unit tests in 53 files pass**, including 22 location confirmation/localization tests. Unit checks cover missing and invalid activity values and the exact 24-hour boundary.
- Lint, TypeScript, translation/policy checks and standalone production build/prerender pass. Optional sibling handoff roots were absent for the standalone build. An earlier catalogue-fetch timeout was retried successfully; the included final build log is complete.
- The previous accepted Core/Crew design and branding evidence is carried; there is no new visual design or performance claim. Historical unrelated browser specs are not claimed to be universally green.

Logs: [browser](browser-checks.txt), [unit](unit-checks.txt), [build](build-checks.txt), [lint](lint-checks.txt).
