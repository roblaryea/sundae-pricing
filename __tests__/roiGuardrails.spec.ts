/**
 * A guardrail must bound an implausible input — never the answer itself.
 *
 * The ROI ceilings were absolute dollars per location (labour $2,500, inventory
 * $1,500, total $8,000) inside a model whose every line is a PERCENTAGE of
 * revenue. A flat $8,000 is 16% of revenue at a $50k/month site and 1.6% at a
 * $500k/month site — one constant enforcing two irreconcilable standards of
 * plausibility.
 *
 * A sweep of 103,680 UI-reachable configurations found the consequence: per-line
 * ceilings bound on 36.1% of cells overall, 0% at $50k/site and 100% at
 * $400k/site. Above roughly $250k/site the guardrails WERE the model, and a
 * larger operator was quietly shown a smaller percentage return with no
 * evidentiary basis for the difference. The $8,000 total bound on Core
 * Performance and on no other package, so the top of the ladder was the only
 * rung the global guardrail punished.
 *
 * These tests pin the corrected contract: ceilings are shares of revenue, they
 * never cut into a line's own published band, and an unrecognised domain fails
 * loudly instead of silently inheriting an arbitrary `|| 1000`.
 */
import { describe, expect, it } from "vitest";

import {
  GUARDRAILS,
  GUARDRAIL_REFERENCE_REVENUE,
  SAVINGS_ASSUMPTIONS,
  plausibilityCeiling,
} from "../src/hooks/useROICalculation";

const DOMAINS = Object.keys(GUARDRAILS.maxSavingsShareOfRevenue);

describe("ceilings are denominated in revenue, not dollars", () => {
  it("covers every domain the savings model actually scores", () => {
    // A domain with a rate but no ceiling used to fall through to `|| 1000`.
    for (const id of Object.keys(SAVINGS_ASSUMPTIONS)) {
      expect(
        GUARDRAILS.maxSavingsShareOfRevenue[
          id as keyof typeof GUARDRAILS.maxSavingsShareOfRevenue
        ],
        `${id} has a savings rate but no stated ceiling`,
      ).toBeGreaterThan(0);
    }
  });

  it("scales with the operator instead of tightening on them", () => {
    for (const id of DOMAINS) {
      const small = plausibilityCeiling(id, 100_000, 1, 0);
      const large = plausibilityCeiling(id, 500_000, 1, 0);
      expect(large / small, `${id} did not scale with revenue`).toBeCloseTo(5, 6);
    }
  });

  it("leaves a typical site exactly where the old dollar figures put it", () => {
    // The shares are the old caps over the $100k/location month they were
    // calibrated at, so the reference case must not move at all.
    const OLD_DOLLARS: Record<string, number> = {
      labor: 2500,
      inventory: 1500,
      purchasing: 1500,
      reservations: 1500,
      marketing: 1000,
      profit: 1200,
      revenue: 500,
      delivery: 800,
      guest: 300,
    };
    for (const [id, dollars] of Object.entries(OLD_DOLLARS)) {
      expect(
        plausibilityCeiling(id, GUARDRAIL_REFERENCE_REVENUE, 1, 0),
        `${id} moved at the reference revenue`,
      ).toBeCloseTo(dollars, 6);
    }
  });

  it("scales with estate size as well as revenue", () => {
    expect(plausibilityCeiling("labor", 100_000, 10, 0)).toBeCloseTo(25_000, 6);
  });
});

describe("a guardrail never contradicts the evidence band", () => {
  it("cannot cut below the top of the line's own published range", () => {
    // Marketing is measured on marketing SPEND, so a site spending heavily
    // against modest revenue has a legitimate in-band figure that a
    // revenue-denominated ceiling would otherwise clip.
    const bandMaximum = 1_500; // 15% of a $10k marketing spend
    const ceiling = plausibilityCeiling("marketing", 50_000, 1, bandMaximum);
    expect(ceiling).toBeGreaterThanOrEqual(bandMaximum);
  });

  it("holds for every domain at the bottom of the revenue slider", () => {
    for (const id of DOMAINS) {
      const assumption = SAVINGS_ASSUMPTIONS[id];
      const bandMaximum = 50_000 * assumption.maxPct * (assumption.marginOnLift ?? 1);
      expect(
        plausibilityCeiling(id, 50_000, 1, bandMaximum),
        `${id} clips its own evidenced maximum`,
      ).toBeGreaterThanOrEqual(bandMaximum);
    }
  });

  it("still bites on a figure well beyond the band", () => {
    const absurd = 10_000_000;
    expect(plausibilityCeiling("labor", 100_000, 1, 0)).toBeLessThan(absurd);
  });
});

describe("an unknown domain fails loudly", () => {
  it("throws rather than inheriting an arbitrary default", () => {
    expect(() => plausibilityCeiling("crew_workforce", 100_000, 1, 0)).toThrow(
      /No plausibility ceiling defined/,
    );
  });

  it("names the domain so the fix is obvious", () => {
    expect(() => plausibilityCeiling("guest_crm", 100_000, 1, 0)).toThrow(/guest_crm/);
  });
});

describe("the total ceiling does not single out one package", () => {
  it("is a share of revenue, so it cannot bind on the top rung alone", () => {
    expect(GUARDRAILS.maxTotalShareOfRevenue).toBeGreaterThan(0);
    expect(GUARDRAILS.maxTotalShareOfRevenue).toBeLessThan(1);
    // It must sit above what the model actually produces, or the ceiling is the
    // model rather than a backstop.
    //
    // Normalise each line onto revenue before summing it. Labour is a share of
    // labour spend; inventory and purchasing are shares of food/purchase spend;
    // reservations is a revenue lift whose contribution margin is counted.
    const midSum =
      SAVINGS_ASSUMPTIONS.labor.midPct * 0.30 +
      SAVINGS_ASSUMPTIONS.inventory.midPct * 0.30 +
      SAVINGS_ASSUMPTIONS.purchasing.midPct * 0.30 +
      SAVINGS_ASSUMPTIONS.reservations.midPct * (SAVINGS_ASSUMPTIONS.reservations.marginOnLift ?? 1) +
      SAVINGS_ASSUMPTIONS.profit.midPct +
      SAVINGS_ASSUMPTIONS.revenue.midPct +
      SAVINGS_ASSUMPTIONS.guest.midPct;
    expect(midSum).toBeLessThan(0.05); // sanity: the model is a low-single-digit % of revenue
    expect(GUARDRAILS.maxTotalShareOfRevenue).toBeGreaterThan(midSum);
  });

  it("no longer exists as a flat per-location dollar figure", () => {
    expect(
      (GUARDRAILS as Record<string, unknown>).maxTotalSavingsPerLocation,
      "the flat $8,000 total cap is still present",
    ).toBeUndefined();
    expect(
      (GUARDRAILS as Record<string, unknown>).maxSavingsPerLocation,
      "the flat per-line dollar caps are still present",
    ).toBeUndefined();
  });
});
