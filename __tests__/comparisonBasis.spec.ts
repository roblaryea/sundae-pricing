/**
 * The comparison must be argued on the basis that is true, not the one that is
 * left over.
 *
 * `calculateCompetitorComparison` computes BOTH `savings.ongoing` (recurring
 * only) and `savings.firstYear` (recurring plus one-time on both sides). The
 * card rendered `ongoing` in all four places and the engine sorted on it, so
 * `firstYear` was computed and thrown away.
 *
 * That handed every competitor their setup fee for free. Tenzo charges $350 per
 * module per location — $1,050 a location, $261,450 at 249 sites. Power BI
 * charges $15,000 to $50,000 to build. On a recurring-only basis none of that
 * exists, and a sweep found Core Performance losing to Tenzo in 747 of 747
 * cells. Measured over the first year Sundae overtakes Tenzo from roughly 56-87
 * locations.
 *
 * The reason the sort was moved onto `ongoing` in the first place was real and
 * must not regress: counting a competitor's setup fee against a Sundae figure
 * that excluded OUR implementation is the same defect pointing the other way.
 * `firstYearComparable` is the guard — it is false while our implementation is
 * scoped at contract, and only true once the discovery answers resolve a class.
 */
import { describe, expect, it } from "vitest";

import {
  CORE_PACKAGE_SELECTION_ID,
  calculateAllComparisons,
  comparisonAmount,
} from "../src/data/competitorPricing";
import { PACKAGE_DOMAIN_GRANTS } from "../src/data/pricing";
import { calculateCorePackagePrice } from "../src/lib/pricingEngine";

const PACKAGES = [
  "core_foundation",
  "core_margin",
  "core_growth",
  "core_performance",
] as const;

function basisFor(pkg: (typeof PACKAGES)[number], locations: number, fee: number) {
  return {
    coreMonthly: calculateCorePackagePrice(pkg, locations),
    crewMonthly: 0,
    implementationFee: fee,
    implementationScoped: fee === 0,
    implementationIsFloor: false,
  };
}

function comparisonsFor(pkg: (typeof PACKAGES)[number], locations: number, fee: number) {
  const modules = [
    CORE_PACKAGE_SELECTION_ID,
    ...(PACKAGE_DOMAIN_GRANTS[pkg] as readonly string[]),
  ];
  return calculateAllComparisons(locations, modules, basisFor(pkg, locations, fee), {
    monthlyRevenuePerLocation: 100_000,
  });
}

describe("comparisonAmount picks the honest basis", () => {
  it("uses first year once both sides are knowable", () => {
    const c = {
      savings: { ongoing: 1_000, firstYear: 9_000, firstYearComparable: true },
    };
    expect(comparisonAmount(c)).toBe(9_000);
  });

  it("falls back to recurring while our own implementation is scoped", () => {
    // Counting THEIR setup against a Sundae figure that excludes OURS is the
    // same defect in reverse.
    const c = {
      savings: { ongoing: 1_000, firstYear: 9_000, firstYearComparable: false },
    };
    expect(comparisonAmount(c)).toBe(1_000);
  });
});

describe("the ranking and the rendered figure cannot disagree", () => {
  it("sorts descending on the same basis it displays", () => {
    for (const fee of [0, 2_500]) {
      const list = comparisonsFor("core_margin", 10, fee);
      const amounts = list.map(comparisonAmount);
      const sorted = [...amounts].sort((a, b) => b - a);
      expect(amounts, `ranking disagrees with the displayed basis at fee ${fee}`).toEqual(
        sorted,
      );
    }
  });
});

describe("what the corrected basis actually changes", () => {
  const sweep = (fee: number) => {
    let cheaper = 0;
    let total = 0;
    for (const pkg of PACKAGES) {
      for (let n = 1; n <= 100; n += 1) {
        for (const c of comparisonsFor(pkg, n, fee)) {
          total += 1;
          if (comparisonAmount(c) > 0) cheaper += 1;
        }
      }
    }
    return { cheaper, total };
  };

  it("improves Sundae's standing without touching a single price", () => {
    const scoped = sweep(0);
    const known = sweep(2_500);
    expect(known.total).toBe(scoped.total);
    expect(
      known.cheaper,
      "the first-year basis did not improve Sundae's position",
    ).toBeGreaterThan(scoped.cheaper);
  });

  it("is a real move, not a rounding artefact", () => {
    const scoped = sweep(0);
    const known = sweep(2_500);
    const gain = (known.cheaper - scoped.cheaper) / scoped.cheaper;
    expect(gain).toBeGreaterThan(0.05);
  });

  it("still lets a competitor win — the basis is not a one-way mirror", () => {
    // A comparison that can only return one answer is a boast. Both bases must
    // be able to show Sundae costing more.
    for (const fee of [0, 2_500]) {
      const list = comparisonsFor("core_performance", 50, fee);
      const losses = list.filter((c) => comparisonAmount(c) <= 0);
      expect(losses.length, `no competitor can beat us at fee ${fee}`).toBeGreaterThan(0);
    }
  });
});
