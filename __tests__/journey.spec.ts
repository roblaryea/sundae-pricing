/**
 * The journey has ONE ordering.
 *
 * The simulator kept two parallel lists — `journeySteps` in the store (what the
 * progress rail draws) and `stepComponents` in Simulator.tsx (what renders) —
 * and thirteen call sites navigated by hardcoded integer. Folding the
 * standalone locations screen into the package step pushed the two out of
 * alignment by one, so every index past "Select Your Tier" pointed at the wrong
 * component: clicking "Review & Launch" opened the ROI calculator, and the
 * orphaned locations screen stayed reachable through the "Add-ons" dot.
 *
 * A magic integer cannot say which step it means, which is why nothing caught
 * it. These tests pin the single ordering and the store's agreement with it.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import {
  JOURNEY_STEP_IDS,
  LAST_STEP_INDEX,
  stepAt,
  stepIndex,
} from "../src/lib/journey";

const SIMULATOR_SRC = readFileSync("src/pages/Simulator.tsx", "utf8");
const STORE_SRC = readFileSync("src/hooks/useConfiguration.ts", "utf8");

describe("journey ordering", () => {
  it("declares the steps in the order a buyer walks them", () => {
    expect([...JOURNEY_STEP_IDS]).toEqual([
      "persona",
      "layer",
      "tier",
      "addons",
      "watchtower",
      "roi",
      "summary",
    ]);
  });

  it("round-trips every id through its index", () => {
    for (const id of JOURNEY_STEP_IDS) {
      expect(stepAt(stepIndex(id))).toBe(id);
    }
  });

  it("ends on the summary", () => {
    expect(stepAt(LAST_STEP_INDEX)).toBe("summary");
    expect(stepAt(LAST_STEP_INDEX + 1)).toBeUndefined();
  });

  it("has no duplicate ids — a duplicate would make two steps share an index", () => {
    expect(new Set(JOURNEY_STEP_IDS).size).toBe(JOURNEY_STEP_IDS.length);
  });
});

describe("the store's rail agrees with the ordering", () => {
  it("lists exactly the declared steps, in the declared order", () => {
    const ids = [...STORE_SRC.matchAll(/\{ id: '([a-z]+)', name: '[^']*', completed: false \}/g)].map(
      (m) => m[1],
    );
    expect(ids).toEqual([...JOURNEY_STEP_IDS]);
  });

  it("no longer carries the retired standalone locations step", () => {
    expect(JOURNEY_STEP_IDS).not.toContain("locations" as never);
    expect(STORE_SRC).not.toMatch(/id: 'locations'/);
  });
});

describe("the renderer agrees with the ordering", () => {
  it("maps a component for every declared step, keyed by NAME not position", () => {
    for (const id of JOURNEY_STEP_IDS) {
      expect(
        SIMULATOR_SRC,
        `Simulator has no component for the "${id}" step`,
      ).toMatch(new RegExp(`^\\s*${id}:\\s*<`, "m"));
    }
  });

  it("does not render the deleted locations screen", () => {
    expect(SIMULATOR_SRC).not.toMatch(/LocationSlider/);
  });
});

describe("no step is navigated by magic number", () => {
  const FILES = [
    "src/pages/Simulator.tsx",
    "src/components/ConfigBuilder/ModulePicker.tsx",
    "src/components/ConfigBuilder/TierSelector.tsx",
    "src/components/ConfigBuilder/LayerStack.tsx",
    "src/components/ConfigBuilder/WatchtowerToggle.tsx",
    "src/components/ConfigBuilder/CrewBuilder.tsx",
    "src/components/PricingDisplay/ROISimulator.tsx",
    "src/components/PathwaySelector/PathwaySelector.tsx",
  ];

  it.each(FILES)("%s navigates by step name", (file) => {
    const src = readFileSync(file, "utf8");
    const magic = [...src.matchAll(/setCurrentStep\((\d+)\)/g)].map((m) => m[0]);
    expect(
      magic,
      `${file} still navigates by hardcoded index — the two lists can drift again`,
    ).toEqual([]);
  });
});
