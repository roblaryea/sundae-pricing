import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let consent: string | null;
let release: () => void;
let wait: Promise<void>;
let fail: boolean;
const init = vi.fn();
const capture = vi.fn(() => true);
const captureException = vi.fn();
const load = vi.fn();

beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  consent = null; fail = false;
  wait = new Promise<void>((resolve) => { release = resolve; });
  vi.stubEnv('VITE_POSTHOG_KEY', 'pricing-review-test-key');
  vi.stubEnv('VITE_SENTRY_DSN', '');
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', { getItem: () => consent });
  vi.doMock('../src/lib/analyticsRuntime', async () => {
    load();
    await wait;
    if (fail) throw new Error('Optional SDK chunk unavailable');
    return { initAnalytics: init, trackPricingEvent: capture, capturePricingException: captureException };
  });
});

afterEach(() => {
  release(); vi.doUnmock('../src/lib/analyticsRuntime');
  vi.unstubAllEnvs(); vi.unstubAllGlobals();
});

describe('consented optional SDK loading', () => {
  it('does not import SDKs or retain actions before consent', async () => {
    const analytics = await import('../src/lib/analytics');
    await analytics.initAnalyticsIfConsented();
    expect(analytics.trackPricingEvent('quote_reviewed')).toBe(false);
    consent = 'declined'; await analytics.initAnalyticsIfConsented();
    expect(load).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it('shares initialization and preserves a fast post-consent action exactly once', async () => {
    const analytics = await import('../src/lib/analytics');
    consent = 'accepted';
    const ready = Promise.all([analytics.initAnalyticsIfConsented(), analytics.initAnalyticsIfConsented()]);
    const properties = { locations: 3, monthly: 1545 };
    expect(analytics.trackPricingEvent('quote_reviewed', properties)).toBe(true);
    properties.locations = 7;
    release(); await ready;
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    expect(load).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith('quote_reviewed', { locations: 3, monthly: 1545 });
  });

  it('does not initialize or flush when consent changes during loading', async () => {
    const analytics = await import('../src/lib/analytics');
    consent = 'accepted'; const ready = analytics.initAnalyticsIfConsented();
    analytics.trackPricingEvent('quote_reviewed');
    consent = 'declined'; release(); await ready;
    await vi.dynamicImportSettled();
    expect(init).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it('contains optional chunk failure without rejecting application startup', async () => {
    const analytics = await import('../src/lib/analytics');
    consent = 'accepted'; fail = true;
    const ready = analytics.initAnalyticsIfConsented();
    analytics.trackPricingEvent('quote_reviewed');
    release(); await expect(ready).resolves.toBeUndefined();
    await vi.dynamicImportSettled();
    expect(init).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it('retains the error and component stack through deferred exception reporting', async () => {
    const analytics = await import('../src/lib/analytics');
    consent = 'accepted';
    const error = new Error('Pricing render failed');
    analytics.capturePricingException(error, 'PricingWorkspace');
    release(); await vi.dynamicImportSettled();
    await vi.waitFor(() => expect(captureException).toHaveBeenCalledWith(error, 'PricingWorkspace'));
    expect(init).toHaveBeenCalledTimes(1);
  });

  it('does not fetch optional SDKs when neither service is configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const analytics = await import('../src/lib/analytics');
    consent = 'accepted'; await analytics.initAnalyticsIfConsented();
    expect(analytics.trackPricingEvent('quote_reviewed')).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });
});
