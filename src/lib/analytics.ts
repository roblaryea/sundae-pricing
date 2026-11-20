type AnalyticsRuntime = typeof import('./analyticsRuntime');
type EventProperties = Record<string, string | number | boolean | null>;

let runtime: AnalyticsRuntime | undefined;
let pendingLoad: Promise<AnalyticsRuntime | null> | undefined;

function hasConsent() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('sundae_cookie_consent') === 'accepted';
  } catch {
    return false;
  }
}

/** Optional measurement must not delay the first quote or reload the page. */
function loadConsentedRuntime(): Promise<AnalyticsRuntime | null> {
  if (!hasConsent() || (!import.meta.env?.VITE_POSTHOG_KEY && !import.meta.env?.VITE_SENTRY_DSN)) return Promise.resolve(null);
  if (runtime) return Promise.resolve(runtime);
  if (!pendingLoad) {
    pendingLoad = import('./analyticsRuntime')
      .then((module) => {
        // Consent can change while the SDK chunks are in flight.
        if (!hasConsent()) return null;
        module.initAnalytics();
        runtime = module;
        return module;
      })
      .catch(() => null)
      .finally(() => { pendingLoad = undefined; });
  }
  return pendingLoad;
}

export async function initAnalytics() {
  await loadConsentedRuntime();
}

export async function initAnalyticsIfConsented() {
  await loadConsentedRuntime();
}

function whenReady(capture: (module: AnalyticsRuntime) => void) {
  if (!hasConsent()) return;
  void loadConsentedRuntime().then((module) => {
    if (module && hasConsent()) capture(module);
  }).catch(() => { /* Optional measurement cannot break a pricing action. */ });
}

export function trackModuleSelected(moduleName: string, price: number) {
  whenReady((module) => module.trackModuleSelected(moduleName, price));
}

export function trackModuleDeselected(moduleName: string) {
  whenReady((module) => module.trackModuleDeselected(moduleName));
}

export function trackPricingConfigured(config: Parameters<AnalyticsRuntime['trackPricingConfigured']>[0]) {
  whenReady((module) => module.trackPricingConfigured(config));
}

export function trackSimulatorStarted() {
  whenReady((module) => module.trackSimulatorStarted());
}

export function trackSimulatorCompleted(result: Parameters<AnalyticsRuntime['trackSimulatorCompleted']>[0]) {
  whenReady((module) => module.trackSimulatorCompleted(result));
}

export function trackPdfExported(config: Parameters<AnalyticsRuntime['trackPdfExported']>[0]) {
  whenReady((module) => module.trackPdfExported(config));
}

export function trackCtaClicked(ctaType: string, location: string) {
  whenReady((module) => module.trackCtaClicked(ctaType, location));
}

export function trackPageView(page: string) {
  whenReady((module) => module.trackPageView(page));
}

export function capturePricingException(error: Error, componentStack?: string | null) {
  whenReady((module) => module.capturePricingException(error, componentStack));
}

/** True means sent or queued after consent; never replay pre-consent actions. */
export function trackPricingEvent(event: string, properties: EventProperties = {}) {
  if (!hasConsent() || !import.meta.env?.VITE_POSTHOG_KEY) return false;
  if (runtime) return runtime.trackPricingEvent(event, properties);
  const snapshot = { ...properties };
  whenReady((module) => module.trackPricingEvent(event, snapshot));
  return true;
}
