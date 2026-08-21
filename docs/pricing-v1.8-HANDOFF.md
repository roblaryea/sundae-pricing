# Price book v1.8 — implementation handoff

**For a session working in `sundae-backend`.** Self-contained: every value you
need is below. Do not re-derive them from the pricing site.

Two independent changes. Either can ship without the other.

- **Change A — extended band tail.** Data only, no engine change.
- **Change B — anchor relief.** A new discount type; needs schema + logic + admin UI.

**Current state:** the pricing site (`sundae-pricing`, branch
`fix/location-control-and-layer-ux`) already implements both. `pricing_master.ts`
still carries v1.7, so **the simulator currently quotes numbers the backend will
not bill.** Closing that desync is the point of Change A.

## Mandatory release corrections

Do **not** run the current `pricing_catalog_seeder` against the active catalogue.
It clears and recreates items inside the existing active version, which would
rewrite the prices of subscriptions pinned to that version. Create an immutable
v1.8 catalogue version, retain v1.7 unchanged, validate it while inactive, then
activate it only after the renewal/grandfathering decision below is recorded.

The values in this document are **gross list totals before** the existing
exclusive volume-or-billing-cycle discount. Customer quote, Stripe, invoice,
and guarantee tests must also assert the net payable amount. For example, a
100-location monthly quote currently earns the 5% volume discount; annual and
two-year quotes use the larger 10% or 15% cadence discount instead.

The 250-unit total and 251+ rates are Enterprise quote reference inputs. They
do not remove the existing 250+ sales-approval gate and must not become
self-serve.

---

# Change A — extended band tail

## What is wrong now

Every Core package and Crew SKU spends its full volume discount by unit 51, then
runs flat forever. On Core Growth the marginal rate is $190 at 49 sites, $155 at
51, and $155 at 249. At 250 locations **200 of 250 units price identically to
unit 51** — a 60-site group and a 250-site group pay the same marginal rate.

## File

`config/pricing_master.ts` — `locationBands: Array<[upToUnit, ratePerUnit]>`.

`PriceResolver.cumulativeBandTotal` already extends the final rate indefinitely
(`if (remaining > 0) total += remaining * lastRate`), so the last entry is the
open floor. **No engine change required.**

## Exact edits — replace `locationBands` verbatim

### Core packages

```ts
foundation:   [[1,1195],[10,175],[25,150],[50,125],[100,115],[150,110],[250,105],[251,100]]
margin:       [[1,1650],[10,245],[25,210],[50,175],[100,165],[150,155],[250,145],[251,140]]
growth:       [[1,1925],[10,260],[25,225],[50,190],[100,180],[150,170],[250,160],[251,150]]
performance:  [[1,2980],[10,409],[25,348],[50,290],[100,275],[150,255],[250,245],[251,230]]
```

### Crew SKUs

```ts
crew_scheduling:           [[1,179],[10,39],[25,35],[50,31],[100,29],[150,27],[250,26],[251,25]]
crew_operations:           [[1,399],[10,79],[25,71],[50,63],[100,59],[150,56],[250,53],[251,50]]
crew_tna:                  [[1,99],[10,19],[25,17],[50,15],[100,14],[150,13],[250,13],[251,12]]
crew_payroll:              [[1,129],[10,29],[25,26],[50,23],[100,22],[150,20],[250,19],[251,18]]
crew_people_intelligence:  [[1,249],[10,39],[25,35],[50,31],[100,29],[150,27],[250,26],[251,25]]
```

### Crew bundles

```ts
crew_schedule_time_bundle: [[1,249],[10,49],[25,45],[50,41],[100,39],[150,36],[250,34],[251,33]]
crew_suite_bundle:         [[1,499],[10,99],[25,89],[50,79],[100,74],[150,70],[250,66],[251,63]]
crew_complete_bundle:      [[1,699],[10,129],[25,115],[50,102],[100,96],[150,90],[250,86],[251,82]]
```

## DO NOT CHANGE

`crew_lite` (caps at 5 locations — a tail is meaningless), `foresight`,
`hotel_fb_analytics`, `franchise_intelligence`, `cloud_kitchen`,
`rental_commissary`, `crew_catering`, `crew_production`.

The concept SKUs carry pre-GTM placeholder pricing and are a separate
commercial decision. Leaving them means their curves still flatten at 51 —
**that is intentional for this change, not an oversight.**

## Pre-existing defect, NOT introduced here

