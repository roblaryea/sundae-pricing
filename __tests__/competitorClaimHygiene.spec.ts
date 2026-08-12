/**
 * We may not assert a limitation the vendor's own site disproves.
 *
 * A first-party audit of all five packaged rivals produced ZERO defensible
 * "cannot at any price" capabilities — and, far more usefully, found that our
 * `limitations` arrays were asserting things those vendors actively market:
 *
 *   Tenzo          "No purchasing module", "No reservation intelligence"
 *   Restaurant365  "No AI-powered insights", "No benchmark data"
 *   MarketMan      "No labor analytics"
 *   Nory           "Higher price point" — against a price we do not publish
 *   five entries   "No competitive intelligence", unsourced on every one
 *
 * Every one renders on the comparison card today, and every one is refutable
 * from the vendor's homepage in the first sales call. Peer benchmarking in
 * particular is table stakes across this set, not a differentiator: Nory,
 * Tenzo, Restaurant365 and 7shifts all market it.
 *
 * A separate defect ran the same way. Tenzo's calculator billed all three of
 * its modules whenever a Core package was selected, justified by the comment
 * "a v1.7 Core package includes every domain module" — the same false claim
 * already removed from the FAQ. A Core Foundation buyer needs two Tenzo
 * modules, not three, so we invoiced a named competitor $75/location/month for
 * an Inventory product that buyer would never purchase.
 */
import { describe, expect, it } from "vitest";

import {
  CORE_PACKAGE_SELECTION_ID,
  COMPETITOR_PRICING,
  calculateAllComparisons,
} from "../src/data/competitorPricing";
import { PACKAGE_DOMAIN_GRANTS } from "../src/data/pricing";

/** Claims established as false or unsourced, per vendor. */
const RETIRED: Record<string, RegExp[]> = {
  tenzo: [/no purchasing module/i, /no reservation intelligence/i],
  restaurant365: [/no ai-powered insights/i, /no benchmark data/i],
  marketman: [/no labor analytics/i],
  nory: [/higher price point/i, /less proven at scale/i, /less granular module selection/i],
};

describe("no vendor carries a limitation its own site disproves", () => {
  it.each(Object.keys(RETIRED))("%s", (id) => {
    const entry = COMPETITOR_PRICING[id];
    expect(entry, `${id} is not in the catalogue`).toBeTruthy();
    for (const pattern of RETIRED[id]) {
      const offending = entry.limitations.filter((l) => pattern.test(l));
      expect(offending, `${id} still claims: ${offending[0]}`).toEqual([]);
    }
  });

  it("keeps 'No competitive intelligence' only where it is structurally true", () => {
    // Power BI holds only the buyer's own tenant data; a workbook has no
    // ingestion. Both state it with a basis in cannotDoAtAnyPrice. For a vendor
    // whose own partner directory offers competitor tracking, it is not true.
    const claimants = Object.entries(COMPETITOR_PRICING)
      .filter(([, c]) => c.limitations.some((l) => /no competitive intelligence/i.test(l)))
      .map(([id]) => id)
      .sort();
    expect(claimants).toEqual(["powerbi", "spreadsheets"]);
  });

  it("never asserts a price comparison against a vendor whose price we withhold", () => {
    for (const [id, c] of Object.entries(COMPETITOR_PRICING)) {
      if (c.showPricing !== false && c.verification !== "unverified") continue;
      for (const l of c.limitations) {
        expect(
          /price|expensive|costly|cheaper|higher cost/i.test(l),
          `${id} compares on price while its own price is withheld: "${l}"`,
        ).toBe(false);
      }
    }
  });
});

describe("Tenzo is billed for what the buyer would actually need", () => {
  const tenzoAt = (pkg: keyof typeof PACKAGE_DOMAIN_GRANTS) => {
    const modules = [
      CORE_PACKAGE_SELECTION_ID,
      ...(PACKAGE_DOMAIN_GRANTS[pkg] as readonly string[]),
    ];
    return calculateAllComparisons(10, modules, 50_000, {
      monthlyRevenuePerLocation: 100_000,
    }).find((c) => c.competitor.id === "tenzo")!;
  };

  it("charges fewer modules to a package that overlaps less", () => {
    // Foundation grants no inventory, so the third Tenzo module is not in play.
    expect(tenzoAt("core_foundation").competitorCost.monthly).toBeLessThan(
      tenzoAt("core_margin").competitorCost.monthly,
    );
  });

  it("charges the same to two packages with the same overlap", () => {
    // Margin and Performance both grant inventory, labour and revenue.
    expect(tenzoAt("core_margin").competitorCost.monthly).toBe(
      tenzoAt("core_performance").competitorCost.monthly,
    );
  });

  it("never bills more modules than Tenzo sells", () => {
    const sellable = COMPETITOR_PRICING.tenzo.coversDomains.length;
    for (const pkg of Object.keys(PACKAGE_DOMAIN_GRANTS) as Array<
      keyof typeof PACKAGE_DOMAIN_GRANTS
    >) {
      const monthly = tenzoAt(pkg).competitorCost.monthly;
      expect(monthly).toBeLessThanOrEqual(sellable * 75 * 10);
    }
  });

  it("keeps the two domain lists in agreement", () => {
    // The calculator's list and the coverage list disagreed: one drove the
    // price, the other drove the argument.
    expect([...COMPETITOR_PRICING.tenzo.coversDomains].sort()).toEqual(
      ["inventory", "labor", "revenue"].sort(),
    );
  });
});
