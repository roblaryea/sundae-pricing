/**
 * Competitor comparisons must survive a commercial review.
 *
 * The simulator carried a persistent "save N% vs Tenzo" badge built on a
 * comparison that could not be substantiated:
 *
 *   - It priced Tenzo at ELEVEN modules — Sundae's domain count — when the
 *     repo's own verified competitor data (tenzo.io/pricing, checked
 *     2026-01-01) lists only three as available. It invoiced a named company
 *     for eight modules they do not sell, inflating them 3.7x: $6,600/mo
 *     against a real $1,800 at eight locations.
 *   - It rendered only when the saving was positive, so it could never show
 *     Sundae costing more. A comparison that can only return one answer is a
 *     boast, not a comparison.
 *   - Neither side included implementation, and the badge had nowhere to state
 *     any of that.
 *
 * The honest argument is coverage, not price at equal module count: Sundae
 * spans eleven domains, Tenzo three.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import {
  TENZO_SELLABLE_MODULES,
  calculateCorePackagePrice,
  calculateTenzoPrice,
} from "../src/lib/pricingEngine";
import { COMPETITOR_ASSUMPTIONS, COMPETITOR_PRICING } from "../src/data/competitorPricing";

describe("the competitor price reflects what they actually sell", () => {
  it("agrees with the verified module map", () => {
    const tenzo = COMPETITOR_PRICING.tenzo as unknown as {
      pricing: { modules: Record<string, { available: boolean }> };
    };
    const available = Object.values(tenzo.pricing.modules).filter((m) => m.available).length;
    expect(TENZO_SELLABLE_MODULES).toBe(available);
  });

  it("refuses to price modules the competitor does not offer", () => {
    const at11 = calculateTenzoPrice(8, 11);
    const at3 = calculateTenzoPrice(8, 3);
    expect(at11.modulesPriced).toBe(TENZO_SELLABLE_MODULES);
    expect(at11.monthly).toBe(at3.monthly);
    // The figure the old badge used, which must now be unreachable.
    expect(at11.monthly).not.toBe(6600);
    expect(at11.monthly).toBe(1800);
  });

  it("never invents a larger competitor bill by asking for more modules", () => {
    for (const n of [1, 8, 25, 50]) {
      const capped = calculateTenzoPrice(n, TENZO_SELLABLE_MODULES).monthly;
      for (const ask of [4, 7, 11, 99]) {
        expect(calculateTenzoPrice(n, ask).monthly).toBe(capped);
      }
    }
  });

  it("handles a zero or negative module count without producing a negative bill", () => {
    expect(calculateTenzoPrice(8, 0).monthly).toBe(0);
    expect(calculateTenzoPrice(8, -3).monthly).toBe(0);
  });
});

describe("the comparison is allowed to be unfavourable", () => {
  it("shows Sundae costing MORE than three Tenzo modules, because it does", () => {
    // This is the honest position at these sizes, and the old badge hid it by
    // rendering only when the saving was positive. Sundae's argument here is
    // eleven domains against three, not a lower price.
    for (const n of [8, 25, 50]) {
      const sundae = calculateCorePackagePrice("core_growth", n);
      const tenzo = calculateTenzoPrice(n, TENZO_SELLABLE_MODULES).monthly;
      expect(sundae).toBeGreaterThan(tenzo);
    }
  });
});

describe("every competitor figure carries provenance", () => {
  const ids = Object.keys(COMPETITOR_ASSUMPTIONS) as Array<keyof typeof COMPETITOR_ASSUMPTIONS>;

  it("documents assumptions for the competitors it prices", () => {
    expect(ids.length).toBeGreaterThan(0);
  });

  it.each(ids)("%s states a source and a verification date", (id) => {
    const a = COMPETITOR_ASSUMPTIONS[id] as { source?: string; lastVerified?: string };
    expect(a.source, `${id} has no stated source`).toBeTruthy();
    expect(a.lastVerified, `${id} has no verification date`).toBeTruthy();
  });

  it("marks anything not publicly priced as estimated or unverified, never verified", () => {
    for (const [id, a] of Object.entries(COMPETITOR_ASSUMPTIONS) as Array<
      [string, { source?: string }]
    >) {
      if (!/estimate|not public/i.test(a.source ?? "")) continue;
      const entry = (COMPETITOR_PRICING as Record<string, { verification?: string }>)[id];
      if (!entry) continue;
      expect(
        entry.verification,
        `${id} is sourced from estimates but claims to be verified`,
      ).not.toBe("verified");
    }
  });
});

describe("no unqualified competitor claim renders in the persistent calculator", () => {
  const SRC = readFileSync("src/components/PricingDisplay/LiveCalculator.tsx", "utf8");

  it("carries no savings badge", () => {
    // The always-on widget has no room to state a basis, a source or a date, so
    // it must not assert a comparison at all. The summary does it properly.
    expect(SRC).not.toMatch(/saveVs/);
    expect(SRC).not.toMatch(/savingsPercent/);
  });
});
