import type { Event } from "@sentry/react";

const PRODUCTION_HOSTS = new Set(["pricing.sundae.io"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function getSentryRuntimePolicy(input: {
  hostname?: string | null;
  mode?: string | null;
}) {
  const hostname = normalize(input.hostname);
  const mode = normalize(input.mode);
  const production = PRODUCTION_HOSTS.has(hostname);

  let environment = "unknown";
  if (production) environment = "production";
  else if (LOCAL_HOSTS.has(hostname)) environment = "local";
  else if (hostname.endsWith(".vercel.app")) environment = "preview";
  else if (mode === "development" || mode === "test") environment = mode;

  return {
    environment,
    replaysSessionSampleRate: 0,
    // Keep previews and local testing from consuming the shared replay allowance.
    replaysOnErrorSampleRate: production ? 0.1 : 0,
  } as const;
}

export function prepareSentryEvent<T extends Event>(event: T): T | null {
  const messages = [
    event.message,
    ...(event.exception?.values ?? []).map((exception) => exception.value),
    ...(event.breadcrumbs ?? []).map((breadcrumb) => breadcrumb.message),
  ].filter((message): message is string => typeof message === "string");

  const extensionNoise = messages.some((message) =>
    /failed to connect to metamask|metamask extension not found/i.test(message),
  );

  if (extensionNoise) return null;
  // Configuration intent and contact data do not belong in telemetry URLs.
  if (event.request?.url) event.request.url = event.request.url.split('?')[0];
  event.user = undefined;
  for (const breadcrumb of event.breadcrumbs ?? []) {
    for (const key of ['url','from','to']) {
      if (typeof breadcrumb.data?.[key] === 'string') breadcrumb.data[key] = breadcrumb.data[key].split('?')[0];
    }
  }
  return event;
}
