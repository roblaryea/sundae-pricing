import { describe, it, expect } from 'vitest';
import { getPricingMetadata, pricingLocaleUrl } from '../src/lib/pricingMetadata';
import { supportedLocales } from '../src/lib/locales';
import { getBuyerClarityCopy } from '../src/lib/buyerClarityCopy';

describe('pricing discovery and buyer labels', () => {
  for (const locale of supportedLocales) it(`${locale} has a self-canonical overview and a private simulator`, () => {
    const overview = getPricingMetadata(locale);
    const simulator = getPricingMetadata(locale,true);
    expect(overview.canonical).toBe(pricingLocaleUrl(locale));
    expect(overview.robots).toBe('index,follow');
    expect(simulator.robots).toBe('noindex,follow');
    expect(overview.alternates).toHaveLength(25);
    expect(overview.title).not.toContain('Decision Intelligence');
    const copy = getBuyerClarityCopy(locale);
    expect(new Set(Object.values(copy.payments)).size).toBe(4);
    expect(copy.bundleNote).toContain('{bundle}');
  });
});
