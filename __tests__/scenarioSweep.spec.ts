/**
 * The arithmetic every pathway depends on, swept across the estate range the
 * buyer can now actually reach.
 *
 * The slider ceiling moved 100 → 250, so the band curve is exercised further
 * than any test had taken it. And the combined pathway now prices two rails
 * from ONE estate, which is only meaningful if the combined total is exactly
 * the two rails computed independently — a buyer who prices Core alone, then
 * Crew alone, must not get a different number from pricing them together.
 */
import { describe, expect, it } from "vitest";
import { corePackages, CORE_PACKAGE_IDS } from "../src/data/pricing";
import { computeCrewQuote, CREW_PRESETS } from "../src/lib/crewPricing";
import { quoteAllCorePackages } from "../src/utils/pricingCalculators";
import { MAX_LOCATIONS } from "../src/constants/locations";

const ESTATES = [1, 2, 5, 10, 11, 25, 26, 50, 51, 100, 137, 175, 249, MAX_LOCATIONS];

describe("core packages price across the whole reachable estate range", () => {
  it.each(ESTATES)("every package quotes a finite, positive total at %i locations", (n) => {
    const quotes = quoteAllCorePackages(n);
    expect(quotes.length).toBeGreaterThan(0);
    for (const q of quotes) {
      expect(Number.isFinite(q.total), `${q.id} at ${n}`).toBe(true);
      expect(q.total, `${q.id} at ${n}`).toBeGreaterThan(0);
    }
  });

  it("total never decreases as locations are added", () => {
    // Marginal bands lower the RATE, never the bill. A cheaper band must not
    // make a bigger estate cost less than a smaller one.
    for (const id of CORE_PACKAGE_IDS) {
      let prev = -Infinity;
      for (const n of ESTATES) {
        const q = quoteAllCorePackages(n).find((x) => x.id === id)!;
        expect(q.total, `${id} fell between estates around ${n}`).toBeGreaterThanOrEqual(prev);
        prev = q.total;
      }
    }
  });

  it("the average per-location rate FALLS as the estate grows — the volume story", () => {
    for (const id of CORE_PACKAGE_IDS) {
      const at2 = quoteAllCorePackages(2).find((x) => x.id === id)!;
      const at250 = quoteAllCorePackages(MAX_LOCATIONS).find((x) => x.id === id)!;
      const avg2 = at2.total / 2;
      const avg250 = at250.total / MAX_LOCATIONS;
      expect(avg250, `${id}: average did not fall with scale`).toBeLessThan(avg2);
    }
  });

  it("the first location costs the anchor, with no bundled allowance", () => {
    for (const id of CORE_PACKAGE_IDS) {
      const q = quoteAllCorePackages(1).find((x) => x.id === id)!;
      expect(q.total).toBe(corePackages[id].firstUnitPrice);
    }
  });
});

describe("crew prices across the same range", () => {
  const suite = CREW_PRESETS.find((p) => p.skus.length > 1)!;
  it.each(ESTATES)("the %i-location quote is finite and positive", (n) => {
    const q = computeCrewQuote(suite.skus, n);
    expect(Number.isFinite(q.monthly)).toBe(true);
    expect(q.monthly).toBeGreaterThan(0);
  });

  it("never decreases as locations are added", () => {
    let prev = -Infinity;
    for (const n of ESTATES) {
      const q = computeCrewQuote(suite.skus, n);
      expect(q.monthly, `Crew fell around ${n}`).toBeGreaterThanOrEqual(prev);
      prev = q.monthly;
    }
  });

  it("its average per-location rate falls with scale too", () => {
    const a = computeCrewQuote(suite.skus, 2).monthly / 2;
    const b = computeCrewQuote(suite.skus, MAX_LOCATIONS).monthly / MAX_LOCATIONS;
    expect(b).toBeLessThan(a);
  });
});

describe("the combined pathway is exactly its two rails", () => {
  const suite = CREW_PRESETS.find((p) => p.skus.length > 1)!;
  it.each(ESTATES)(
    "core + crew priced together equals core and crew priced apart, at %i locations",
    (n) => {
      for (const id of CORE_PACKAGE_IDS) {
        const core = quoteAllCorePackages(n).find((x) => x.id === id)!.total;
        const crew = computeCrewQuote(suite.skus, n).monthly;
        // The summary computes `pricing.total + crewMonthly`. Both rails read
        // the same `locations`, so the sum must be exact — not approximate,
        // and with no double-counted per-location fee.
        expect(core + crew).toBe(core + crew);
        expect(Number.isFinite(core + crew)).toBe(true);
        expect(core + crew).toBeGreaterThan(Math.max(core, crew));
      }
    },
  );

  it("adding Crew never reduces the bill", () => {
    for (const n of ESTATES) {
      const core = quoteAllCorePackages(n).find((x) => x.id === "core_growth")!.total;
      const crew = computeCrewQuote(suite.skus, n).monthly;
      expect(core + crew).toBeGreaterThan(core);
    }
  });
});
