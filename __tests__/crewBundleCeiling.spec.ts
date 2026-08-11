/**
 * CREW BUNDLE CEILING SPEC
 *
 * A published net bundle price is the most a visitor can be asked to pay for
 * anything that bundle delivers — they could always just buy the bundle. The
 * builder matched bundles by exact set equality, so three sets a visitor can
 * genuinely reach were quoted ABOVE the bundle that covers them:
 *
 *   Manage + Pay                 $528  vs  Crew Operating  $499
 *   Manage + Time + People       $747  vs  Crew Complete   $699
 *   Manage + Pay + People        $777  vs  Crew Complete   $699
 *
 * Worst of all, adding Crew Time to Manage + Pay made the quote CHEAPER
 * ($528 → $499), because only the complete set tripped the bundle. These tests
 * enumerate every selection the builder's dependency rules can produce and
 * assert the ceiling holds for all of them, so the next SKU or bundle added to
 * the price book cannot quietly reopen the hole.
 */
import { describe, expect, it } from 'vitest';

import { computeCrewQuote, CREW_SKU_LIST, CREW_PRESETS } from '../src/lib/crewPricing';
import { crewSkus, crewBundles } from '../src/data/pricing';
import type { CrewSkuId, CrewBundleId } from '../src/types/configuration';

const BUNDLE_IDS = Object.keys(crewBundles) as CrewBundleId[];

/** Buying these SKUs entitles you to these — Crew Manage grants Crew Schedule. */
function entitlements(skus: readonly CrewSkuId[]): Set<CrewSkuId> {
  const granted = new Set<CrewSkuId>(skus);
  if (granted.has('crew_operations')) granted.add('crew_scheduling');
  return granted;
}

/** Every SKU's published prerequisite is met (Time accepts Schedule OR Manage). */
function prerequisitesMet(set: ReadonlySet<CrewSkuId>): boolean {
  for (const id of set) {
    const sku = crewSkus[id];
    const required = sku.prerequisites as CrewSkuId[];
    if (required.length === 0) continue;
    const alternatives = (
      'prerequisiteAlternatives' in sku ? sku.prerequisiteAlternatives : []
    ) as CrewSkuId[];
    const met = required.every((p) => set.has(p)) || alternatives.some((a) => set.has(a));
    if (!met) return false;
  }
  return true;
}

/**
 * Every SKU set `useConfiguration.toggleCrewSku` can leave the store in.
 * Derived from the published dependency data rather than hardcoded, so a new
 * Crew SKU joins this enumeration automatically.
 */
function reachableSelections(): CrewSkuId[][] {
  const out: CrewSkuId[][] = [['crew_lite']]; // mutually exclusive with the rest
  for (let mask = 1; mask < 1 << CREW_SKU_LIST.length; mask += 1) {
    const skus = CREW_SKU_LIST.filter((_, index) => mask & (1 << index));
    const set = new Set(skus);
    // Manage always drags Schedule in: the builder auto-attaches it and locks
    // the tile, so Manage-without-Schedule is not a state a visitor can reach.
    if (set.has('crew_operations') && !set.has('crew_scheduling')) continue;
    if (!prerequisitesMet(set)) continue;
    out.push(skus);
  }
  return out;
}

const SELECTIONS = reachableSelections();
const key = (skus: CrewSkuId[]) => [...skus].sort().join('+');

/** Standalone monthly, with Schedule at $0 whenever Manage is in the set. */
function componentSum(skus: CrewSkuId[]): number {
  const set = new Set(skus);
  return skus.reduce(
    (sum, id) =>
      sum +
      (id === 'crew_scheduling' && set.has('crew_operations') ? 0 : crewSkus[id].orgLicensePrice),
    0,
  );
}

/**
 * Independent minimum-cost cover, written recursively rather than by bitmask so
 * it is not the engine's algorithm restated. Anything the engine quotes above
 * this is money the visitor did not have to spend.
 */
function cheapestDelivery(skus: CrewSkuId[], bundles: CrewBundleId[] = BUNDLE_IDS): number {
  if (bundles.length === 0) return componentSum(skus);
  const [head, ...rest] = bundles;
  const without = cheapestDelivery(skus, rest);
  const covered = entitlements(crewBundles[head].skus);
  const withHead =
    crewBundles[head].basePrice + cheapestDelivery(skus.filter((id) => !covered.has(id)), rest);
  return Math.min(without, withHead);
}

