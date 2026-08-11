/**
 * The config builder's side of the motion contract.
 *
 * These are the defects this guards against, all of which shipped:
 *
 *   • `transition-all` sat on option cards whose transform framer was already
 *     driving. `all` includes `transform`, so the browser re-eased every frame
 *     framer wrote and roughly four fifths of the intended lift never landed.
 *   • Entrance delay was passed as the component's `transition` prop. In framer
 *     that prop is the DEFAULT for every animation the component runs, hover
 *     included — the last package card took the better part of a third of a
 *     second to acknowledge a pointer that was already over it.
 *   • Per-index delays (`delay: index * 0.1`) pushed the last card of a long
 *     grid almost a second behind the first.
 *   • Hover and press were declared as bare objects with no transition, so they
 *     fell through to framer's default spring and overshot the resting size.
 *   • None of it consulted `prefers-reduced-motion`.
 *
 * Each rule below is enforced against source text rather than a render because
 * every one of them is a property of how the component is DECLARED. A test that
 * mounted the tree could observe the symptom; only this can name the cause.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

/** Every surface in the interaction cluster. */
const FILES = [
  "src/components/ConfigBuilder/TierSelector.tsx",
  "src/components/ConfigBuilder/ModulePicker.tsx",
  "src/components/ConfigBuilder/WatchtowerToggle.tsx",
  "src/components/ConfigBuilder/LayerStack.tsx",
  "src/components/ConfigBuilder/CrewBuilder.tsx",
  "src/pages/Simulator.tsx",
] as const;

/**
 * Comments in these files deliberately quote the patterns being banned, so a
 * naive grep would fail on its own explanation. Strip them first.
 */
function code(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const SOURCES = new Map(FILES.map((f) => [f, code(f)] as const));

describe("CSS transitions never overlap what framer is animating", () => {
  it.each(FILES)("%s uses no transition-all", (file) => {
    // `transition-all` covers `transform`, which is precisely the property
    // framer writes per frame on hover and press.
    expect(SOURCES.get(file)).not.toMatch(/\btransition-all\b/);
  });
});

describe("entrance delay cannot leak into interaction", () => {
  it.each(FILES)("%s declares no per-index delay", (file) => {
    // `delay: index * 0.08`, `delay: i * 0.1`, `delay: idx * 0.06` — all of
    // them scale unbounded with list length AND land on hover as well.
    expect(SOURCES.get(file)).not.toMatch(/delay:\s*[A-Za-z_$][\w$]*\s*\*/);
  });

  it.each(FILES)("%s passes no bare `transition={{ delay` prop", (file) => {
    // A `transition` prop is the component's default for EVERY animation it
    // runs. Entrance delay belongs inside the variant, where `fadeUp` puts it.
    expect(SOURCES.get(file)).not.toMatch(/transition=\{\{[^}]*delay/);
  });
});

describe("hover and press come from the shared system", () => {
  it.each(FILES)("%s declares no inline whileHover/whileTap object", (file) => {
    // An inline `whileHover={{ y: -8 }}` carries no transition, so framer falls
    // back to its default spring — visibly under-damped, overshooting about a
    // third past the final size. `selectableCard` supplies a tween.
    expect(SOURCES.get(file)).not.toMatch(/while(Hover|Tap)=\{\{/);
  });
});

describe("reduced motion is honoured on every animated surface", () => {
  it.each(FILES)("%s reads useReducedMotionSafe", (file) => {
    const src = SOURCES.get(file)!;
    expect(src).toMatch(/useReducedMotionSafe/);
    expect(src, "imported but never called").toMatch(/useReducedMotionSafe\(\)/);
  });

  it.each(FILES)("%s animates no position or scale outside the system", (file) => {
    // Raw `initial={{ opacity: 0, y: 20 }}` / `scale: 0.95` pairs cannot drop
    // their travel under `prefers-reduced-motion`; the helpers can.
    expect(SOURCES.get(file)).not.toMatch(/initial=\{\{/);
    expect(SOURCES.get(file)).not.toMatch(/animate=\{\{/);
  });
});

describe("the shared helpers are actually the ones being used", () => {
  const BUILDERS = FILES.filter((f) => f.includes("ConfigBuilder"));

  it.each(BUILDERS)("%s builds entrances from fadeUp", (file) => {
    expect(SOURCES.get(file)).toMatch(/variants=\{fadeUp\(/);
  });

  it.each(BUILDERS)("%s sequences lists with the capped staggerChildren", (file) => {
    expect(SOURCES.get(file)).toMatch(/variants=\{staggerChildren\(/);
  });

  it.each(BUILDERS)("%s takes hover and press from selectableCard", (file) => {
    expect(SOURCES.get(file)).toMatch(/selectableCard\(reduced\)/);
  });
});
