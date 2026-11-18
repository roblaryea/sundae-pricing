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

// Root index.html exists: locale routes must run BEFORE filesystem matching.
// High-level rewrites silently served English for /?lang=ar on Vercel.
import routing from '../vercel.json';
it('routes every localized root before the static index file and retains a real 404', () => {
  const fs = routing.routes.findIndex(route=>'handle' in route && route.handle === 'filesystem');
  for (const locale of supportedLocales.filter(l=>l!=='en')) {
    const at = routing.routes.findIndex(route=>'src' in route && route.src === '/' && 'has' in route && route.has?.some(h=>h.key==='lang' && h.value === locale));
    expect(at).toBeGreaterThan(-1); expect(at).toBeLessThan(fs);
  }
  expect(routing.routes.at(-1)).toMatchObject({status:404,dest:'/404.html'});
});