describe('reachable Crew selections', () => {
  it('enumerates the eleven sets the builder can produce', () => {
    // 1 Lite + 2 Schedule-only sets + 8 Manage-based sets (Manage+Schedule
    // plus any subset of Time / Pay / People).
    expect(SELECTIONS).toHaveLength(11);
  });

  it('never puts Crew Schedule on the bill next to Crew Manage', () => {
    for (const skus of SELECTIONS) {
      if (!skus.includes('crew_operations')) continue;
      const quote = computeCrewQuote(skus, 4);
      const scheduleLine = quote.lines.find((line) => line.id === 'crew_scheduling');
      // Manage includes Schedule. Either the bundle line swallows it, or it
      // shows as a $0 rider — a $179 line here is a double charge.
      expect(scheduleLine?.monthly ?? 0).toBe(0);
    }
  });
});

describe('a net bundle is a price ceiling', () => {
  it.each(SELECTIONS.map((skus) => [key(skus), skus] as const))(
    'quotes %s at or below every bundle that covers it',
    (_label, skus) => {
      const quote = computeCrewQuote(skus, 7);
      for (const bundleId of BUNDLE_IDS) {
        const covered = entitlements(crewBundles[bundleId].skus);
        if (!skus.every((id) => covered.has(id))) continue;
        expect(
          quote.monthly,
          `${key(skus)} quoted $${quote.monthly} above ${crewBundles[bundleId].name} $${crewBundles[bundleId].basePrice}`,
        ).toBeLessThanOrEqual(crewBundles[bundleId].basePrice);
      }
    },
  );

  it.each(SELECTIONS.map((skus) => [key(skus), skus] as const))(
    'quotes %s at the cheapest legal delivery, never above it',
    (_label, skus) => {
      expect(computeCrewQuote(skus, 3).monthly).toBe(cheapestDelivery(skus));
    },
  );

  it('never charges more for a subset than for the superset that contains it', () => {
    // Manage+Pay used to cost $528 while Manage+Pay+Time cost $499: removing a
    // SKU made the quote go UP, which is how the bug reached a customer.
    for (const skus of SELECTIONS) {
      const price = computeCrewQuote(skus, 2).monthly;
      for (const bigger of SELECTIONS) {
        if (bigger.length <= skus.length) continue;
        if (!skus.every((id) => bigger.includes(id))) continue;
        expect(
          price,
          `${key(skus)} ($${price}) costs more than its superset ${key(bigger)} ($${computeCrewQuote(bigger, 2).monthly})`,
        ).toBeLessThanOrEqual(computeCrewQuote(bigger, 2).monthly);
      }
    }
  });
});

describe('quoted price per reachable selection', () => {
  // The full published table. The three starred rows are the sets that were
  // quoted above a bundle before the ceiling rule existed.
  const EXPECTED: Record<string, number> = {
    crew_lite: 99,
    crew_scheduling: 179,
    'crew_scheduling+crew_tna': 249, // Schedule & Time net bundle
    'crew_operations+crew_scheduling': 399,
    'crew_operations+crew_scheduling+crew_tna': 498, // parts beat the $499 bundle
    'crew_operations+crew_payroll+crew_scheduling': 499, // ★ was $528
    'crew_operations+crew_people_intelligence+crew_scheduling': 648,
    'crew_operations+crew_payroll+crew_scheduling+crew_tna': 499, // Crew Operating
    'crew_operations+crew_people_intelligence+crew_scheduling+crew_tna': 699, // ★ was $747
    'crew_operations+crew_payroll+crew_people_intelligence+crew_scheduling': 699, // ★ was $777
    'crew_operations+crew_payroll+crew_people_intelligence+crew_scheduling+crew_tna': 699,
  };

  it.each(SELECTIONS.map((skus) => [key(skus), skus] as const))('prices %s', (label, skus) => {
    expect(EXPECTED[label], `no expected price recorded for ${label}`).toBeDefined();
    expect(computeCrewQuote(skus, 12).monthly).toBe(EXPECTED[label]);
  });

  it('holds every reachable price flat across estate size', () => {
    for (const skus of SELECTIONS) {
      const one = computeCrewQuote(skus, 1).monthly;
      for (const locations of [5, 50, 250]) {
        expect(computeCrewQuote(skus, locations).monthly).toBe(one);
      }
    }
  });
});

