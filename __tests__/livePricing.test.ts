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

describe('Live pricing catalog normalization', () => {
  it('accepts the app route bundle array shape', () => {
    const normalized = normalizeLiveCatalogResponse({
      bundles: [
        { id: 'ops_suite', moduleIds: ['labor', 'inventory'], discountPercent: 10 },
      ],
    });

    expect(normalized.bundles).toEqual([
      { id: 'ops_suite', moduleIds: ['labor', 'inventory'], discountPercent: 10 },
    ]);
  });

  it('accepts the legacy grouped bundle shape', () => {
    const normalized = normalizeLiveCatalogResponse({
      bundles: {
        modules: [
          { id: 'ops_suite', moduleIds: ['labor', 'inventory'], discountPercent: 10 },
        ],
      },
    });

    expect(normalized.bundles).toEqual([
      { id: 'ops_suite', moduleIds: ['labor', 'inventory'], discountPercent: 10 },
    ]);
  });
});
