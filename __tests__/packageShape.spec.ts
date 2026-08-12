/**
 * The four Core packages are not four rungs of one ladder.
 *
 * Core Growth costs $275/month MORE than Core Margin and does not include the
 * Inventory or Purchasing modules that Margin has — it trades them for
 * Marketing, Reservations, Guest and Guest CRM. So a buyer who "upgrades" from
 * Margin to Growth LOSES the ability to manage food cost and supplier pricing,
 * and the ROI model correctly shows their modelled savings FALL as they pay
 * more: -$615/mo at one location, -$12,317/mo at twenty, because inventory and
 * purchasing carry two of the best-evidenced savings rates in the model.
 *
 * Presenting them as a ladder is what made that look like a bug. It is not a
 * bug — it is the catalogue, and the price book is untouched here. What changes
 * is that the UI now has the vocabulary to say so: Margin works the cost side,
 * Growth works the demand side, Performance does both.
 *
 * The shape is DERIVED from the grants rather than declared, so a card can
 * never claim a side its module list does not support.
 */
import { describe, expect, it } from "vitest";

import {
  CORE_PACKAGE_IDS,
  COST_SIDE_DOMAINS,
  DEMAND_SIDE_DOMAINS,
  PACKAGE_DOMAIN_GRANTS,
  corePackages,
  domainsGivenUp,
  packageShape,
} from "../src/data/pricing";
import { calculateBandedTotal } from "../src/lib/pricingEngine";

describe("each package's shape follows its grants", () => {
  it("reads Foundation as the entry point", () => {
    expect(packageShape("core_foundation")).toBe("entry");
  });

  it("reads Margin as the cost side", () => {
    expect(packageShape("core_margin")).toBe("cost_side");
  });

  it("reads Growth as the demand side", () => {
    expect(packageShape("core_growth")).toBe("demand_side");
  });

  it("reads Performance as both", () => {
    expect(packageShape("core_performance")).toBe("both_sides");
  });

  it("never claims a side the module list does not support", () => {
    for (const id of CORE_PACKAGE_IDS) {
      const granted = new Set(PACKAGE_DOMAIN_GRANTS[id] as readonly string[]);
      const shape = packageShape(id);
      const hasCost = COST_SIDE_DOMAINS.some((d) => granted.has(d));
      const hasDemand = DEMAND_SIDE_DOMAINS.some((d) => granted.has(d));
      if (shape === "cost_side") {
        expect(hasCost, `${id} claims the cost side without a cost domain`).toBe(true);
        expect(hasDemand, `${id} claims cost-side only but has demand domains`).toBe(false);
      }
      if (shape === "demand_side") {
        expect(hasDemand, `${id} claims the demand side without a demand domain`).toBe(true);
        expect(hasCost, `${id} claims demand-side only but has cost domains`).toBe(false);
      }
      if (shape === "both_sides") {
        expect(hasCost && hasDemand).toBe(true);
      }
    }
  });
});

describe("the fork is real, not a presentation choice", () => {
  it("Growth is NOT a superset of Margin", () => {
    // If it ever becomes one, the ladder framing is honest again and this
    // whole surface should be revisited.
    const margin = new Set(PACKAGE_DOMAIN_GRANTS.core_margin as readonly string[]);
    const growth = new Set(PACKAGE_DOMAIN_GRANTS.core_growth as readonly string[]);
    const lost = [...margin].filter((d) => !growth.has(d));
    expect(lost.length, "Growth now contains everything Margin has").toBeGreaterThan(0);
    expect(lost).toContain("inventory");
    expect(lost).toContain("purchasing");
  });

  it("and Growth still costs more, which is why the ladder misled", () => {
    expect(corePackages.core_growth.firstUnitPrice).toBeGreaterThan(
      corePackages.core_margin.firstUnitPrice,
    );
    // At every estate size, not just the anchor.
    for (const n of [1, 10, 25, 100]) {
      expect(calculateBandedTotal(corePackages.core_growth, n)).toBeGreaterThan(
        calculateBandedTotal(corePackages.core_margin, n),
      );
    }
  });
});

describe("what a package asks the buyer to give up", () => {
  it("names Growth's trade", () => {
    const up = domainsGivenUp("core_growth");
    expect(up).toContain("inventory");
    expect(up).toContain("purchasing");
  });

  it("names Margin's trade", () => {
    const up = domainsGivenUp("core_margin");
    expect(up).toContain("marketing");
    expect(up).toContain("reservations");
  });

  it("asks nothing of the package that grants everything", () => {
    expect(domainsGivenUp("core_performance")).toEqual([]);
  });

  it("only ever lists domains some other package actually grants", () => {
    const anywhere = new Set(
      CORE_PACKAGE_IDS.flatMap((id) => PACKAGE_DOMAIN_GRANTS[id] as readonly string[]),
    );
    for (const id of CORE_PACKAGE_IDS) {
      for (const d of domainsGivenUp(id)) {
        expect(anywhere.has(d), `${id} gives up "${d}", which no package grants`).toBe(true);
      }
    }
  });

  it("never lists a domain the package itself has", () => {
    for (const id of CORE_PACKAGE_IDS) {
      const granted = new Set(PACKAGE_DOMAIN_GRANTS[id] as readonly string[]);
      for (const d of domainsGivenUp(id)) {
        expect(granted.has(d), `${id} claims to give up "${d}", which it grants`).toBe(false);
      }
    }
  });
});
