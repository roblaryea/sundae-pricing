import { describe, expect, it } from 'vitest';
import { isPublicWebVitalsUrl, sanitizeWebVitalsProperties } from '../src/lib/webVitalsPrivacy';

describe('pricing Web Vitals privacy boundary', () => {
  it('allows only the public pricing entry routes', () => {
    expect(isPublicWebVitalsUrl('https://pricing.sundae.io/', 'pricing')).toBe(true);
    expect(isPublicWebVitalsUrl('https://pricing.sundae.io/simulator', 'pricing')).toBe(true);
    expect(isPublicWebVitalsUrl('https://pricing.sundae.io/faq', 'pricing')).toBe(false);
    expect(isPublicWebVitalsUrl('http://pricing.sundae.io/', 'pricing')).toBe(false);
  });

  it('preserves scalar metric values and strips sensitive payload fields', () => {
    const value = sanitizeWebVitalsProperties({
      '$current_url': 'https://pricing.sundae.io/simulator?cfg=private#roi',
      '$web_vitals_CLS_value': 0.03,
      '$web_vitals_CLS_event': {
        name: 'CLS', value: 0.03, rating: 'good',
        '$current_url': 'https://pricing.sundae.io/simulator?cfg=private',
        entries: [{ value: 0.03, sources: [{ node: '<button>private</button>' }] }],
      },
    }, 'pricing');
    expect(value).toEqual({
      '$current_url': 'https://pricing.sundae.io/simulator',
      '$web_vitals_CLS_value': 0.03,
      '$web_vitals_CLS_event': { name: 'CLS', value: 0.03, rating: 'good', '$current_url': 'https://pricing.sundae.io/simulator' },
    });
  });
});
