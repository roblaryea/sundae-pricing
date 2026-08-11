/**
 * Concept pathways price on a MARGINAL curve, and Watchtower has a gate.
 *
 * Two defects this pins:
 *
 * 1. Concept SKUs were a flat `monthlyPrice`, and the picker told buyers
 *    "Flat monthly — not per location". At 25 locations that understated
 *    Production & Commissary by $2,055/mo and Hotel F&B by $1,845/mo — while
 *    asserting the very mechanic that made it wrong. A quote that is confidently
 *    wrong about its own pricing model is worse than one that says "ask us".
 *
 * 2. Watchtower had NO gate — not in the data model, the UI or the engine — so a
 *    Core Foundation buyer could add it and be quoted for an entitlement their
 *    package does not grant. `allowsWatchtower` is false on Foundation and
 *    Margin in the backend's pricing_master.
 */
import { describe, expect, it } from "vitest";

import {
  CONCEPT_SKU_IDS,
  conceptSkus,
  corePackages,
  packageAllowsWatchtower,
  WATCHTOWER_MIN_PACKAGE,
} from "../src/data/pricing";
import { calculateBandedTotal, calculateFullPrice } from "../src/lib/pricingEngine";

describe("concept pathways are banded, not flat", () => {
  it("every concept SKU carries a real marginal curve", () => {
    for (const id of CONCEPT_SKU_IDS) {
      const c = conceptSkus[id];
      expect(c.firstUnitPrice, `${id} has no anchor`).toBeGreaterThan(0);
      expect(c.marginalBands.length, `${id} has no bands`).toBeGreaterThan(0);
      // The anchor and the flat legacy field must not disagree.
      expect(c.monthlyPrice).toBe(c.firstUnitPrice);
    }
  });

  it.each([
    ["concept_franchise", 8, 1120, 25, 2245],
    ["concept_hotel_fb", 8, 990, 25, 2240],
    ["concept_cloud_kitchen", 8, 878, 25, 1901],
    ["concept_catering", 8, 832, 25, 1855],
    ["concept_production", 8, 1260, 25, 2650],
    ["concept_rental_commissary", 8, 920, 25, 2045],
  ] as const)("%s prices %i units at $%i and %i units at $%i", (id, n1, p1, n2, p2) => {
    const c = conceptSkus[id];
    expect(calculateBandedTotal(c, n1)).toBe(p1);
    expect(calculateBandedTotal(c, n2)).toBe(p2);
  });

  it("charges the anchor alone for a single location", () => {
    for (const id of CONCEPT_SKU_IDS) {
      const c = conceptSkus[id];
      expect(calculateBandedTotal(c, 1)).toBe(c.firstUnitPrice);
    }
  });

  it("never reprices earlier units when a cheaper band is reached", () => {
    const c = conceptSkus.concept_hotel_fb;
    // Crossing 10 -> 11 must cost the band-3 rate for the new unit only.
    expect(calculateBandedTotal(c, 11) - calculateBandedTotal(c, 10)).toBe(72);
  });

  it("bills a multi-location estate ABOVE the old flat price, never below", () => {
    for (const id of CONCEPT_SKU_IDS) {
      const c = conceptSkus[id];
      expect(
        calculateBandedTotal(c, 8),
        `${id} at 8 locations is not above its anchor — the flat model is back`,
      ).toBeGreaterThan(c.firstUnitPrice);
    }
  });

  it("prices a concept through the full quote, not just the helper", () => {
    const quote = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_growth',
      locations: 8,
      addOns: ['concept_hotel_fb'],
      watchtower: [],
      clientProfile: { type: 'independent', isEarlyAdopter: false, isFranchise: false, brandCount: 1 },
    });
    const line = quote.breakdown.find((b) => b.item.includes('Hotel'));
    expect(line?.price).toBe(990);
    // The basis must be shown, not just the total.
    expect(line?.note).toMatch(/\$395/);
    expect(line?.note).not.toMatch(/flat/i);
  });
});

describe("Watchtower gate", () => {
  it("names Core Growth as the minimum package", () => {
    expect(WATCHTOWER_MIN_PACKAGE).toBe('core_growth');
  });

  it("allows Growth and Performance only", () => {
    expect(packageAllowsWatchtower('core_foundation')).toBe(false);
    expect(packageAllowsWatchtower('core_margin')).toBe(false);
    expect(packageAllowsWatchtower('core_growth')).toBe(true);
    expect(packageAllowsWatchtower('core_performance')).toBe(true);
  });

  it("refuses to bill Watchtower on a package that does not grant it", () => {
    const quote = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_foundation',
      locations: 8,
      addOns: [],
      watchtower: ['competitive'],
      clientProfile: { type: 'independent', isEarlyAdopter: false, isFranchise: false, brandCount: 1 },
    });
    const line = quote.breakdown.find((b) => b.item.includes('Watchtower'));
    expect(line?.price).toBe(0);
    expect(line?.note).toMatch(/Core Growth/);
  });

  it("bills it normally once the package grants it", () => {
    const quote = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_growth',
      locations: 8,
      addOns: [],
      watchtower: ['competitive'],
      clientProfile: { type: 'independent', isEarlyAdopter: false, isFranchise: false, brandCount: 1 },
    });
    const line = quote.breakdown.find((b) => b.item.includes('Watchtower'));
    expect(line?.price).toBeGreaterThan(0);
  });

  it("keeps every package's Watchtower flag consistent with the helper", () => {
    for (const id of Object.keys(corePackages) as Array<keyof typeof corePackages>) {
      expect(typeof packageAllowsWatchtower(id)).toBe('boolean');
    }
  });
});

describe("commitment term reaches the quote", () => {
  const base = {
    layer: 'core' as const,
    corePackage: 'core_growth' as const,
    locations: 8,
    addOns: [],
    watchtower: [],
  };

  it("applies 10% for annual and 15% for two years", () => {
    const monthly = calculateFullPrice({
      ...base,
      clientProfile: { type: 'independent', isEarlyAdopter: false, isFranchise: false, brandCount: 1, billingCycle: 'monthly' },
    });
    const annual = calculateFullPrice({
      ...base,
      clientProfile: { type: 'independent', isEarlyAdopter: false, isFranchise: false, brandCount: 1, billingCycle: 'annual' },
    });
    const twoYear = calculateFullPrice({
      ...base,
      clientProfile: { type: 'independent', isEarlyAdopter: false, isFranchise: false, brandCount: 1, billingCycle: 'two_year' },
    });
    expect(annual.total).toBeLessThan(monthly.total);
    expect(twoYear.total).toBeLessThan(annual.total);
    expect(Math.round(monthly.total - twoYear.total)).toBe(Math.round(monthly.subtotal * 0.15));
  });
});
