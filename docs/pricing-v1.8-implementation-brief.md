# Price book v1.8 — implementation brief

Two changes, independent of each other. Either can ship without the other.

1. **Extended band tail** — the volume curve keeps stepping past 50 locations.
2. **Anchor relief** — a selectable, per-customer discount on the first unit only, tapering over four years.

The pricing site (`sundae-pricing`) already implements both, on branch
`fix/location-control-and-layer-ux`. **`sundae-backend/config/pricing_master.ts`
is the authority and still carries v1.7 bands.** Until it is updated, the site
quotes numbers the backend will not bill. That desync is the first thing to close.

Implementation must create a new immutable v1.8 catalogue. The current backend
seeder clears and recreates the active version, so using it as written would
rewrite prices for subscriptions pinned to v1.7. The tables below are gross
list values; customer payable totals additionally reflect the existing
exclusive volume-or-cadence discount.

---

## 1. Extended band tail

### The problem

Every Core package and every Crew SKU spent its full volume discount by unit 51,
then ran flat forever. Measured on Core Growth:

| sites | marginal rate (v1.7) |
|---|---|
| 49 | $190 |
| 51 | $155 |
| 199 | $155 |
| 249 | $155 |

At 250 locations, **200 of 250 units (80%) priced identically to unit 51**. A
60-site group and a 250-site group paid the same marginal rate. Two consequences:
revenue left on the table in the 51–250 range, and no concession available in a
large-estate negotiation because the customer is already at the floor.

### The change

Bands 1–3 are unchanged. The terminal band is replaced by four steps, landing
below the old floor.

**Core** — `$/location/month`

| units | Foundation | Margin | Growth | Performance |
|---|---|---|---|---|
| 1 (anchor) | 1195 | 1650 | 1925 | 2980 |
| 2–10 | 175 | 245 | 260 | 409 |
| 11–25 | 150 | 210 | 225 | 348 |
| 26–50 | 125 | 175 | 190 | 290 |
| **51–100** | **115** | **165** | **180** | **275** |
| **101–150** | **110** | **155** | **170** | **255** |
| **151–250** | **105** | **145** | **160** | **245** |
| **251+** | **100** | **140** | **150** | **230** |

**Crew** — `$/location/month`

| units | Scheduling | T&A | Payroll | Operations | People Intel | Sched+Time | Operating Suite | Complete |
|---|---|---|---|---|---|---|---|---|
| 1 (anchor) | 179 | 99 | 129 | 399 | 249 | 249 | 499 | 699 |
| 2–10 | 39 | 19 | 29 | 79 | 39 | 49 | 99 | 129 |
| 11–25 | 35 | 17 | 26 | 71 | 35 | 45 | 89 | 115 |
| 26–50 | 31 | 15 | 23 | 63 | 31 | 41 | 79 | 102 |
| **51–100** | **29** | **14** | **22** | **59** | **29** | **39** | **74** | **96** |
| **101–150** | **27** | **13** | **20** | **56** | **27** | **36** | **70** | **90** |
| **151–250** | **26** | **13** | **19** | **53** | **26** | **34** | **66** | **86** |
| **251+** | **25** | **12** | **18** | **50** | **25** | **33** | **63** | **82** |

`crew_lite` is unchanged — it caps at 5 locations, so a tail is meaningless.
**Foresight, Watchtower and the concept SKUs are deliberately NOT changed.**

### Backend edit

`config/pricing_master.ts`, `locationBands` is `Array<[upToUnit, ratePerUnit]>`.
Growth becomes:

```ts
locationBands: [
  [1, 1925], [10, 260], [25, 225], [50, 190],
  [100, 180], [150, 170], [250, 160], [251, 150],
],
```

`PriceResolver.cumulativeBandTotal` extends the LAST rate indefinitely
(`if (remaining > 0) total += remaining * lastRate`), so the final entry is the
open floor. No engine change is required — this is data only.

### Revenue effect

| sites | Core Growth today | v1.8 | delta |
|---|---|---|---|
| ≤50 | — | — | **no change** |
| 100 | $20,140 | $21,390 | +6.2% |
| 150 | $27,890 | $29,890 | +7.2% |
| 250 | $43,390 | $45,890 | +5.8% |
| 400 | $66,640 | $68,390 | +2.6% |

**This is a price rise for existing customers between 51 and 250 locations.**
It needs a renewal-impact pass before it ships — I have not modelled churn.
The 250-unit total and 251+ row remain Enterprise/sales-approved reference
inputs and do not become self-serve.

“The largest estates gain” is true only of the **marginal floor**, not the whole
invoice immediately. On the worked Core Growth + Crew Operating rail, v1.8 is
still about 4.0% above v1.7 at 250 locations and does not fall below the old
total until roughly 479 locations. Sales copy must not describe 251 locations
as an immediate total-price reduction.

