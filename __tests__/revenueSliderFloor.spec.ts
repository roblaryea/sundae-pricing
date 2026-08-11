/**
 * The revenue slider must not open onto a purchase that cannot pay for itself.
 *
 * The floor was $50,000/location/month. Core Foundation is $1,195 for a single
 * location and breaks even at roughly $73,000 of monthly revenue per site, so
 * every slider position between $50k and $73k modelled a Core purchase that
 * loses money — reachable in one drag of the FIRST control on the step. A sweep
 * of 103,680 reachable configurations found 6,603 that never pay back, and the
 * worst of them sat exactly there: single site, Foundation, slider at the floor,
 * net -$537/month.
 *
 * The floor is now $75,000, which puts the whole slider inside the range where a
 * Core package is a rational purchase. This is a bound on what the SIMULATOR
 * models, not a claim that smaller operators are unwelcome — below it the
 * fitting products are Profit Snapshot and Crew Starter.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import {
  MAX_MONTHLY_REVENUE_PER_LOCATION,
  MIN_MONTHLY_REVENUE_PER_LOCATION,
  clampMonthlyRevenue,
} from "../src/hooks/useROICalculation";
import { calculateCorePackagePrice } from "../src/lib/pricingEngine";

describe("the modelled revenue range", () => {
  it("starts at $75,000 per location", () => {
    expect(MIN_MONTHLY_REVENUE_PER_LOCATION).toBe(75_000);
  });

  it("starts above Core Foundation's single-site break-even", () => {
    // Foundation at one location, against the ~3.5% of revenue the savings
    // model produces for a typical site. Below this the purchase cannot pay
    // for itself no matter what else the visitor enters.
    const foundationMonthly = calculateCorePackagePrice("core_foundation", 1);
    const breakEvenRevenue = foundationMonthly / 0.035;
    expect(
      MIN_MONTHLY_REVENUE_PER_LOCATION,
      `floor $${MIN_MONTHLY_REVENUE_PER_LOCATION} sits below the $${Math.round(
        breakEvenRevenue,
      )} break-even`,
    ).toBeGreaterThanOrEqual(breakEvenRevenue);
  });

  it("still spans a wide enough range to be useful", () => {
    expect(MAX_MONTHLY_REVENUE_PER_LOCATION).toBeGreaterThan(
      MIN_MONTHLY_REVENUE_PER_LOCATION * 5,
    );
  });
});

describe("clampMonthlyRevenue", () => {
  it("lifts a persisted figure from below the old floor", () => {
    // A visitor who configured $50,000 before the floor moved must not keep
    // modelling a number the slider can no longer express.
    expect(clampMonthlyRevenue(50_000)).toBe(MIN_MONTHLY_REVENUE_PER_LOCATION);
  });

  it("caps above the ceiling", () => {
    expect(clampMonthlyRevenue(9_000_000)).toBe(MAX_MONTHLY_REVENUE_PER_LOCATION);
  });

  it("leaves an in-range figure untouched", () => {
    expect(clampMonthlyRevenue(100_000)).toBe(100_000);
    expect(clampMonthlyRevenue(MIN_MONTHLY_REVENUE_PER_LOCATION)).toBe(
      MIN_MONTHLY_REVENUE_PER_LOCATION,
    );
    expect(clampMonthlyRevenue(MAX_MONTHLY_REVENUE_PER_LOCATION)).toBe(
      MAX_MONTHLY_REVENUE_PER_LOCATION,
    );
  });

  it("survives a corrupt persisted value rather than propagating NaN", () => {
    expect(clampMonthlyRevenue(Number.NaN)).toBe(MIN_MONTHLY_REVENUE_PER_LOCATION);
    expect(clampMonthlyRevenue(Number.POSITIVE_INFINITY)).toBe(
      MAX_MONTHLY_REVENUE_PER_LOCATION,
    );
  });
});

describe("the slider reads its bounds from the constants", () => {
  const SRC = readFileSync("src/components/PricingDisplay/ROISimulator.tsx", "utf8");

  it("carries no hardcoded floor that could drift from the model", () => {
    // The floor previously appeared three times in this file — once as `min`
    // and twice inside the track gradient — so moving it meant finding all of
    // them.
    expect(SRC).not.toMatch(/min="50000"/);
    expect(SRC).not.toMatch(/\b50000\b/);
  });

  it("binds the input to the exported constants", () => {
    expect(SRC).toMatch(/min=\{MIN_MONTHLY_REVENUE_PER_LOCATION\}/);
    expect(SRC).toMatch(/max=\{MAX_MONTHLY_REVENUE_PER_LOCATION\}/);
  });
});
