import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const posthog = vi.hoisted(() => ({ init:vi.fn(), capture:vi.fn(), has_opted_out_capturing:vi.fn(() => false), opt_out_capturing:vi.fn() }));
vi.mock('posthog-js', () => ({default:posthog}));
vi.mock('@sentry/react', () => ({}));
let consent: string | null;
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks(); consent=null;
  posthog.has_opted_out_capturing.mockReturnValue(false);
  vi.stubEnv('VITE_POSTHOG_KEY','pricing-review-test-key'); vi.stubEnv('VITE_SENTRY_DSN','');
  vi.stubGlobal('localStorage',{getItem:() => consent});
  vi.stubGlobal('window',{location:{hostname:'pricing.sundae.io'}});
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('real pricing event transport', () => {
  it('sends semantic funnel events only after consent and initialization', async () => {
    const analytics=await import('../src/lib/analytics');
    analytics.initAnalyticsIfConsented();
    expect(analytics.trackPricingEvent('first_price_displayed',{locations:3})).toBe(false);
    expect(posthog.capture).not.toHaveBeenCalled();
    consent='accepted'; analytics.initAnalyticsIfConsented(); analytics.initAnalyticsIfConsented();
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(analytics.trackPricingEvent('quote_reviewed',{locations:3,layer:'core',monthly:1545})).toBe(true);
    expect(posthog.capture).toHaveBeenCalledWith('pricing_quote_reviewed',{locations:3,layer:'core',monthly:1545});
    consent='declined';
    expect(analytics.trackPricingEvent('pdf_downloaded')).toBe(false);
    expect(posthog.capture).toHaveBeenCalledTimes(1);
  });
  it('honors opt-out and strips configuration queries from automatic URL properties', async () => {
    const analytics=await import('../src/lib/analytics');
    consent='accepted'; analytics.initAnalyticsIfConsented();
    posthog.has_opted_out_capturing.mockReturnValue(true);
    expect(analytics.trackPricingEvent('share_clicked')).toBe(false);
    const options=posthog.init.mock.calls[0][1] as {sanitize_properties:(p:Record<string,string>)=>Record<string,string>};
    expect(options.sanitize_properties({$current_url:'https://pricing.sundae.io/simulator?cfg=test-selection',$referrer:'https://sundae.io/?email=private',$pathname:'/simulator?cfg=test-selection'})).toEqual({$current_url:'https://pricing.sundae.io/simulator',$referrer:'https://sundae.io/',$pathname:'/simulator'});
  });
});
