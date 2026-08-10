import { describe, expect, it } from 'vitest';
import {
  isLivePricingRequired,
  normalizeLiveCatalogResponse,
  resolvePricingCatalogBaseUrl,
  resolvePricingCatalogUrl,
} from '../src/data/livePricing';

describe('Live pricing catalog resolution', () => {
  it('prefers explicit env override when provided', () => {
    expect(resolvePricingCatalogBaseUrl({
      envBaseUrl: 'https://app.sundaetech.ai/',
      hostname: 'localhost',
      origin: 'http://localhost:5173',
    })).toBe('https://app.sundaetech.ai');
  });

  it('uses same-origin catalog on hosted Sundae domains', () => {
    expect(resolvePricingCatalogUrl({
      hostname: 'pricing.sundae.io',
      origin: 'https://pricing.sundae.io',
    })).toBe('https://pricing.sundae.io/api/pricing/catalog/active');
  });

  it('uses same-origin catalog on Vercel preview deployments', () => {
    expect(resolvePricingCatalogUrl({
      hostname: 'sundae-pricing-git-main-123.vercel.app',
      origin: 'https://sundae-pricing-git-main-123.vercel.app',
    })).toBe('https://sundae-pricing-git-main-123.vercel.app/api/pricing/catalog/active');
  });

  it('stays disabled on localhost without an explicit override', () => {
    expect(resolvePricingCatalogUrl({
      hostname: 'localhost',
      origin: 'http://localhost:5173',
    })).toBeNull();
  });

  it('stays disabled on unsupported static hosts without an explicit override', () => {
    expect(resolvePricingCatalogUrl({
      hostname: 'example.github.io',
      origin: 'https://example.github.io',
    })).toBeNull();
  });

  it('requires live pricing on hosted Sundae domains by default', () => {
    expect(isLivePricingRequired({ hostname: 'pricing.sundae.io' })).toBe(true);
  });

  it('does not require live pricing on localhost by default', () => {
    expect(isLivePricingRequired({ hostname: 'localhost' })).toBe(false);
  });
});

describe('Live pricing catalog normalization (price book v1.7)', () => {
  it('passes through the v1.7 SKU families', () => {
    const normalized = normalizeLiveCatalogResponse({
      corePackages: [{ id: 'core_foundation', firstUnitPrice: 1195 }],
      foresightAction: { id: 'foresight_action', firstUnitPrice: 495 },
      concepts: [{ id: 'concept_catering', monthlyPrice: 349 }],
      watchtower: [{ id: 'competitive', basePrice: 549 }],
    });

    expect(normalized.corePackages).toEqual([{ id: 'core_foundation', firstUnitPrice: 1195 }]);
    expect(normalized.foresightAction).toEqual({ id: 'foresight_action', firstUnitPrice: 495 });
    expect(normalized.concepts).toEqual([{ id: 'concept_catering', monthlyPrice: 349 }]);
    expect(normalized.watchtower).toEqual([{ id: 'competitive', basePrice: 549 }]);
  });

  it('DROPS retired catalog ids so a published price cannot resurrect them', () => {
    const normalized = normalizeLiveCatalogResponse({
      corePackages: [
        { id: 'core_lite', firstUnitPrice: 279 },
        { id: 'report_pro', firstUnitPrice: 159 },
        { id: 'core_growth', firstUnitPrice: 1925 },
      ],
    });

    expect(normalized.corePackages.map((row) => row.id)).toEqual(['core_growth']);
  });

  it('defaults every family to empty when the payload omits it', () => {
    const normalized = normalizeLiveCatalogResponse({});
    expect(normalized.corePackages).toEqual([]);
    expect(normalized.concepts).toEqual([]);
    expect(normalized.watchtower).toEqual([]);
    expect(normalized.foresightAction).toBeNull();
  });
});
