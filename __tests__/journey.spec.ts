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
  journeyFor,
  lastStepIndex,
  stepAtIn,
  stepIndexIn,
  type JourneyLayer,
} from "../src/lib/journey";

const PATHWAYS: JourneyLayer[] = ["core", "crew", "both"];

const SIMULATOR_SRC = readFileSync("src/pages/Simulator.tsx", "utf8");
const STORE_SRC = readFileSync("src/hooks/useConfiguration.ts", "utf8");

describe("journey ordering", () => {
  it("walks Core through packages, add-ons, Watchtower and the value case", () => {
    expect(journeyFor("core")).toEqual([
      "persona",
      "layer",
      "tier",
      "addons",
      "watchtower",
      "roi",
      "summary",
    ]);
  });

  it("collapses Crew into its single builder", () => {
    expect(journeyFor("crew")).toEqual(["persona", "layer", "crew", "summary"]);
  });

  it("asks the estate ONCE, up front, on the combined pathway", () => {
    // `locations` is one value shared by both rails. The old flow showed its
    // slider on the Core package screen AND inside the Crew builder, so moving
    // it on one silently repriced the other.
    const both = journeyFor("both");
    expect(both).toEqual([
      "persona",
      "layer",
      "estate",
      "tier",
      "addons",
      "watchtower",
      "crew",
      "roi",
      "summary",
    ]);
    expect(both.filter((s) => s === "estate")).toHaveLength(1);
    expect(both.indexOf("estate")).toBeLessThan(both.indexOf("tier"));
    expect(both.indexOf("estate")).toBeLessThan(both.indexOf("crew"));
  });

  it("puts Crew before the value case, because the value case prices both rails", () => {
    const both = journeyFor("both");
    expect(both.indexOf("crew")).toBeLessThan(both.indexOf("roi"));
  });

  it("round-trips every id through its index, within its own pathway", () => {
    for (const layer of PATHWAYS) {
      for (const id of journeyFor(layer)) {
        expect(stepAtIn(layer, stepIndexIn(layer, id))).toBe(id);
      }
    }
  });

  it("ends every pathway on the summary", () => {
    for (const layer of PATHWAYS) {
      expect(stepAtIn(layer, lastStepIndex(layer))).toBe("summary");
      expect(stepAtIn(layer, lastStepIndex(layer) + 1)).toBeUndefined();
    }
  });

  it("reports -1 for a step a pathway omits, rather than a wrong position", () => {
    // Core has no Crew step; asking for one must not silently resolve to
    // whatever sits at that index in a different pathway.
    expect(stepIndexIn("core", "crew")).toBe(-1);
    expect(stepIndexIn("core", "estate")).toBe(-1);
    expect(stepIndexIn("crew", "watchtower")).toBe(-1);
  });

  it("has no duplicate ids — a duplicate would make two steps share an index", () => {
    expect(new Set(JOURNEY_STEP_IDS).size).toBe(JOURNEY_STEP_IDS.length);
  });
});

describe("the store's rail agrees with the ordering", () => {
  it("carries completion state for every declared step", () => {
    // The rail renders only the visitor's own pathway, but the store must be
    // able to MARK any step: a step is not unmarkable just because another
    // pathway omits it.
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
