/**
 * Payback must be a measurement, not a constant.
 *
 * A sweep found the payback tile printing exactly "14 days" on 100.00% of
 * paying configurations — the same answer for a $1,195/mo single site and a
 * $78,576/mo hundred-site estate. It was not computing anything.
 *
 * Root cause, and it is two layers deep:
 *
 *   1. Every Core package publishes `implementationClass: null`, and
 *      `resolveImplementationFee` raises `requiresScoping` if ANY selected SKU
 *      lacks a class. So every Core quote is "scoped at contract".
 *   2. `ROISimulator` then passed `requiresScoping ? 0 : fee` as the one-time
 *      cost — always 0 — so payback collapsed to `GUARDRAILS.minPaybackDays`.
 *
 * The buyer had usually already told us. The discovery step asks which systems
 * they run, and `resolveImplementationClass` grades that into a real class —
 * the same resolution ConfigSummary and the competitor card already used to
 * QUOTE the fee. The ROI step simply was not reading it, so payback ignored a
 * charge the quote on the next screen went on to make.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { GUARDRAILS } from "../src/hooks/useROICalculation";
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

describe("the ROI step reads that fee", () => {
  const SRC = readFileSync("src/components/PricingDisplay/ROISimulator.tsx", "utf8");

  it("resolves the implementation class from the discovery answers", () => {
    expect(SRC).toMatch(/resolveImplementationClass\(/);
    expect(SRC).toMatch(/stackEstimate/);
  });

  it("no longer passes a bare zero as the one-time cost", () => {
    // The defect in one line: `requiresScoping ? 0 : fee` with requiresScoping
    // always true on a Core quote.
    const collapsed = SRC.split("\n").filter((l) =>
      /pricing\.implementation\.requiresScoping \? 0 : pricing\.implementation\.fee,\s*\)/.test(l),
    );
    expect(collapsed, "the ROI step still zeroes the one-time cost").toEqual([]);
  });

  it("prefers the discovery estimate over the per-SKU resolution", () => {
    expect(SRC).toMatch(/stackEstimate\s*\n?\s*\?\s*stackEstimate\.fee/);
  });
});

describe("a floored payback stays possible but must not be universal", () => {
  it("keeps the 14-day floor, which was never the bug", () => {
    // The floor is a legitimate guard against claiming a 3-day payback. The bug
    // was that every input reached it.
    expect(GUARDRAILS.minPaybackDays).toBe(14);
  });

  it("has implementation classes expensive enough to move payback off the floor", () => {
    // If every class were trivially small the fix would be cosmetic.
    const fees = Object.values(implementationClasses)
      .map((c) => c.fee)
      .filter((f) => f > 0);
    expect(fees.length).toBeGreaterThan(0);
    expect(Math.max(...fees)).toBeGreaterThan(1_000);
  });
});