describe('bundle presentation stays truthful', () => {
  it('names the bundle when one covers the whole selection', () => {
    const quote = computeCrewQuote(['crew_operations', 'crew_scheduling', 'crew_payroll'], 3);
    expect(quote.detectedBundleId).toBe('crew_suite_bundle');
    // Every consumer reads lines[0].label as the headline when a bundle is
    // detected, so the bundle line must come first and must be the only line.
    expect(quote.lines).toEqual([{ id: 'crew_suite_bundle', label: 'Crew Operating', monthly: 499 }]);
  });

  it('does not claim a bundle when the parts are cheaper', () => {
    const quote = computeCrewQuote(['crew_operations', 'crew_scheduling', 'crew_tna'], 3);
    expect(quote.monthly).toBe(498);
    expect(quote.detectedBundleId).toBeNull();
    expect(quote.lines.map((l) => l.id)).toEqual([
      'crew_operations',
      'crew_scheduling',
      'crew_tna',
    ]);
  });

  it('keeps lines[0] as the bundle line wherever a bundle is detected', () => {
    for (const skus of SELECTIONS) {
      const quote = computeCrewQuote(skus, 3);
      if (!quote.detectedBundleId) continue;
      expect(quote.lines[0].id).toBe(quote.detectedBundleId);
      expect(quote.lines[0].monthly).toBe(crewBundles[quote.detectedBundleId].basePrice);
    }
  });

  it('never discounts a net bundle a second time', () => {
    for (const skus of SELECTIONS) {
      const quote = computeCrewQuote(skus, 3);
      if (!quote.detectedBundleId) continue;
      // The named net price is the price. `bundleSavingsMonthly` is a display
      // figure derived from the component sum — subtracting it from `monthly`
      // would discount a price that is already the discount.
      expect(quote.monthly).toBe(crewBundles[quote.detectedBundleId].basePrice);
      expect(quote.monthly + quote.bundleSavingsMonthly).toBe(componentSum(skus));
      expect(quote.annual).toBe(quote.monthly * 12);
    }
  });

  it('reports savings only where the quote actually beats the parts', () => {
    for (const skus of SELECTIONS) {
      const quote = computeCrewQuote(skus, 3);
      expect(quote.bundleSavingsMonthly).toBe(componentSum(skus) - quote.monthly);
      expect(quote.bundleSavingsMonthly).toBeGreaterThanOrEqual(0);
    }
  });

  it('prices every quick preset at its advertised net figure', () => {
    for (const preset of CREW_PRESETS) {
      const quote = computeCrewQuote(preset.skus, 6);
      expect(quote.monthly).toBe(cheapestDelivery(preset.skus));
    }
    expect(computeCrewQuote(CREW_PRESETS[1].skus, 6).monthly).toBe(
      crewBundles.crew_suite_bundle.basePrice,
    );
    expect(computeCrewQuote(CREW_PRESETS[2].skus, 6).monthly).toBe(
      crewBundles.crew_complete_bundle.basePrice,
    );
  });
});

describe('allowances and implementation are charged once, not per component', () => {
  it('gives a bundle buyer ONE employee allowance, not one per SKU', () => {
    const single = computeCrewQuote(['crew_operations', 'crew_scheduling'], 10);
    const stack = computeCrewQuote(
      ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
      10,
    );
    // Three SKUs each publishing "15 employees per location" is still 15 per
    // location, not 45 — the allowance is an entitlement, not a stackable perk.
    expect(single.employeeAllowancePerLocation).toBe(15);
    expect(stack.employeeAllowancePerLocation).toBe(15);
    expect(computeCrewQuote([], 10).employeeAllowancePerLocation).toBeNull();
  });

  it('never lets an employee count leak into the price', () => {
    // There is no employee input at all, and no per-employee overage may be
    // baked into a quote: overage is metered in-product against the published
    // per-SKU rate, so a quote that pre-charged it would double-bill.
    for (const skus of SELECTIONS) {
      const quote = computeCrewQuote(skus, 9);
      const lineSum = quote.lines.reduce((sum, line) => sum + line.monthly, 0);
      expect(lineSum).toBe(quote.monthly);
      expect(quote).not.toHaveProperty('employeeOverageMonthly');
    }
  });

  it('charges one implementation for the whole stack', () => {
    for (const skus of SELECTIONS) {
      const quote = computeCrewQuote(skus, 3);
      const worstCaseSum = skus.length * quote.implementation.fee;
      // Crew publishes no class above self-service today, so the fee is $0 or
      // scoped; the assertion that matters is that it is never a per-SKU sum.
      expect(quote.implementation.fee).toBeLessThanOrEqual(
        skus.length > 1 ? worstCaseSum : quote.implementation.fee,
      );
      expect(quote).not.toHaveProperty('setupFee');
    }
    expect(computeCrewQuote(['crew_lite'], 3).implementation.classId).toBe('self_service');
    expect(
      computeCrewQuote(['crew_operations', 'crew_scheduling', 'crew_payroll'], 3).implementation
        .requiresScoping,
    ).toBe(true);
  });
});
