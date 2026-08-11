/**
 * PRICE BOOK v1.7 CONFORMANCE SPEC
 *
 * Locks the approved catalog and — more importantly — the MARGINAL band
 * mechanic. The v5.1 spec this replaces asserted the retired model:
 * flat per-location rates, `baseIncludesLocations: 3`, a per-module
 * setup-fee ladder, and non-stacking discounts. All of that is gone.
 */
import {
  calculateBandedTotal, describe, expect, it } from 'vitest';
import {
  corePackages,
  CORE_PACKAGE_IDS,
  CORE_DOMAIN_MODULE_IDS,
  conceptSkus,
  foresightAction,
  implementationClasses,
  crewSkus,
  crewBundles,
  volumeDiscounts,
  billingDiscounts,
  DISCOUNT_RULES,
  ENTERPRISE_ONLY_FROM_UNITS,
  modules,
  getVolumeDiscount,
  requiresEnterpriseQuote,
  detectClientType,
  isRetiredCatalogId,
  RETIRED_CATALOG_IDS,
} from '../src/data/pricing';
import { computeCrewQuote, crewBundleSavings } from '../src/lib/crewPricing';
import { COMPETITOR_PRICING, CORE_PACKAGE_SELECTION_ID } from '../src/data/competitorPricing';
import type { CrewSkuId } from '../src/types/configuration';
import {
  calculateBandedTotal,
  calculateBandLines,
  calculateCorePackagePrice,
  calculateForesightActionPrice,
  calculateCombinedDiscount,
  calculateFullPrice,
  marginalRateForNextUnit,
  resolveImplementationFee,
} from '../src/lib/pricingEngine';

// ═══════════════════════════════════════════════════════════════════════════
// RETIRED CATALOG
// ═══════════════════════════════════════════════════════════════════════════

