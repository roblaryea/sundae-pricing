import { useEffect, useRef } from 'react';
import { trackPricingEvent } from '../lib/analytics';
import type { PricingIntent } from '../lib/pricingIntent';

type Properties = Record<string, string | number | boolean | null>;

/** Late consent records the screen currently visible, without replaying pre-consent actions. */
export function usePricingViewEvent(event: string, properties: Properties, enabled = true, viewKey = event) {
  const delivered = useRef('');
  const fingerprint = JSON.stringify(properties);
  useEffect(() => {
    const capture = () => {
      if (enabled && delivered.current !== viewKey && trackPricingEvent(event, JSON.parse(fingerprint))) delivered.current = viewKey;
    };
    capture();
    window.addEventListener('sundae_consent_change', capture);
    return () => window.removeEventListener('sundae_consent_change', capture);
  }, [event, fingerprint, enabled, viewKey]);
}

/** Shared observer covers selection and refinement on both pricing routes. */
export function usePricingConfigurationTelemetry(config: PricingIntent, enabled: boolean) {
  const previous = useRef('');
  const { catalogue: _catalogue, ...selection } = config;
  void _catalogue;
  const fingerprint = JSON.stringify(selection);
  useEffect(() => {
    if (!enabled) return;
    if (previous.current && previous.current !== fingerprint) {
      const before = JSON.parse(previous.current) as Record<string, unknown>;
      const now = JSON.parse(fingerprint) as Record<string, unknown>;
      const fields = Object.keys(now).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(now[key]));
      trackPricingEvent('configuration_changed', { layer: String(now.layer), locations: Number(now.locations), package: String(now.corePackage), fields: fields.join(',') });
    }
    previous.current = fingerprint;
  }, [fingerprint, enabled]);
}
