/**
 * Improvement headroom is not uniform across estate sizes.
 *
 * The recovery rates are GAP-TO-BEST-PRACTICE figures — the NRA data behind the
 * labour line is the distance between the median operator and the profitable
 * one. Applied flat per location, the model said a 200-site group had exactly
 * the same headroom as an independent, which contradicts how it became a
 * 200-site group: it already runs scheduling standards, already employs category
 * managers, already negotiates national supply contracts.
 *
 * Left flat, savings scaled linearly while the marginal bands drove price per
 * location from $1,195 to $119, so the modelled return climbed with every site:
 *
 *     1 site 1.8x · 25 sites 10.8x · 50 sites 13.3x · 100 sites 16.2x · 200 18.1x
 *
 * The 15x ceiling existed to stop the top of that curve being printed. It
 * truncated the symptom at exactly the estate sizes where the deals are largest
 * and the scrutiny hardest, and it did nothing about the claim underneath.
 *
 * Decaying the headroom addresses the cause, and it is the conservative
 * direction. The calibration is a commercial judgement and is named in two
 * constants so it can be argued with; only the SHAPE is asserted here.
 */
import { describe, expect, it } from "vitest";

import {
  GUARDRAILS,
  MATURITY_FLOOR,
  SAVINGS_ASSUMPTIONS,
  estateMaturityFactor,
} from "../src/hooks/useROICalculation";
import { calculateCorePackagePrice } from "../src/lib/pricingEngine";

/** Recovery for one location at a given revenue, each line on its own base. */
function recoveryPerLocation(revenue: number, labourPct = 32, foodPct = 29) {
  const a = SAVINGS_ASSUMPTIONS;
  return (
    revenue * (labourPct / 100) * a.labor.midPct +
    revenue * (foodPct / 100) * a.inventory.midPct +
    revenue * (foodPct / 100) * a.purchasing.midPct +
    revenue * a.revenue.midPct
  );
}

const modelledRoi = (locations: number, revenue = 100_000) =>
  (recoveryPerLocation(revenue) * locations * estateMaturityFactor(locations)) /
  calculateCorePackagePrice("core_foundation", locations);

describe("the maturity curve", () => {
  it("gives a single site its full headroom", () => {
    expect(estateMaturityFactor(1)).toBe(1);
  });

  it("never increases as the estate grows", () => {
    let previous = Infinity;
    for (let n = 1; n <= 300; n += 1) {
      const f = estateMaturityFactor(n);
      expect(f, `headroom rose at ${n} locations`).toBeLessThanOrEqual(previous);
      previous = f;
    }
  });

  it("floors rather than reaching zero", () => {
    // A large group has LESS headroom, not none — scale brings its own losses.
    expect(estateMaturityFactor(1_000)).toBe(MATURITY_FLOOR);
    expect(MATURITY_FLOOR).toBeGreaterThan(0.25);
  });

  it("is gentle in the range most buyers occupy", () => {
    // Nothing dramatic should happen to a ten-site operator.
    expect(estateMaturityFactor(10)).toBeGreaterThan(0.7);
    expect(estateMaturityFactor(25)).toBeGreaterThan(0.6);
  });

  it("handles junk input without inventing headroom", () => {
    expect(estateMaturityFactor(0)).toBe(1);
    expect(estateMaturityFactor(-5)).toBe(1);
    expect(estateMaturityFactor(1.9)).toBe(1);
  });
});

describe("what the curve does to the modelled return", () => {
  it("still rewards scale — a bigger estate does get more", () => {
    // The correction must not invert the relationship; larger groups genuinely
    // capture more absolute value and pay less per site.
    expect(modelledRoi(50)).toBeGreaterThan(modelledRoi(10));
    expect(modelledRoi(10)).toBeGreaterThan(modelledRoi(1));
  });

  it("flattens the curve instead of letting it run away", () => {
    // Flat-rate, 200 sites modelled 10x the return of one site. The gap between
    // the largest and mid-size estates should now be modest.
    const ratio = modelledRoi(200) / modelledRoi(50);
    expect(ratio).toBeLessThan(1.5);
  });

  it("keeps the published ceiling from binding at reachable sizes", () => {
    // This is the point: the cap becomes a backstop again rather than the
    // model. If this fails, the curve is too shallow or the cap too low.
    for (const n of [1, 10, 25, 50, 100, 200]) {
      expect(modelledRoi(n), `${n} locations still hits the cap`).toBeLessThan(
        GUARDRAILS.maxROIMultiple,
      );
    }
  });
});
