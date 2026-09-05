import posthog from "posthog-js";
import * as Sentry from "@sentry/react";
import { getSentryRuntimePolicy, prepareSentryEvent } from "./sentryPolicy";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

let analyticsInitialized = false;

export function initAnalytics() {
  if (analyticsInitialized) return;

  // PostHog
  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: { maskAllInputs: true },
      loaded: (ph) => {
        if (import.meta.env.DEV) ph.opt_out_capturing();
      },
    });
  }

  // Sentry
  if (SENTRY_DSN) {
    const sentryPolicy = getSentryRuntimePolicy({
      hostname: window.location.hostname,
      mode: import.meta.env.MODE,
    });

    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        ...(sentryPolicy.replaysOnErrorSampleRate > 0
          ? [Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true })]
          : []),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: sentryPolicy.replaysSessionSampleRate,
      replaysOnErrorSampleRate: sentryPolicy.replaysOnErrorSampleRate,
      environment: sentryPolicy.environment,
      beforeSend: prepareSentryEvent,
    });
  }

  analyticsInitialized = true;
}

/**
 * Initialize analytics only if the user has given cookie consent.
 * Called on app start + when consent is granted.
 */
export function initAnalyticsIfConsented() {
  const consent = localStorage.getItem("sundae_cookie_consent");
  if (consent === "accepted") {
    initAnalytics();
  }
}

// --- Pricing-specific event tracking ---

export function trackModuleSelected(moduleName: string, price: number) {
  posthog.capture("pricing_module_selected", { module: moduleName, price });
}

export function trackModuleDeselected(moduleName: string) {
  posthog.capture("pricing_module_deselected", { module: moduleName });
}

export function trackPricingConfigured(config: { modules: string[]; totalPrice: number; locationCount: number }) {
  posthog.capture("pricing_configured", config);
}

export function trackSimulatorStarted() {
  posthog.capture("simulator_started");
}

export function trackSimulatorCompleted(result: { roi: number; paybackMonths: number }) {
  posthog.capture("simulator_completed", result);
}

export function trackPdfExported(config: { modules: string[]; totalPrice: number }) {
  posthog.capture("pricing_pdf_exported", config);
}

export function trackCtaClicked(ctaType: string, location: string) {
  posthog.capture("cta_clicked", { cta_type: ctaType, location });
}

export function trackPageView(page: string) {
  posthog.capture("$pageview", { page });
}
