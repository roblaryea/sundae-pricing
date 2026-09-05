import { describe, expect, it } from "vitest";
import { getSentryRuntimePolicy, prepareSentryEvent } from "../src/lib/sentryPolicy";

describe("Sentry runtime policy", () => {
  it("captures sampled error replays only on the production pricing host", () => {
    expect(getSentryRuntimePolicy({ hostname: "pricing.sundae.io", mode: "production" })).toEqual({
      environment: "production",
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
    });
    expect(getSentryRuntimePolicy({ hostname: "preview.vercel.app", mode: "production" })).toEqual({
      environment: "preview",
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  });

  it("drops only the known injected MetaMask failure", () => {
    expect(prepareSentryEvent({ message: "Failed to connect to MetaMask" })).toBeNull();
    expect(prepareSentryEvent({ message: "Failed to load pricing catalogue" })).toEqual({
      message: "Failed to load pricing catalogue",
    });
  });
});
