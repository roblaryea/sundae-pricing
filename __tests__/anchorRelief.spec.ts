/**
 * The anchor glide, and the two properties that make it worth having.
 *
 * It must self-target — worth a lot to a small estate and almost nothing to a
 * large one, because the anchor is 63% of a five-site bill and 4% of a 250-site
 * one. And it must never produce the renewal cliff a flat expiring discount
 * does: 50%-then-list is a +46% increase at month 13 for a five-site group.
 */
import { describe, expect, it } from "vitest";
import {
  ANCHOR_RELIEF_GLIDE,
  anchorReliefSchedule,
  coreAnchor,
  crewAnchor,
} from "../src/lib/anchorRelief";
import { corePackages, crewBundles } from "../src/data/pricing";

const schedule = (anchorTotal: number, recurringTotal: number, locations: number) =>
  anchorReliefSchedule({ anchorTotal, recurringTotal, locations });

describe("the glide", () => {
  it("runs 75 / 50 / 25 / 0 and ends at list", () => {
    expect([...ANCHOR_RELIEF_GLIDE]).toEqual([0.75, 0.5, 0.25, 0]);
    expect(ANCHOR_RELIEF_GLIDE[ANCHOR_RELIEF_GLIDE.length - 1]).toBe(0);
  });

  it("reaches list price in the final year, never above it", () => {
    const rows = schedule(2424, 3231, 10);
    const list = 2424 + 3231;
    expect(rows[rows.length - 1].monthly).toBe(list);
    for (const r of rows) expect(r.monthly).toBeLessThanOrEqual(list);
  });

  it("only ever discounts the anchor — the recurring rails are untouched", () => {
    const recurring = 3231;
    for (const r of schedule(2424, recurring, 10)) {
      expect(r.monthly).toBeGreaterThanOrEqual(recurring);
    }
  });

  it("rises every year, and never falls", () => {
    const rows = schedule(2424, 3231, 10);
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].monthly).toBeGreaterThan(rows[i - 1].monthly);
      expect(rows[i].stepUp!).toBeGreaterThan(0);
    }
    expect(rows[0].stepUp).toBeNull();
  });
});

describe("it self-targets by estate size", () => {
  const anchors = 2424;
  it("is worth far more to a small estate than a large one", () => {
    // Same anchors, very different recurring tails.
    const small = schedule(anchors, 1436, 5)[0];
    const large = schedule(anchors, 59466, 250)[0];
    const smallSaving = 1 - small.monthly / (anchors + 1436);
    const largeSaving = 1 - large.monthly / (anchors + 59466);
    expect(smallSaving).toBeGreaterThan(0.25);
    expect(largeSaving).toBeLessThan(0.05);
    expect(smallSaving).toBeGreaterThan(largeSaving * 5);
  });

  it("keeps the step-up small exactly where the deal is large", () => {
    const large = schedule(anchors, 59466, 250);
    for (const r of large.slice(1)) expect(r.stepUp!).toBeLessThan(0.02);
  });

  it("beats a flat 50%-then-list cliff on the worst step-up", () => {
    const anchorsOnly = 2424;
    const recurring = 1436; // 5 sites
    const glideWorst = Math.max(
      ...schedule(anchorsOnly, recurring, 5)
        .slice(1)
        .map((r) => r.stepUp!),
    );
    const list = anchorsOnly + recurring;
    const cliffYear1 = anchorsOnly * 0.5 + recurring;
    const cliffWorst = list / cliffYear1 - 1;
    expect(glideWorst).toBeLessThan(cliffWorst);
  });
});

describe("anchors are read from the catalogue, not retyped", () => {
  it("takes the Core anchor from the package", () => {
    expect(coreAnchor("core_growth")).toBe(corePackages.core_growth.firstUnitPrice);
    expect(coreAnchor(null)).toBe(0);
  });

  it("uses the BUNDLE anchor when a bundle is detected, not the sum of its SKUs", () => {
    // A bundle replaces its SKUs on the quote. Summing both would bill a first
    // unit twice for the same rail.
    const bundleId = "crew_suite_bundle";
    const viaBundle = crewAnchor(["crew_operations", "crew_tna", "crew_payroll"], bundleId);
    const viaSkus = crewAnchor(["crew_operations", "crew_tna", "crew_payroll"], null);
    expect(viaBundle).toBe((crewBundles as any)[bundleId].firstUnitPrice);
    expect(viaBundle).toBeLessThan(viaSkus);
  });

  it("is zero when no Crew is selected", () => {
    expect(crewAnchor([], null)).toBe(0);
  });
});
