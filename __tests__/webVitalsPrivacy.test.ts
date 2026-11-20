import { describe, expect, it, vi } from 'vitest';
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


it('actual pricing before_send keeps transport/identity and rejects withdrawal and opt-out', async () => {
  vi.resetModules();
  let consent: string | null = null;
  let optedOut = false;
  let config: import('posthog-js').PostHogConfig | undefined;
  const init = vi.fn((_key: string, value: import('posthog-js').PostHogConfig) => { config = value; });
  vi.stubEnv('VITE_POSTHOG_KEY', 'qa-public-project-key'); vi.stubEnv('VITE_SENTRY_DSN', ''); vi.stubEnv('PROD', true);
  vi.stubGlobal('window', { location: new URL('https://pricing.sundae.io/') });
  vi.stubGlobal('localStorage', { getItem: () => consent });
  vi.doMock('posthog-js', () => ({ default: { init, has_opted_out_capturing: () => optedOut } }));
  try {
    const { initAnalytics } = await import('../src/lib/analyticsRuntime');
    initAnalytics(); expect(init).not.toHaveBeenCalled();
    consent = 'accepted'; initAnalytics();
    expect(config?.capture_performance).toEqual({ network_timing: false, web_vitals: true, web_vitals_attribution: false, web_vitals_allowed_metrics: ['LCP', 'CLS', 'FCP', 'INP'] });
    const send = config!.before_send as import('posthog-js').BeforeSendFn;
    const event = { uuid: 'qa-uuid', event: '$web_vitals', properties: {
      token: 'qa-public-project-key', distinct_id: 'qa-anonymous', '$device_id': 'qa-device', '$process_person_profile': false,
      '$current_url': 'https://pricing.sundae.io/simulator?utm_source=internal_qa&cfg=private',
      '$web_vitals_FCP_value': 1000,
      '$web_vitals_FCP_event': { name: 'FCP', value: 1000, '$current_url': 'https://pricing.sundae.io/simulator?cfg=private', entries: [{ name: 'private' }] },
    } };
    const sent = send(event)!;
    expect(sent.properties.token).toBe(event.properties.token);
    expect(sent.properties.$process_person_profile).toBe(false);
    expect(sent.properties.$device_id).toBe('qa-device');
    expect(sent.properties.utm_source).toBe('internal_qa');
    expect(sent.properties.$current_url).toBe('https://pricing.sundae.io/simulator');
    expect(sent.properties.$web_vitals_FCP_event).not.toHaveProperty('entries');
    consent = 'declined'; expect(send(event)).toBeNull();
    consent = 'accepted'; optedOut = true; expect(send(event)).toBeNull(); optedOut = false;
    vi.stubGlobal('window', { location: new URL('https://pricing.sundae.io/faq') });
    expect(send(event)).toBeNull();
  } finally { vi.doUnmock('posthog-js'); vi.unstubAllEnvs(); vi.unstubAllGlobals(); }
});
