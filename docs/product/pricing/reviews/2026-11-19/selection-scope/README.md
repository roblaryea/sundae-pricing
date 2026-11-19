# Core/Crew selection summary correction — 19 November 2026

Application source: `4ce9bbad50484a80e32e6c33ebf632d73711ae0b`.
Base: published pricing merge `b58b139665de741e41e5d1e84cf5f5fb2e4ad4f0`.
Branch: `codex/pricing-selection-scope-20261119`.
Status: locally verified; exact-cut independent review/publication pending.

## Confirmed problem

In Core + Crew, the summary immediately below the product buttons deliberately displayed the other product. Selecting Core therefore showed “Selected · Sundae Crew”, $232.33 average and $697 monthly total at three locations. Selecting Crew showed Core Foundation, $515 average and $1,545 total. The combined basket correctly stayed $2,242. The existing combined-selection test explicitly asserted the opposite-product behavior. The publication owner independently reproduced this on the public site.

This was a summary-scope/interaction defect, not a switched price calculation or a change to either product's price book.

## Correction

The existing summary now uses the active product for its selected product name, selected plan/billing bundle, exact average, component total and availability state. It calculates that product from the full configuration, retaining extras, term/volume discounts and relevant employee overage. Switching tabs retains both selections. The main estimate bar explicitly labels its combined monthly total “Core + Crew”.

The same component serves the main overview and simulator selection step. The existing location gate remains in force. No pricing engine, catalogue, billing policy, ROI, PDF, identity asset, navigation or page/card design changed. Internal “other plan” class/test names were renamed to selected plan to reflect the corrected contract.

## Validation

- **7 focused browser scenarios pass**: selection/retention plus every Core/Crew option at desktop dark/light, mobile dark/light and 320 px Arabic RTL, plus an imported custom Crew quote with Core extras, Watchtower, annual discount and employee overage.
- Each responsive case clicks all four Core plans and all four Crew choices, verifies the component total follows its active product, checks retained Performance/Complete selections, verifies the unchanged combined $4,755 quote and checks no horizontal document overflow.
- At three locations: Core Foundation $1,545 ($515 average), Margin $2,140 ($713.33), Growth $2,445 ($815), Performance $3,798 ($1,266). Crew Starter $137, Schedule & Time $347, Operating $697, Complete $957. These remain component amounts; the combined bar sums the selected products through the existing basket calculation.
- Imported-configuration regression compares the summary to independently opened Core-only and Crew-only quotes with identical applicable scope. Returning to combined review preserves the full total, Franchise and Watchtower selections. Custom Manage + Schedule + Pay remains billed through Crew Operating.
- All **41 existing configured simulator journeys** and **17 location-entry checks** pass in the initial combined run. With the 7 focused cases, these give 65 passing checks over the affected seams. All **1,471 unit tests**, lint and standalone production build pass.

### Explicit older-suite boundary

Running the entire older `pricing-review-enhancements.spec.ts` initially produced 65 passes / 7 failures across 72 tests. The 7 failures are outside the changed seams: duplicated header-language selectors, retired mobile-average/payroll expectations, old review heading/reset-to-default1 expectations, and accessibility tests assuming ungated default prices. They are not silently counted as green or rewritten for this correction.

The exact same 7 tests were then run against the unmodified published application source (the prior location-gate worktree; its application/test source is identical to `b58b139`). All 7 failed with the same expectations. [Baseline log](baseline-legacy-checks.txt). The focused selection checks are green. This report makes no claim that every historical browser spec in the repository is current or passing.

## Finite visual evidence

Screenshots come from the local application with the published-policy fixture intercepted at the catalogue boundary. They are local verification, not hosted/production evidence. The end-of-click-through view deliberately uses retained Core Performance + Crew Complete to make the component and combined scopes distinguishable.

| View | Core selected | Crew selected |
|---|---|---|
| Desktop dark | [Core](core-1440-dark-en.png) | [Crew](crew-1440-dark-en.png) |
| Desktop light | [Core](core-1440-light-en.png) | [Crew](crew-1440-light-en.png) |
| Mobile dark | [Core](core-390-dark-en.png) | [Crew](crew-390-dark-en.png) |
| Mobile light | [Core](core-390-light-en.png) | [Crew](crew-390-light-en.png) |
| 320 px Arabic | [Core](core-320-dark-ar.png) | [Crew](crew-320-dark-ar.png) |

Logs: [selection](selection-checks.txt), [initial combined run](browser-checks.txt), [unit](unit-checks.txt), [lint](lint-final.txt), [build](build.txt).
