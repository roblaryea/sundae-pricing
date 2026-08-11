/**
 * What each Core package actually grants — and what the ROI may credit.
 *
 * Every package pointed at CORE_DOMAIN_MODULE_IDS, so all four granted all
 * eleven domains and differed only by price, credits and seats. Two things
 * followed from that:
 *
 *   1. The ladder had no rationale. Nobody pays $2,980 for Core Performance
 *      when Core Foundation gives identical coverage at $1,195, so the tier
 *      cards were selling a difference that did not exist.
 *   2. The ROI model credited savings from every domain regardless of package.
 *      At eight locations and $200k monthly revenue per location, a Core
 *      Foundation buyer was shown $234,400/mo of savings against the $24,000
 *      their four granted domains can actually deliver — an 877% overstatement.
 *
 * Price book v1.7 section 3.1: Foundation and Growth deliberately receive the
 * governed labour and cost SIGNAL needed to compute profit without the full
 * Inventory and Purchasing experience. That signal-versus-experience boundary
 * is what the ladder sells.
 */
import { describe, expect, it } from "vitest";

import {
  CORE_DOMAIN_MODULE_IDS,
  PACKAGE_DOMAIN_GRANTS,
  corePackages,
} from "../src/data/pricing";

const ORDER = ["core_foundation", "core_margin", "core_growth", "core_performance"] as const;

describe("package domain grants", () => {
  it("matches the canonical counts: 4 / 6 / 8 / 11", () => {
    expect(PACKAGE_DOMAIN_GRANTS.core_foundation).toHaveLength(4);
    expect(PACKAGE_DOMAIN_GRANTS.core_margin).toHaveLength(6);
    expect(PACKAGE_DOMAIN_GRANTS.core_growth).toHaveLength(8);
    expect(PACKAGE_DOMAIN_GRANTS.core_performance).toHaveLength(CORE_DOMAIN_MODULE_IDS.length);
  });

  it("gives the four packages DIFFERENT coverage — otherwise the ladder is irrational", () => {
    const shapes = new Set(ORDER.map((id) => [...corePackages[id].includesDomainModules].sort().join(",")));
    expect(
      shapes.size,
      "two or more packages grant identical domains; the price difference sells nothing",
    ).toBe(ORDER.length);
  });

  it("never shrinks as the package gets more expensive", () => {
    for (let i = 1; i < ORDER.length; i += 1) {
      const prev = corePackages[ORDER[i - 1]];
      const cur = corePackages[ORDER[i]];
      expect(
        cur.includesDomainModules.length,
        `${cur.name} grants fewer domains than ${prev.name}`,
      ).toBeGreaterThan(prev.includesDomainModules.length);
      expect(cur.firstUnitPrice).toBeGreaterThan(prev.firstUnitPrice);
    }
  });

  it("grants only domains that exist in the catalogue", () => {
    for (const id of ORDER) {
      for (const m of corePackages[id].includesDomainModules) {
        expect(CORE_DOMAIN_MODULE_IDS as readonly string[]).toContain(m);
      }
    }
  });

  it("keeps the cost-side experience out of Foundation and Growth", () => {
    // The signal-versus-experience boundary: labour and profit signal without
    // the full Inventory/Purchasing experience.
    for (const id of ["core_foundation", "core_growth"] as const) {
      const mods = corePackages[id].includesDomainModules as readonly string[];
      expect(mods).toContain("labor");
      expect(mods).toContain("profit");
      expect(mods).not.toContain("inventory");
      expect(mods).not.toContain("purchasing");
    }
  });

  it("gives Margin the cost side and Growth the demand side", () => {
    const margin = corePackages.core_margin.includesDomainModules as readonly string[];
    const growth = corePackages.core_growth.includesDomainModules as readonly string[];
    expect(margin).toContain("inventory");
    expect(margin).toContain("purchasing");
    expect(growth).toContain("marketing");
    expect(growth).toContain("reservations");
    expect(growth).toContain("guest_crm");
  });

  it("only Performance grants everything", () => {
    for (const id of ORDER) {
      const isFull =
        corePackages[id].includesDomainModules.length === CORE_DOMAIN_MODULE_IDS.length;
      expect(isFull).toBe(id === "core_performance");
    }
  });
});
