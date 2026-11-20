import { beforeEach, describe, expect, it } from 'vitest';
import { corePackages, CORE_PACKAGE_IDS } from '../src/data/pricing';
import published from './fixtures/published-policy-20261010.json';
import publishedGrants from './fixtures/published-capability-grants-20261120.json';
import { applyLiveCatalogValues, type LiveCatalogResponse } from '../src/data/livePricing';
import { supportedLocales } from '../src/lib/locales';
import { capabilityComparisonCopy } from '../src/lib/capabilityComparisonCopy';
import { coreCapabilityStatus } from '../src/lib/coreCapabilityComparison';

// Hydrate through the production admission path; static fallback grants are not the active catalogue.
const catalogue = structuredClone(published) as unknown as LiveCatalogResponse;
for (const grant of publishedGrants.tiers) Object.assign(catalogue.tiers!.find(t => t.id === grant.id)!, grant);

beforeEach(() => applyLiveCatalogValues(catalogue));

describe('buyer capability coverage versus the package grant', () => {
  it('shows shared workspaces without implying that Foundation includes delivery or stock analysis', () => {
    for (const id of CORE_PACKAGE_IDS) {
      for (const capability of ['pulse','benchmarks','ask','recovery'] as const) expect(coreCapabilityStatus(id,capability)).toBe('included');
    }
    expect(coreCapabilityStatus('core_foundation','delivery')).toBe('unavailable');
    expect(coreCapabilityStatus('core_foundation','inventory')).toBe('unavailable');
    for (const id of ['core_margin','core_growth','core_performance'] as const) expect(coreCapabilityStatus(id,'delivery')).toBe('included');
  });

  it('distinguishes included Foresight from a separate extension and Watchtower eligibility from inclusion', () => {
    expect(coreCapabilityStatus('core_performance','foresight_action')).toBe('included');
    expect(coreCapabilityStatus('core_foundation','foresight_action')).toBe('separate');
    expect(coreCapabilityStatus('core_growth','watchtower')).toBe('separate');
    expect(coreCapabilityStatus('core_performance','watchtower')).toBe('separate');
    expect(coreCapabilityStatus('core_foundation','watchtower')).toBe('unavailable');
    expect(coreCapabilityStatus('core_margin','watchtower')).toBe('unavailable');
  });

  it('provides native capability and instant-estimate explanations in every offered locale', () => {
    for (const locale of supportedLocales) {
      expect(Object.values(capabilityComparisonCopy[locale])).toHaveLength(11);
      expect(Object.values(capabilityComparisonCopy[locale]).every(value => value.trim().length > 0)).toBe(true);
      if (locale !== 'en') expect(capabilityComparisonCopy[locale].noContact).not.toBe(capabilityComparisonCopy.en.noContact);
    }
  });

  it('reads an effective eligibility change instead of hard-coding a Growth promise', () => {
    const original=corePackages.core_growth.allowsWatchtower;
    try {
      corePackages.core_growth.allowsWatchtower=false;
      expect(coreCapabilityStatus('core_growth','watchtower')).toBe('unavailable');
    } finally { corePackages.core_growth.allowsWatchtower=original; }
  });
});