`crew_catering` is `[[25,59],[50,59]]` — two adjacent bands at the same rate, so
one band does not step. It is a band the buyer cannot be given a reason for.
Worth fixing, out of scope here. Flag it; do not silently alter it.

## Tests to write

```
1. Changed bands are contiguous: band[i].from === band[i-1].to + 1, no gaps, no overlaps.
   A gap leaves a unit unpriced; an overlap bills it twice.
2. Rates step down STRICTLY for the changed Core/Crew offers: rates[i] < rates[i-1]. No band may equal its
   predecessor (this is what caught the crew_tna rounding collision).
3. No cliff: total(n+1) > total(n) for every n in 1..300. Check 50→51, 100→101,
   150→151, 250→251 explicitly.
4. Marginal, not retroactive: total(60) must equal
   1925 + 9*260 + 15*225 + 25*190 + 10*180 = $14,190 for Growth.
   If it returns $11,070 the engine is repricing all units at the top rate.
5. Nothing at or under 50 locations changes vs v1.7. Assert equality at
   1, 2, 10, 25, 26, 50 for all four Core packages and all Crew SKUs.
6. The floor is REACHED, not exceeded: rate(300) === rate(1000).
```

## Expected values to assert (Core Growth)

| sites | v1.7 | v1.8 | delta |
|---|---|---|---|
| 10 | $4,265 | $4,265 | 0% |
| 25 | $7,640 | $7,640 | 0% |
| 50 | $12,390 | $12,390 | 0% |
| 100 | $20,140 | $21,390 | +6.2% |
| 150 | $27,890 | $29,890 | +7.2% |
| 250 | $43,390 | $45,890 | +5.8% |

## After the edit

1. Create a new inactive, immutable v1.8 DB catalogue from `pricing_master.ts`;
   never clear or rewrite the active v1.7 version.
   After cloning the active catalogue to a draft, run
   `node ace pricing:stage-v18 <draft-version-id>` as a read-only validation,
   then repeat with `--apply`. The command refuses active catalogues, persists
   curves on the draft version, and clears cloned Stripe price IDs because
   Stripe prices are immutable.
2. Verify gross band totals and net payable totals for monthly, annual, and
   two-year quotes while v1.8 is inactive.
3. Run Stripe catalogue sync for the v1.8 version and reconcile every product,
   currency, cadence, and computed amount without changing live subscriptions.
4. Verify the version-targeted catalogue API returns the new rates and that the
   normal customer API continues to return v1.7 until activation.
5. Activate v1.8 for new sales only after the renewal/grandfathering decision.

## Commercial warning

**This is a price rise for existing customers between 51 and 250 locations**
(+5.8% to +7.2%). Churn has NOT been modelled. A renewal-impact pass is needed
before this ships. Customers at or under 50 see no change.

---

# Change B — anchor relief

## What it is

A discount applied **to the first-unit anchor only** — never to per-location
bands, add-ons, Watchtower, or implementation. Selectable per customer.

Default schedule, by contract year: **75% / 50% / 25% / 0%**.

## Why the anchor

The anchor is where the small-estate problem lives:

| sites | anchor as share of bill |
|---|---|
| 5 | 63% |
| 10 | 43% |
| 50 | 14% |
| 250 | 4% |

The same schedule is therefore worth ~31% to a five-site operator and ~2% to a
250-site one. It self-targets without touching list and without repricing the
bands anyone else is on.

## Why four steps and not a flat offer

A flat 50%-then-list produces a **+46% increase at month 13** for a five-site
customer — a discount that converts into churn. The glide keeps every
year-on-year step in single digits from 25 locations upward:

| sites | Yr1→Yr2 | Yr2→Yr3 | Yr3→Yr4 |
|---|---|---|---|
| 5 | +29.7% | +22.9% | +18.6% |
| 25 | +7.1% | +6.6% | +6.2% |
| 250 | +1.0% | +1.0% | +1.0% |

## Behaviour to implement

```
scope:        first unit / anchor ONLY
schedule:     percent per contract year, default [75, 50, 25, 0], editable
applies to:   Core anchor and Crew anchor INDEPENDENTLY (a Core+Crew deal
              carries two anchors)
bundle rule:  when a Crew bundle is detected it REPLACES its member SKUs, so
              only the BUNDLE anchor is relieved. Summing member anchors as
              well relieves one rail's first unit twice.
step timing:  contract anniversary, not calendar year
year 5+:      list price (schedule exhausted)
```

