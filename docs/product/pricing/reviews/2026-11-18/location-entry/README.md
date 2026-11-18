# Main pricing location entry — 18 November 2026

Application source: `7aa69ee5bb54fe85d99e294609983e28a3e1539f`.
Base: published PR64, `7c447855104ded38f071b2c833549dd5e54be721`.
Branch: `codex/pricing-location-gate-20261118`.
Status: implemented and locally verified; independent acceptance and publication pending.

## Visitor behavior

- The main overview starts with an empty, required location field. Core, Crew and combined browsing, features and plan selection remain available. Monetary values on cards, Crew capability rows, setup disclosure, calculation details and the estimate bar appear only after a valid footprint.
- Existing cards, fonts, palette, header and layout are retained. The existing price area contains a localized prompt that focuses the existing location field. The existing Refine and Review actions do the same until a count is supplied; no modal or new step is introduced.
- Whole numbers from 1 through 10,000 are valid. The first typed value settles for 300 ms; Enter or blur applies immediately. This avoids a transient one-location headline during ordinary multi-digit typing. Subsequent valid edits update normally. Blank, zero, negative, fractional and above-limit entries hide prices instead of revealing the internal default.
- The first plus click chooses one. Clearing and Start over reopen the requirement. Returning visitors with a confirmed count retain pricing, including deliberate one-location choices.
- Legacy saved multi-location configurations are retained after validation. A legacy automatic one-location default without explicit confirmation asks for the location count again. Invalid stored configurations cannot unlock a fallback price. Explicit clearing persists across reloads.
- Valid shared simulator links still open the quote immediately, including locale and attribution behavior. The simulator keeps its existing numeric normalization. The configuration-link schema, quote engine, catalogue, entitlements, overage, discounts, implementation policy, ROI and PDF arithmetic are unchanged.
- First-price and configuration analytics wait for the entered footprint on the overview. All 25 locales have a direct prompt. This improves pricing context; it does not prevent automated extraction of public prices.

## Validation

- **1,471 unit tests** in 53 files pass, including 13 new persistence/localization cases.
- **67 browser checks** pass: 17 fresh-entry cases, 41 configured buyer journeys, 6 loading cases and 3 consent/contrast cases. Existing configured-visitor fixtures explicitly confirm their intended one-location scenario; fresh visitors are covered independently without a global bypass.
- Fresh-entry checks include all three product choices, hidden custom Crew/setup/detail amounts, invalid inputs, returning and legacy visitors, reset, direct Arabic quote links, header/prompt focus, plus behavior, simulator normalization and a mutation observer that checks a normally typed 10 does not expose $1,195.
- Lint, TypeScript, translation checks, pricing-policy validation and production build/prerender pass. Optional sibling handoff roots were absent to match standalone deployment; no sibling parity claim is made.
- The local **production build** was inspected at 1440×1000 in both themes, 390×844 in both themes, 320×640 dark and 390×844 Arabic RTL. All six start with a blank count and no money in main content, then show three locations and the correct $1,545 monthly total / $515 average. None has horizontal document overflow.
- Prompt foreground/background pairs and card geometry are recorded in [readbacks.json](readbacks.json). Card width and top position remain stable across reveal; height grows to accommodate the existing average/total presentation. The compact sticky bar and consent behavior remain covered by existing regression checks. This is not a new performance audit or a claim that the full first card fits the initial 320 px viewport.

## Representative evidence

| View | Before entry | After three locations |
|---|---|---|
| Desktop dark | [Before](1440-dark-en-before.png) | [After](1440-dark-en-after.png) |
| Desktop light | [Before](1440-light-en-before.png) | [After](1440-light-en-after.png) |
| Mobile 390 dark | [Before](390-dark-en-before.png) | [After](390-dark-en-after.png) |
| Mobile 390 light | [Before](390-light-en-before.png) | [After](390-light-en-after.png) |
| Mobile 320 dark | [Before](320-dark-en-before.png) | [After](320-dark-en-after.png) |
| Mobile Arabic | [Before](390-dark-ar-before.png) | [After](390-dark-ar-after.png) |

The screenshots use a local production build with the published-policy test fixture at the catalogue boundary. They do not establish hosted preview or production publication. Unrelated old screenshot references were not replaced by test-generated files.

Logs: [browser](browser-checks.txt), [unit](unit-checks.txt), [build](build-checks.txt), [lint](lint-checks.txt).
