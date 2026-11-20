import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('permits only the exact Web Vitals extension on the regional assets host', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const csp = html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/)?.[1];
  expect(csp).toBeDefined();
  const scripts = csp!.split(';').find(value => value.trim().startsWith('script-src '))!.trim().split(/\s+/).slice(1);
  const regional = scripts.filter(value => value.includes('us-assets.i.posthog.com'));
  expect(regional).toEqual(['https://us-assets.i.posthog.com/static/web-vitals.js']);
  expect(scripts).not.toContain('https://*.posthog.com');
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
});