## Contract rules required before Change B is coded

The following are billing semantics, not UI preferences, and must be decided
before anchor relief can be enabled:

- stacking order with the existing 10% annual, 15% two-year, volume, bundle,
  and promotional discounts;
- whether a two-year prepaid contract uses one fixed blended amount or two
  separately invoiced annual relief phases;
- whether Core and Crew added on different dates carry separate anniversary
  clocks or one agreement anniversary;
- treatment of upgrades, downgrades, cancellation credits, and reactivation
  inside a contract year;
- currency-minor-unit rounding, tax basis, credit notes, and invoice wording;
- Stripe implementation (subscription-schedule phases or a durable anniversary
  workflow), including webhook idempotency and failure recovery.

Recommended default: calculate anchor relief on gross anchor list price first,
then apply the existing mutually-exclusive volume-or-cadence discount to the
resulting recurring subtotal; promotional concessions remain subject to the
existing combined cap. Use separate rail start dates only when Core and Crew
are contracted separately. Two-year prepaid treatment requires an explicit
commercial decision and must not be inferred.

## Reference implementation

In `sundae-pricing`:
- `src/lib/anchorRelief.ts` — maths + the bundle-anchor rule
- `src/components/Summary/AnchorReliefSchedule.tsx` — the display
- `__tests__/anchorRelief.spec.ts` — 10 tests

## Tests to write

```
1. Only the anchor is discounted: monthly >= recurringTotal in every year.
2. Year 4 equals list exactly; no year exceeds list.
3. Monotonic increase; stepUp is null in year 1 and positive thereafter.
4. Self-targeting: year-1 saving > 25% at 5 sites and < 5% at 250 sites.
5. Bundle rule: crewAnchor(skus, bundleId) uses the BUNDLE anchor and is
   strictly less than the sum of member anchors.
6. Beats a flat 50%-then-list schedule on worst-case year-on-year step-up.
7. Zero anchors -> no schedule rendered (do not show an empty table).
```

## Surfacing

Show **all four years including the step-ups**, on the quote and the invoice
preview. A table listing only the discounted years is the document that produces
the surprise at renewal, and the entire reason for a glide over a cliff is that
the buyer can see where it lands before signing.

---

# Sequencing

1. Change A in `pricing_master.ts` → site and backend agree again.
2. Create and validate an inactive immutable v1.8 catalogue + Stripe sync.
3. Change B as a discount type in admin pricing.
4. Renewal-impact pass on existing 51–250 customers **before** A is activated.

# Decisions NOT made — these need a human

- **Renewal treatment.** Grandfather existing 51–250 customers, or reprice at
  renewal? Not modelled.
- **Sub-10 estates.** Even at 75% relief a five-site operator pays ~$408/site
  against a rival stack at ~$360, then faces +29.7% at year two. Options: hold
  25% permanently below 10 sites, stretch to five years, or accept the segment
  is not the target.
- **Concept SKUs.** Left on the old flat-at-51 curve. Deliberate, but it means
  two curve shapes now coexist.
- **`crew_catering`'s non-stepping band** ([25,59],[50,59]) — pre-existing.
- **The 3× guarantee**, if it proceeds: committing to identify 3× price in
  bankable opportunity within 3 months equates to **1.0–2.3% of revenue** at the
  simulator's conservative $75k/site/month, and it gets *safer* as estates grow.
  Needs a contractual definition of "bankable" — recommend the closed-loop
  standard: identified, evidenced against a frozen baseline, with a named owner
  and a Crew action. "Identified" is defensible; "realised" depends on the
  operator acting, which we do not control. Recommended eligibility guardrail:
  `3 × annual net eligible subscription fees <= 2.5% of verified in-scope annual revenue`.
  Start the measurement window only when the agreed data set is ready, exclude
  directional-only and duplicate opportunities, and cap the remedy at a
  proportional service credit no greater than the eligible fees paid. Pilot the
  wording before offering it universally; a $40k/site/month prospect can carry
  materially more exposure than the simulator's $75k floor suggests.

# Basis of the competitor comparison

Rival stack = Tenzo (3 modules @ $75/location) + Deputy Pro ($9/user assuming
**15 employees per site**) = ~$360/site, flat at every scale. **The headcount is
our assumption, not Deputy's published rate** — a leaner operator narrows the
gap. That stack also excludes payroll and HR casework, so it is not
scope-equivalent; the true like-for-like gap is wider in Sundae's favour.