### Invariants to hold

- Bands stay **marginal**: a rate applies only to units inside its band, and
  reaching a cheaper band never reprices units already held.
- No cliff: the total must rise at every boundary. Verify 50→51, 100→101,
  150→151, 250→251.
- Rates step down monotonically.

---

## 2. Anchor relief

### The mechanic

A discount applied **to the first-unit anchor only**, never to per-location
bands, add-ons or Watchtower. Default schedule by contract year:

| year | relief |
|---|---|
| 1 | 75% |
| 2 | 50% |
| 3 | 25% |
| 4+ | 0% (list) |

### Why the anchor and not the invoice

The anchor is where the small-estate problem lives:

| sites | anchor as share of bill |
|---|---|
| 5 | 63% |
| 10 | 43% |
| 50 | 14% |
| 250 | 4% |

So the same schedule is worth ~31% to a five-site operator and ~2% to a
250-site one. It self-targets without touching list and without repricing the
bands anyone else is on.

### Why a glide and not a flat offer

A flat 50%-then-list creates a **+46% increase at month 13** for a five-site
customer — a discount that converts into churn. The four-step glide keeps every
year-on-year increase in single digits from 25 locations upward:

| sites | Yr1→Yr2 | Yr2→Yr3 | Yr3→Yr4 |
|---|---|---|---|
| 5 | +29.7% | +22.9% | +18.6% |
| 25 | +7.1% | +6.6% | +6.2% |
| 250 | +1.0% | +1.0% | +1.0% |

It also moves the point at which Sundae beats a Tenzo + Deputy stack on
per-site cost from **40 locations to 16** in year one.

### What to build

A **discount type**, selectable per customer, not a global price change.

- **Scope:** anchor / first-unit only. Must not touch `locationBands` beyond
  unit 1, add-ons, Watchtower, or implementation.
- **Schedule:** percentage per contract year, defaulting to `[75, 50, 25, 0]`,
  editable per agreement.
- **Applies to:** Core anchor and Crew anchor independently — a Core+Crew deal
  carries two anchors. **When a Crew bundle is detected it replaces its
  constituent SKUs, so only the BUNDLE anchor is discounted.** Summing the
  member SKU anchors as well would relieve a first unit twice for one rail.
- **Anniversary:** relief steps on the contract anniversary, not the calendar year.
- **Surfacing:** the full four-year path, step-ups included, on the quote and
  the invoice preview. A schedule that shows only the discounted years is the
  document that produces the surprise at renewal.

Before coding, define discount stacking, two-year prepaid treatment, separate
Core/Crew anniversary clocks, mid-contract plan changes, tax and rounding,
credits/cancellation, and the Stripe phase-transition mechanism. Recommended
stacking is anchor relief against gross anchor list first, followed by the
existing mutually-exclusive volume-or-cadence discount on the resulting
recurring subtotal. Two-year prepaid treatment remains a commercial decision.

### Reference implementation

`src/lib/anchorRelief.ts` in the pricing site carries the maths and the
bundle-anchor rule; `src/components/Summary/AnchorReliefSchedule.tsx` renders
the path. 10 unit tests in `__tests__/anchorRelief.spec.ts` pin the properties:
self-targeting, monotonic increase, never below the recurring floor, and beating
a flat-cliff schedule on worst-case step-up.

---

## 3. Sequencing

1. Update `pricing_master.ts` bands → the site and backend agree again.
2. Create an inactive immutable v1.8 DB catalogue and sync that version to
   Stripe without mutating v1.7 or any live subscription.
3. Build anchor relief as a discount type in admin pricing.
4. Renewal-impact pass on existing 51–250 customers **before** v1.8 activation.

## 4. Open questions — decisions I did not make

- **Renewal treatment.** Grandfather existing 51–250 customers, or reprice at
  renewal? Not modelled.
- **Sub-10 estates.** Even at 75% relief a five-site operator pays $408/site
  against a rival stack at ~$360, and faces +29.7% at year two. Options: hold
  25% permanently below 10 sites, stretch to five years, or accept the segment
  is not the target and let the 3× guarantee carry it.
- **The 3× guarantee.** Committing to identify 3× the price in bankable
  opportunity within 3 months equates to **1.0–2.3% of revenue** at the
  simulator's conservative $75k/site/month. Comfortably inside the ROI model's
  own plausibility ceilings, and it gets *safer* as estates grow. Needs a
  contractual definition of "bankable" — recommend the closed-loop standard:
  identified, evidenced against a frozen baseline, with a named owner and a
  Crew action. "Identified" is defensible; "realised" depends on the operator
  acting, which we do not control.
- **Competitor basis.** The rival comparison assumes **15 employees per site**
  for Deputy — our assumption, not their published rate. A leaner operator
  narrows the gap.