describe('Retired catalog ids', () => {
  it('lists exactly the five retired ids', () => {
    expect([...RETIRED_CATALOG_IDS]).toEqual([
      'report_lite',
      'report_plus',
      'report_pro',
      'core_lite',
      'core_pro',
    ]);
  });

  it('recognises retired ids so a stored subscription can still be labelled', () => {
    expect(isRetiredCatalogId('core_lite')).toBe(true);
    expect(isRetiredCatalogId('core_foundation')).toBe(false);
  });

  it('does not expose a retired id as a sellable Core package', () => {
    for (const retired of RETIRED_CATALOG_IDS) {
      expect(CORE_PACKAGE_IDS).not.toContain(retired);
    }
  });

  it('no longer exports Report tiers or Core Lite/Pro tiers', async () => {
    const pricing = await import('../src/data/pricing');
    expect('reportTiers' in pricing).toBe(false);
    expect(Object.keys(pricing.coreTiers)).toEqual(['enterprise']);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CORE PACKAGES — anchors and bands
// ═══════════════════════════════════════════════════════════════════════════

const EXPECTED_PACKAGES = {
  core_foundation: { name: 'Core Foundation', anchor: 1195, bands: [175, 150, 125, 105], wallet: 14000 },
  core_margin: { name: 'Core Margin', anchor: 1650, bands: [245, 210, 175, 145], wallet: 16000 },
  core_growth: { name: 'Core Growth', anchor: 1925, bands: [260, 225, 190, 155], wallet: 18000 },
  core_performance: { name: 'Core Performance', anchor: 2980, bands: [409, 348, 290, 236], wallet: 24000 },
} as const;

describe('Core packages', () => {
  it('offers exactly the four v1.7 packages', () => {
    expect(CORE_PACKAGE_IDS).toEqual([
      'core_foundation',
      'core_margin',
      'core_growth',
      'core_performance',
    ]);
  });

  for (const [id, expected] of Object.entries(EXPECTED_PACKAGES)) {
    describe(expected.name, () => {
      const pkg = corePackages[id as keyof typeof corePackages];

      it(`is named ${expected.name}`, () => {
        expect(pkg.name).toBe(expected.name);
      });

      it(`anchors the first unit at $${expected.anchor}`, () => {
        expect(pkg.firstUnitPrice).toBe(expected.anchor);
      });

      it('carries four marginal bands starting at unit 2', () => {
        expect(pkg.marginalBands).toHaveLength(4);
        expect(pkg.marginalBands[0].fromUnit).toBe(2);
        expect(pkg.marginalBands.map((b) => b.pricePerUnit)).toEqual([...expected.bands]);
      });

      it('bands cover 2-10 / 11-25 / 26-50 / 51+', () => {
        expect(pkg.marginalBands.map((b) => [b.fromUnit, b.toUnit])).toEqual([
          [2, 10],
          [11, 25],
          [26, 50],
          [51, null],
        ]);
      });

      it(`includes a ${expected.wallet} AI credit wallet`, () => {
        expect(pkg.aiCreditWallet).toBe(expected.wallet);
      });

      it('includes all eleven Core domain modules', () => {
        expect(pkg.includesDomainModules).toHaveLength(11);
        expect([...pkg.includesDomainModules]).toEqual([...CORE_DOMAIN_MODULE_IDS]);
      });

      it('has no "included locations" allowance', () => {
        expect(pkg).not.toHaveProperty('baseIncludesLocations');
        expect(pkg).not.toHaveProperty('perLocationPrice');
        expect(pkg).not.toHaveProperty('additionalLocationPrice');
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MARGINAL BAND MATH — the thing v5.1 got wrong
// ═══════════════════════════════════════════════════════════════════════════

describe('Marginal band math', () => {
  it('prices a single location at the anchor', () => {
    expect(calculateCorePackagePrice('core_foundation', 1)).toBe(1195);
  });

  it('matches the worked example: 5 Core Foundation = 1195 + 4x175 = 1895', () => {
    expect(calculateCorePackagePrice('core_foundation', 5)).toBe(1895);
  });

  it('averages $379 per location at 5 Core Foundation locations', () => {
    expect(calculateCorePackagePrice('core_foundation', 5) / 5).toBe(379);
  });

  it('does NOT reprice earlier units when a cheaper band is reached', () => {
    // 11 units: anchor + 9 units at 175 (band 2-10) + 1 unit at 150 (band 11-25).
    // A retroactive model would charge 1195 + 10 x 150 = 2695.
    expect(calculateCorePackagePrice('core_foundation', 11)).toBe(1195 + 9 * 175 + 1 * 150);
    expect(calculateCorePackagePrice('core_foundation', 11)).not.toBe(1195 + 10 * 150);
  });

  it('spans every band correctly at 60 units', () => {
    const expected = 1195 + 9 * 175 + 15 * 150 + 25 * 125 + 10 * 105;
    expect(calculateCorePackagePrice('core_foundation', 60)).toBe(expected);
  });

  it('is strictly monotonic — each extra location costs more in total', () => {
    for (let units = 1; units < 120; units += 1) {
      expect(calculateCorePackagePrice('core_growth', units + 1)).toBeGreaterThan(
        calculateCorePackagePrice('core_growth', units),
      );
    }
  });

  it('never produces a flat per-location rate', () => {
    const at5 = calculateCorePackagePrice('core_margin', 5) / 5;
    const at50 = calculateCorePackagePrice('core_margin', 50) / 50;
    expect(at5).not.toBe(at50);
  });

  it('reports the correct band lines', () => {
    const lines = calculateBandLines(corePackages.core_foundation, 12);
    expect(lines.map((l) => [l.band.pricePerUnit, l.units])).toEqual([
      [175, 9],
      [150, 2],
    ]);
  });

  it('exposes the next unit marginal rate', () => {
    expect(marginalRateForNextUnit(corePackages.core_foundation, 1)).toBe(175);
    expect(marginalRateForNextUnit(corePackages.core_foundation, 10)).toBe(150);
    expect(marginalRateForNextUnit(corePackages.core_foundation, 25)).toBe(125);
    expect(marginalRateForNextUnit(corePackages.core_foundation, 50)).toBe(105);
  });

  it('returns 0 for zero units', () => {
    expect(calculateBandedTotal(corePackages.core_foundation, 0)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CORE DOMAIN MODULES — package components, never a-la-carte
// ═══════════════════════════════════════════════════════════════════════════

describe('Core domain modules', () => {
  it('has exactly eleven', () => {
    expect(CORE_DOMAIN_MODULE_IDS).toHaveLength(11);
    expect(Object.keys(modules)).toHaveLength(11);
  });

  it('covers the eleven published domains', () => {
    expect([...CORE_DOMAIN_MODULE_IDS].sort()).toEqual(
      [
        'delivery',
        'guest',
        'guest_crm',
        'inventory',
        'labor',
        'marketing',
        'profit',
        'pulse',
        'purchasing',
        'reservations',
        'revenue',
      ].sort(),
    );
  });

  it('does not list Foresight as a domain module — it is its own layer', () => {
    expect(CORE_DOMAIN_MODULE_IDS).not.toContain('foresight');
  });

  it('carries NO commercial fields, so nothing can sum one into a quote', () => {
    for (const module of Object.values(modules)) {
      expect(module).not.toHaveProperty('orgLicensePrice');
      expect(module).not.toHaveProperty('perLocationPrice');
      expect(module).not.toHaveProperty('baseIncludesLocations');
      expect(module).not.toHaveProperty('setupFee');
      expect(module).not.toHaveProperty('pricingByTier');
      expect(module.includedInEveryCorePackage).toBe(true);
    }
  });

  it('no longer exposes a-la-carte module bundles', async () => {
    const pricing = await import('../src/data/pricing');
    expect('moduleBundles' in pricing).toBe(false);
    expect('setupFeeDiscounts' in pricing).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FORESIGHT & ACTION
// ═══════════════════════════════════════════════════════════════════════════

describe('Foresight & Action', () => {
  it('anchors at $495', () => {
    expect(foresightAction.firstUnitPrice).toBe(495);
  });

  it('bands at 65 / 55 / 45 / 35', () => {
    expect(foresightAction.marginalBands.map((b) => b.pricePerUnit)).toEqual([65, 55, 45, 35]);
  });

  it('prices marginally: 5 locations = 495 + 4x65 = 755', () => {
    expect(calculateForesightActionPrice(5)).toBe(755);
  });

  it('has no included-locations allowance', () => {
    expect(foresightAction).not.toHaveProperty('baseIncludesLocations');
    expect(foresightAction).not.toHaveProperty('perLocationPrice');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONCEPTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Concept SKUs', () => {
  const expected: Record<string, number> = {
    concept_franchise: 595,
    concept_hotel_fb: 395,
    concept_cloud_kitchen: 395,
    concept_catering: 349,
    concept_production: 595,
    concept_rental_commissary: 395,
  };

  it('offers exactly the six published concepts', () => {
    expect(Object.keys(conceptSkus).sort()).toEqual(Object.keys(expected).sort());
  });

  for (const [id, price] of Object.entries(expected)) {
    it(`${id} is $${price}/mo flat`, () => {
      expect(conceptSkus[id as keyof typeof conceptSkus].monthlyPrice).toBe(price);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION — charged ONCE at the highest class
// ═══════════════════════════════════════════════════════════════════════════

describe('Implementation classes', () => {
  it('publishes 0 / 1500 / 2500 / 7500 / from 12500', () => {
    expect(implementationClasses.self_service.fee).toBe(0);
    expect(implementationClasses.class_a.fee).toBe(1500);
    expect(implementationClasses.class_b.fee).toBe(2500);
    expect(implementationClasses.class_c.fee).toBe(7500);
    expect(implementationClasses.class_d.fee).toBe(12500);
    expect(implementationClasses.class_d.isFloor).toBe(true);
  });

  it('charges the HIGHEST class, not the sum', () => {
    const result = resolveImplementationFee(['class_a', 'class_c', 'class_b']);
    expect(result.classId).toBe('class_c');
    expect(result.fee).toBe(7500);
    // The retired model would have summed these to 11,500.
    expect(result.fee).not.toBe(1500 + 2500 + 7500);
  });

  it('falls back to self-service when nothing is selected', () => {
    expect(resolveImplementationFee([]).fee).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CREW
// ═══════════════════════════════════════════════════════════════════════════

describe('Crew SKUs', () => {
  const expected: Record<string, { name: string; price: number }> = {
    crew_lite: { name: 'Crew Starter', price: 99 },
    crew_scheduling: { name: 'Crew Schedule', price: 179 },
    crew_operations: { name: 'Crew Manage', price: 399 },
    crew_tna: { name: 'Crew Time', price: 99 },
    crew_payroll: { name: 'Crew Pay', price: 129 },
    crew_people_intelligence: { name: 'Crew People', price: 249 },
  };

  for (const [id, spec] of Object.entries(expected)) {
    it(`${spec.name} is $${spec.price}/mo`, () => {
      const sku = crewSkus[id as keyof typeof crewSkus];
      expect(sku.name).toBe(spec.name);
      expect(sku.orgLicensePrice).toBe(spec.price);
    });

    it(`${spec.name} carries no retired per-location mechanic`, () => {
      const sku = crewSkus[id as keyof typeof crewSkus];
      // v1.7 publishes ONE flat monthly price per Crew SKU. The v5.1 fields
      // were deleted rather than zeroed so nothing can sum them by accident.
      expect(sku).not.toHaveProperty('perLocationPrice');
      expect(sku).not.toHaveProperty('baseIncludesLocations');
      // The per-SKU setup-fee ladder is retired — implementation is one
      // charge at the highest class in the selection.
      expect(sku).not.toHaveProperty('setupFee');
    });
  }

  it('prices Crew independently of location count', () => {
    for (const id of Object.keys(expected) as CrewSkuId[]) {
      const one = computeCrewQuote([id], 1).monthly;
      const fifty = computeCrewQuote([id], 50).monthly;
      expect(fifty).toBe(one);
    }
  });
});

describe('Crew bundles', () => {
  it('offers Schedule & Time at $249', () => {
    expect(crewBundles.crew_schedule_time_bundle.name).toBe('Schedule & Time');
    expect(crewBundles.crew_schedule_time_bundle.basePrice).toBe(249);
    expect(crewBundles.crew_schedule_time_bundle.skus).toEqual(['crew_scheduling', 'crew_tna']);
  });

  it('offers Crew Operating at $499 (was the retired $502)', () => {
    expect(crewBundles.crew_suite_bundle.name).toBe('Crew Operating');
    expect(crewBundles.crew_suite_bundle.basePrice).toBe(499);
  });

  it('offers Crew Complete at $699 (was the retired $701)', () => {
    expect(crewBundles.crew_complete_bundle.name).toBe('Crew Complete');
    expect(crewBundles.crew_complete_bundle.basePrice).toBe(699);
  });

  it('publishes NET prices, never a discount off the components', () => {
    for (const bundle of Object.values(crewBundles)) {
      // A `discountPercent` field would let a surface derive the bundle price
      // by discounting components. v1.7 bundle prices are named net figures.
      expect(bundle).not.toHaveProperty('discountPercent');
      expect(bundle).not.toHaveProperty('perLocationPrice');
      expect(bundle).not.toHaveProperty('setupFee');
    }
  });

  it('derives savings from the component sum and the net price', () => {
    expect(crewBundleSavings(crewBundles.crew_schedule_time_bundle)).toBe(278 - 249);
    expect(crewBundleSavings(crewBundles.crew_suite_bundle)).toBe(627 - 499);
    expect(crewBundleSavings(crewBundles.crew_complete_bundle)).toBe(876 - 699);
  });

  it('holds the bundle price flat across location counts', () => {
    const skus: CrewSkuId[] = ['crew_operations', 'crew_tna', 'crew_payroll'];
    expect(computeCrewQuote(skus, 1).monthly).toBe(499);
    expect(computeCrewQuote(skus, 40).monthly).toBe(499);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CREW IMPLEMENTATION — one charge, never a sum
// ═══════════════════════════════════════════════════════════════════════════

describe('Crew implementation', () => {
  it('never sums a per-SKU setup ladder', () => {
    const quote = computeCrewQuote(
      ['crew_operations', 'crew_tna', 'crew_payroll', 'crew_people_intelligence'],
      10,
    );
    // The retired ladder would have summed 499 + 199 + 399 + 299 = 1,396.
    expect(quote).not.toHaveProperty('setupFee');
    expect(quote.implementation.fee).not.toBe(1396);
  });

  it('reports scoping instead of inventing a fee for unpublished classes', () => {
    const quote = computeCrewQuote(['crew_operations'], 3);
    expect(quote.implementation.requiresScoping).toBe(true);
    expect(quote.implementation.classId).toBeNull();
  });

  it('resolves the published self-service class for Crew Starter', () => {
    const quote = computeCrewQuote(['crew_lite'], 3);
    expect(quote.implementation.requiresScoping).toBe(false);
    expect(quote.implementation.classId).toBe('self_service');
    expect(quote.implementation.fee).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Volume ladder', () => {
  it('is 0% below 50 locations', () => {
    expect(getVolumeDiscount(1)).toBe(0);
    expect(getVolumeDiscount(49)).toBe(0);
  });

  it('is 2.5% from 50 to 99', () => {
    expect(getVolumeDiscount(50)).toBe(2.5);
    expect(getVolumeDiscount(99)).toBe(2.5);
  });

  it('is 5% from 100 to 199', () => {
    expect(getVolumeDiscount(100)).toBe(5);
    expect(getVolumeDiscount(199)).toBe(5);
  });

  it('is 7% from 200 to 249', () => {
    expect(getVolumeDiscount(200)).toBe(7);
    expect(getVolumeDiscount(249)).toBe(7);
  });

  it('has NO self-serve band from 250', () => {
    expect(requiresEnterpriseQuote(250)).toBe(true);
    expect(requiresEnterpriseQuote(249)).toBe(false);
    expect(ENTERPRISE_ONLY_FROM_UNITS).toBe(250);
    const tier = volumeDiscounts.tiers.at(-1);
    expect(tier?.enterpriseOnly).toBe(true);
    expect(tier?.percent).toBeNull();
  });

  it('does NOT use the retired 30/100 thresholds', () => {
    expect(getVolumeDiscount(30)).toBe(0);
    expect(getVolumeDiscount(99)).not.toBe(5);
  });
});

describe('Billing-cycle discounts', () => {
  it('is 10% annual and 15% two-year', () => {
    expect(billingDiscounts.monthly).toBe(0);
    expect(billingDiscounts.annual).toBe(10);
    expect(billingDiscounts.two_year).toBe(15);
  });
});

describe('Combined discount cap', () => {
  it('gives the LARGER of volume and billing, never their sum', () => {
    // Price book v1.7 section 2.1: mutually exclusive. This test previously
    // asserted 5% + 10% = 15%, encoding a discount the billing system will not
    // honour — worth $2,092/mo on a 240-location annual quote.
    expect(DISCOUNT_RULES.stackingAllowed).toBe(false);
    const combined = calculateCombinedDiscount(100, 'annual');
    expect(combined.volumePercent).toBe(5);
    expect(combined.billingPercent).toBe(10);
    expect(combined.totalPercent).toBe(10);
    expect(combined.appliedBillingPercent).toBe(10);
    expect(combined.appliedVolumePercent).toBe(0);
  });

  it('gives volume when volume is the larger of the two', () => {
    const combined = calculateCombinedDiscount(240, 'monthly');
    expect(combined.totalPercent).toBe(7);
    expect(combined.appliedVolumePercent).toBe(7);
  });

  it('caps the combination at 15%', () => {
    // Exclusive selection already lands on 15 here (max(7, 15)); the cap is a
    // ceiling on the early-adopter stack, not the mechanism that produces this.
    const combined = calculateCombinedDiscount(200, 'two_year');
    expect(combined.totalPercent).toBe(15);
    expect(calculateCombinedDiscount(200, 'two_year', true).totalPercent).toBe(15);
    expect(calculateCombinedDiscount(200, 'two_year', true).capped).toBe(true);
    expect(DISCOUNT_RULES.maxDiscountPercent).toBe(15);
  });

  it('applies billing alone when volume does not qualify', () => {
    expect(calculateCombinedDiscount(10, 'annual').totalPercent).toBe(10);
  });
});

describe('Client type detection', () => {
  it('follows the v1.7 ladder boundaries', () => {
    expect(detectClientType(1)).toBe('independent');
    expect(detectClientType(49)).toBe('independent');
    expect(detectClientType(50)).toBe('growth');
    expect(detectClientType(99)).toBe('growth');
    expect(detectClientType(100)).toBe('multi-site');
    expect(detectClientType(249)).toBe('multi-site');
    expect(detectClientType(250)).toBe('enterprise');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FULL QUOTE
// ═══════════════════════════════════════════════════════════════════════════

describe('calculateFullPrice', () => {
  const baseProfile = {
    type: 'independent' as const,
    isEarlyAdopter: false,
    isFranchise: false,
    brandCount: 1,
  };

  it('quotes a bare Core package', () => {
    const result = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_foundation',
      locations: 5,
      addOns: [],
      watchtower: [],
      clientProfile: baseProfile,
    });
    expect(result.subtotal).toBe(1895);
    expect(result.total).toBe(1895);
    expect(result.perLocation).toBe(379);
    // Included credits scale with EVERY licensed location (price book v1.7
    // section 8.1), so five locations is 14,000 + 5 x 2,800. This assertion
    // previously expected the bare 14,000 base wallet, encoding the bug that
    // showed an 8-location buyer 14,000 credits against a real 36,400.
    expect(result.aiCreditsTotal).toBe(14000 + 5 * 2800);
    expect(result.aiCreditsBase).toBe(14000);
    // 4 included + ceil(5 / 5).
    expect(result.intelligenceSeats).toBe(5);
  });

  it('adds Foresight & Action with its own bands', () => {
    const result = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_foundation',
      locations: 5,
      addOns: ['foresight_action'],
      watchtower: [],
      clientProfile: baseProfile,
    });
    expect(result.subtotal).toBe(1895 + 755);
  });

  it('adds a concept SKU on its own marginal curve, not a flat fee', () => {
    const withConcept = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_foundation',
      locations: 20,
      addOns: ['concept_catering'],
      watchtower: [],
      clientProfile: baseProfile,
    });
    const withoutConcept = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_foundation',
      locations: 20,
      addOns: [],
      watchtower: [],
      clientProfile: baseProfile,
    });
    // Catering: $349 anchor + 9 x $69 (units 2-10) + 10 x $59 (units 11-25).
    // This previously asserted a flat 349 at TWENTY locations — encoding the
    // bug that understated the pathway by $1,160/mo at this size.
    expect(withConcept.subtotal - withoutConcept.subtotal).toBe(349 + 9 * 69 + 10 * 59);
  });

  it('flags the Enterprise-only band instead of inventing a discount', () => {
    const result = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_performance',
      locations: 300,
      addOns: [],
      watchtower: [],
      clientProfile: baseProfile,
    });
    expect(result.requiresEnterpriseQuote).toBe(true);
  });

  it('never charges an implementation fee inside the monthly quote', () => {
    const result = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_growth',
      locations: 3,
      addOns: ['foresight_action', 'concept_franchise'],
      watchtower: [],
      clientProfile: baseProfile,
    });
    const expected =
      calculateCorePackagePrice('core_growth', 3) +
      calculateForesightActionPrice(3) +
      // The concept is banded like everything else; `monthlyPrice` is only the
      // first-unit anchor, so summing it here understated a 3-site quote.
      calculateBandedTotal(conceptSkus.concept_franchise, 3);
    expect(result.subtotal).toBe(expected);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED DISCOUNT CAP — nothing published may be applied on top of it
// ═══════════════════════════════════════════════════════════════════════════

describe('Combined calculated-discount cap', () => {
  const earlyAdopter = {
    type: 'independent' as const,
    isEarlyAdopter: true,
    isFranchise: false,
    brandCount: 1,
  };

  it('counts the early-adopter rate inside the cap, not after it', () => {
    const combined = calculateCombinedDiscount(200, 'two_year', true);
    expect(combined.earlyAdopterPercent).toBe(20);
    expect(combined.totalPercent).toBe(DISCOUNT_RULES.maxDiscountPercent);
    expect(combined.capped).toBe(true);
  });

  it('never lets an early adopter beat the published cap end to end', () => {
    const result = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_foundation',
      locations: 200,
      addOns: [],
      watchtower: [],
      clientProfile: { ...earlyAdopter, billingCycle: 'two_year' },
    });
    const effective = (1 - result.total / result.subtotal) * 100;
    expect(effective).toBeLessThanOrEqual(DISCOUNT_RULES.maxDiscountPercent + 1e-9);
    // v5.1 stacked 20% on the capped remainder: 15% then 20% = 32% effective.
    expect(effective).not.toBeCloseTo(32, 5);
  });

  it('itemises each concession, and the lines reconcile to the total charged', () => {
    const result = calculateFullPrice({
      layer: 'core',
      corePackage: 'core_margin',
      locations: 120,
      addOns: [],
      watchtower: [],
      clientProfile: { ...earlyAdopter, billingCycle: 'annual' },
    });
    // A single "Combined discount" line meant a reader could not check the
    // total against its parts, or tell WHICH concession they had been given —
    // and volume and billing cycle are negotiated separately. Each applied
    // concession is now its own line.
    const money = result.discountsApplied.filter((d) => d.amount !== 0);
    expect(money.length).toBeGreaterThan(1);

    // The parts must sum EXACTLY to the difference the buyer is charged, even
    // after the 15% cap bites and after rounding.
    const summed = result.discountsApplied.reduce((t, d) => t + d.amount, 0);
    expect(result.subtotal + summed).toBeCloseTo(result.total, 2);

    // The effective rate still respects the published ceiling.
    const effective = ((result.subtotal - result.total) / result.subtotal) * 100;
    expect(effective).toBeCloseTo(DISCOUNT_RULES.maxDiscountPercent, 6);

    // And the term that lost the exclusive choice is stated, not dropped.
    expect(result.discountsApplied.some((d) => /not applied/.test(d.name))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR COMPARISON — must not key on a retired tier id
// ═══════════════════════════════════════════════════════════════════════════

describe('Competitor comparison', () => {
  const selection = [CORE_PACKAGE_SELECTION_ID, ...CORE_DOMAIN_MODULE_IDS];

  it('still costs a competitor out for a v1.7 Core package', () => {
    const tenzo = COMPETITOR_PRICING.tenzo.calculate(10, selection);
    // 3 comparable products x 10 locations x $75.
    expect(tenzo.monthly).toBe(2250);
    expect(tenzo.firstYear).toBeGreaterThan(0);
  });

  it('does not silently zero out when no retired tier id is passed', () => {
    const retiredStyle = COMPETITOR_PRICING.tenzo.calculate(10, ['core-lite']);
    expect(retiredStyle.monthly).toBe(0);
    const v17 = COMPETITOR_PRICING.tenzo.calculate(10, selection);
    expect(v17.monthly).toBeGreaterThan(0);
  });
});
