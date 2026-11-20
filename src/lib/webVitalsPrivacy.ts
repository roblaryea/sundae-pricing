const metrics = ['LCP', 'CLS', 'FCP', 'INP'] as const;

/** Only real public marketing surfaces contribute optional performance samples. */
export function isPublicWebVitalsUrl(value: string, surface: 'website' | 'pricing'): boolean {
  try {
    const url = new URL(value);
    const hosts = surface === 'website' ? ['www.sundae.io', 'sundae.io'] : ['pricing.sundae.io'];
    if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || url.port) return false;
    if (surface === 'pricing') return /^\/(?:simulator\/?)?$/.test(url.pathname);
    const path = url.pathname.replace(/^\/[a-z]{2}(?:-[a-z]+)?(?=\/|$)/i, '') || '/';
    return !/^\/(?:api|book|personal-book|sign-in|signin|get-started|tiktok-review|preview)(?:\/|$)/.test(path)
      && !/^\/diagnostic\/report(?:\/|$)/.test(path);
  } catch { return false; }
}

function cleanUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  try {
    const url = new URL(value, 'https://www.sundae.io');
    if (!['http:', 'https:'].includes(url.protocol)) return;
    url.search = ''; url.hash = ''; url.username = ''; url.password = '';
    return value.startsWith('/') ? url.pathname : url.href;
  } catch { return; }
}

/** Preserve PostHog's metric/value contract without DOM entries or arbitrary fields. */
export function sanitizeWebVitalsProperties(properties: Record<string, unknown>, surface: 'website' | 'pricing'): Record<string, unknown> | null {
  if (!isPublicWebVitalsUrl(String(properties.$current_url || ''), surface)) return null;
  const safe: Record<string, unknown> = {};
  for (const key of ['distinct_id', '$session_id', '$window_id', '$lib', '$lib_version', '$host', '$device_type', '$browser', '$browser_version', '$os', '$os_version', '$screen_width', '$screen_height', '$viewport_width', '$viewport_height']) {
    const value = properties[key];
    if (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) safe[key] = value;
  }
  for (const key of ['$current_url', '$referrer', '$pathname']) {
    const value = cleanUrl(properties[key]);
    if (value) safe[key] = value;
  }
  // Existing internal QA exclusion survives removal of URL query strings.
  if (properties.utm_source === 'internal_qa') safe.utm_source = 'internal_qa';
  for (const metric of metrics) {
    const key = `$web_vitals_${metric}`;
    const value = properties[`${key}_value`];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) continue;
    safe[`${key}_value`] = value;
    const raw = properties[`${key}_event`];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const source = raw as Record<string, unknown>;
    // Buffered metrics may originate before a client-side route change.
    if (!isPublicWebVitalsUrl(String(source.$current_url || ''), surface)) return null;
    const event: Record<string, unknown> = { name: metric, value };
    for (const field of ['delta', 'timestamp']) {
      if (typeof source[field] === 'number' && Number.isFinite(source[field])) event[field] = source[field];
    }
    for (const field of ['id', '$session_id', '$window_id']) {
      if (typeof source[field] === 'string') event[field] = source[field];
    }
    if (['good', 'needs-improvement', 'poor'].includes(String(source.rating))) event.rating = source.rating;
    if (['navigate', 'reload', 'back-forward', 'back-forward-cache', 'prerender', 'restore'].includes(String(source.navigationType))) event.navigationType = source.navigationType;
    const url = cleanUrl(source.$current_url);
    if (url) event.$current_url = url;
    safe[`${key}_event`] = event;
  }
  return safe;
}
