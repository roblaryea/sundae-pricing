/**
 * Payback must use the same published setup fee as the displayed basket.
 * An unknown fee remains unknown; zero is not a substitute. Economic payback
 * uses the actual formula without an invented minimum duration.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { calculateRoiEconomics } from "../src/lib/roiEconomics";
import { resolveImplementationClass } from "../src/lib/discoveryEngine";
import { implementationClasses } from "../src/data/pricing";

describe("the discovery answers resolve a real implementation fee", () => {
  it("returns a chargeable fee once the visitor names their systems", () => {
    const est = resolveImplementationClass(["pos_standard"], []);
    expect(est.fee).toBeGreaterThan(0);
    expect(est.classId).toBeTruthy();
  });

  it("grades a harder stack above a simpler one", () => {
    const simple = resolveImplementationClass(["pos_standard"], []);
    const complex = resolveImplementationClass(["pos_multiple", "accounting"], []);
    expect(complex.fee).toBeGreaterThan(simple.fee);
  });

  it("still marks a 'not sure' answer as indicative rather than firm", () => {
    const unsure = resolveImplementationClass(["not_sure"], []);
    expect(unsure.isIndicative).toBe(true);
  });

  it("produces fees that differ, so payback has something to vary on", () => {
    const fees = new Set(
      [
        ["pos_standard"],
        ["pos_standard", "accounting"],
        ["pos_multiple", "accounting", "payroll_hr"],
      ].map((stack) => resolveImplementationClass(stack as never, []).fee),
    );
    expect(fees.size, "every stack resolves to the same fee").toBeGreaterThan(1);
  });
});

describe("the ROI step uses the implementation fee on the buyer basket", () => {
  const SRC = readFileSync("src/components/PricingDisplay/ROISimulator.tsx", "utf8");
  it("reads the same published setup fee as the quote", () => {
    expect(SRC).toContain('pricing.implementation.fee');
    expect(SRC).toContain('pricing.implementation.requiresScoping');
    expect(SRC).toMatch(/roiInputs,\s*pricing\.monthly,\s*implementationCost/);
  });
  it("does not replace the published quote with a discovery estimate", () => {
    expect(SRC).not.toContain('resolveImplementationClass');
  });
});

describe("payback is calculated rather than floored", () => {
  it("distinguishes zero, unknown, small and large setup fees", () => {
    expect(calculateRoiEconomics(2000, 1000, 0).paybackDays).toBe(0);
    expect(calculateRoiEconomics(2000, 1000, null).paybackDays).toBeNull();
    expect(calculateRoiEconomics(2000, 1000, 100).paybackDays).toBe(4);
    expect(calculateRoiEconomics(2000, 1000, 7500).paybackDays).toBe(229);
  });
  it("keeps the published implementation ladder", () => {
    const fees = Object.values(implementationClasses).map(c => c.fee);
    expect(Math.max(...fees)).toBeGreaterThan(1000);
  });
});
