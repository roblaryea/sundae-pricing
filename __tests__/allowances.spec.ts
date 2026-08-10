/**
 * Included allowances — AI credits and active-intelligence seats.
 *
 * The simulator rendered `pkg.aiCreditWallet` raw, so the tier cards and the
 * comparison table showed the BASE wallet no matter how many locations the
 * visitor had configured. An 8-location Core Foundation buyer was shown 14,000
 * credits against a real 36,400 — on a card that printed "8 locations ·
 * $2,420/mo" two lines above. Seats were not shown at all.
 *
 * The rule is price book v1.7 section 8.1, and it matches the backend exactly:
 * `billing_service.ts` computes `base + perLocation * activeLocations`, and
 * `pricing_engine.ts` documents that credits "scale with EVERY licensed
 * location, not additional-after-first".
 */
import { describe, expect, it } from "vitest";

import { calculateAiCredits, calculateIntelligenceSeats } from "../src/lib/pricingEngine";
import { corePackages } from "../src/data/pricing";

const PACKAGES = Object.values(corePackages);

describe("calculateAiCredits", () => {
  it("scales with EVERY licensed location, including the first", () => {
    const f = corePackages.core_foundation;
    expect(calculateAiCredits(f, 1)).toBe(14_000 + 2_800);
    expect(calculateAiCredits(f, 8)).toBe(36_400);
    expect(calculateAiCredits(f, 10)).toBe(42_000);
  });

  it("never returns the bare base wallet for a multi-location estate", () => {
    for (const pkg of PACKAGES) {
      expect(
        calculateAiCredits(pkg, 8),
        `${pkg.name} at 8 locations returned its base wallet`,
      ).toBeGreaterThan(pkg.aiCreditWallet);
    }
  });

  it.each([
    ["core_foundation", 14_000, 2_800],
    ["core_margin", 16_000, 3_200],
    ["core_growth", 18_000, 3_600],
    ["core_performance", 24_000, 4_800],
  ] as const)("%s carries the v1.7 wallet %i + %i per location", (id, base, per) => {
    const pkg = corePackages[id];
    expect(pkg.aiCreditWallet).toBe(base);
    expect(pkg.aiCreditsPerLocation).toBe(per);
    expect(calculateAiCredits(pkg, 25)).toBe(base + per * 25);
  });

  it("treats a zero or fractional estate as one licensed location", () => {
    const f = corePackages.core_foundation;
    expect(calculateAiCredits(f, 0)).toBe(calculateAiCredits(f, 1));
    expect(calculateAiCredits(f, 1.9)).toBe(calculateAiCredits(f, 1));
  });

  it("rises monotonically with estate size", () => {
    for (const pkg of PACKAGES) {
      let prev = 0;
      for (const n of [1, 2, 5, 10, 25, 50, 100]) {
        const v = calculateAiCredits(pkg, n);
        expect(v).toBeGreaterThan(prev);
        prev = v;
      }
    }
  });
});

describe("calculateIntelligenceSeats", () => {
  it("is seatsIncluded + ceil(units / divisor)", () => {
    // Foundation: 4 included, one more per 5 locations.
    expect(calculateIntelligenceSeats(corePackages.core_foundation, 1)).toBe(5);
    expect(calculateIntelligenceSeats(corePackages.core_foundation, 5)).toBe(5);
    expect(calculateIntelligenceSeats(corePackages.core_foundation, 8)).toBe(6);
    expect(calculateIntelligenceSeats(corePackages.core_foundation, 10)).toBe(6);
    expect(calculateIntelligenceSeats(corePackages.core_foundation, 11)).toBe(7);
  });

  it.each([
    ["core_foundation", 4, 5],
    ["core_margin", 5, 4],
    ["core_growth", 6, 3],
    ["core_performance", 8, 2],
  ] as const)("%s includes %i seats, one more per %i locations", (id, inc, div) => {
    const pkg = corePackages[id];
    expect(pkg.seatsIncluded).toBe(inc);
    expect(pkg.seatsPerLocations).toBe(div);
  });

  it("gives a bigger package at least as many seats at the same size", () => {
    const order = [
      corePackages.core_foundation,
      corePackages.core_margin,
      corePackages.core_growth,
      corePackages.core_performance,
    ];
    for (const n of [1, 8, 25, 60]) {
      for (let i = 1; i < order.length; i++) {
        expect(calculateIntelligenceSeats(order[i], n)).toBeGreaterThanOrEqual(
          calculateIntelligenceSeats(order[i - 1], n),
        );
      }
    }
  });
});

describe("rollover cap", () => {
  it("is 25% of the BASE wallet, not of the scaled allowance", () => {
    for (const pkg of PACKAGES) {
      expect(pkg.creditRolloverCap).toBe(pkg.aiCreditWallet * 0.25);
    }
  });
});
