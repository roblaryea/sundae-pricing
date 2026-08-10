/**
 * CTL-13 — locale packs must match the shape and the prices they are rendered
 * against.
 *
 * `generatedAuxiliaryLocalePacks.ts` is a checked-in artifact with NO generator
 * in this repo, so it silently drifted away from its English source. Two P0s
 * shipped from that drift, and neither existing gate could see them:
 *
 *   1. HARD CRASH. `layerStackCopy.<locale>` carried the retired `report`
 *      layer and had NO `crew` key, in all 18 generated locales. LayerStack
 *      renders the Crew card unconditionally, so `copy.crew` was undefined and
 *      `layerItem.copy.name` threw. The ErrorBoundary wraps the whole app, so
 *      this took the ENTIRE simulator down — not one card — in 18 of 22
 *      locales. tsc missed it: without `noUncheckedIndexedAccess` the index
 *      lookup is typed non-optional.
 *
 *   2. RETIRED PRICE, LIVE. `core.startingPrice` was still the retired Core
 *      Lite price of $279 ("Ab 279 $/Monat", "月額279ドルから") in the same 18
 *      locales, rendered on step 1. This is the defect class a retired-NAME
 *      sweep cannot catch: a retired PRICE carries no retired name.
 *
 * `qa:i18n` only checks 28 banned-translation regexes; `validate:pricing` never
 * reads the locale packs at all. Both reported PASS on the broken tree. These
 * tests are the missing gate.
 */
import { describe, expect, it } from "vitest";

import { generatedAuxiliaryLocalePacks } from "../src/lib/generatedAuxiliaryLocalePacks";
import { corePackages, crewSkus } from "../src/data/pricing";

const layerStackCopy = generatedAuxiliaryLocalePacks.layerStackCopy as unknown as Record<
  string,
  Record<string, any>
>;
const LOCALES = Object.keys(layerStackCopy);

/** Layers LayerStack actually renders. A missing key here is a crash. */
const RENDERED_LAYERS = ["core", "crew"] as const;
const CARD_FIELDS = ["name", "tagline", "startingPrice", "features"] as const;

/** Retired offers must never reach a locale pack. */
const RETIRED_NAMES = [
  "Report Lite",
  "Report Plus",
  "Report Pro",
  "Core Lite",
  "Core Pro",
];

/** Retired PRICES — the class a name sweep cannot catch. */
const RETIRED_PRICES = ["279", "449", "159"];

describe("layerStackCopy structural parity", () => {
  it("ships every locale the app can select", () => {
    expect(LOCALES.length).toBeGreaterThan(0);
  });

  it.each(LOCALES)(
    "%s defines every layer LayerStack renders",
    (locale) => {
      for (const layer of RENDERED_LAYERS) {
        expect(
          layerStackCopy[locale][layer],
          `${locale}.${layer} is missing — LayerStack dereferences it unconditionally and the ErrorBoundary takes the whole app down`,
        ).toBeTruthy();
      }
    },
  );

  it.each(LOCALES)("%s populates every card field", (locale) => {
    for (const layer of RENDERED_LAYERS) {
      const card = layerStackCopy[locale][layer];
      for (const field of CARD_FIELDS) {
        expect(card?.[field], `${locale}.${layer}.${field}`).toBeTruthy();
      }
      expect(Array.isArray(card.features)).toBe(true);
      expect(card.features.length).toBeGreaterThan(0);
    }
  });

  it.each(LOCALES)("%s carries no retired layer", (locale) => {
    // Report was retired with v1.7. Leaving the block in the pack invites a
    // future consumer to render a retired offer.
    expect(layerStackCopy[locale].report).toBeUndefined();
  });

  it("keeps every locale on an identical key set", () => {
    const shapes = new Set(
      LOCALES.map((l) => Object.keys(layerStackCopy[l]).sort().join(",")),
    );
    expect(
      shapes.size,
      `locales disagree on shape:\n${[...shapes].join("\n")}`,
    ).toBe(1);
  });
});

describe("layerStackCopy price integrity", () => {
  it.each(LOCALES)("%s names no retired offer", (locale) => {
    const blob = JSON.stringify(layerStackCopy[locale]);
    for (const name of RETIRED_NAMES) {
      expect(blob, `${locale} mentions retired offer "${name}"`).not.toContain(
        name,
      );
    }
  });

  it.each(LOCALES)("%s quotes no retired price", (locale) => {
    const blob = JSON.stringify(layerStackCopy[locale].core);
    for (const price of RETIRED_PRICES) {
      expect(
        blob,
        `${locale}.core quotes retired price ${price} — a retired PRICE carries no retired NAME, so only this check catches it`,
      ).not.toContain(price);
    }
  });

  it.each(LOCALES)(
    "%s quotes the current Core Foundation first-unit anchor",
    (locale) => {
      const anchor = corePackages.core_foundation.firstUnitPrice;
      const blob = layerStackCopy[locale].core.startingPrice as string;
      // Locales group thousands differently (1,195 / 1.195 / 1 195 / 1195).
      const digits = blob.replace(/[.,\s\u00a0\u202f\u2009]/g, "");
      expect(
        digits,
        `${locale}.core.startingPrice = "${blob}" does not reference ${anchor}`,
      ).toContain(String(anchor));
    },
  );

  it.each(LOCALES)("%s quotes the current Crew entry price", (locale) => {
    const entry = crewSkus.crew_lite.orgLicensePrice;
    const blob = layerStackCopy[locale].crew.startingPrice as string;
    const digits = blob.replace(/[.,\s\u00a0\u202f\u2009]/g, "");
    expect(
      digits,
      `${locale}.crew.startingPrice = "${blob}" does not reference ${entry}`,
    ).toContain(String(entry));
  });
});
