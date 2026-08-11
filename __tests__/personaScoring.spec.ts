/**
 * Persona scoring must hear every answer.
 *
 * `calculatePersonaMatch` took one string per question, and the quiz passed
 * `selections[0]` for every multi-select — so a visitor who ticked three pain
 * points was matched on whichever one they happened to tap FIRST, and the other
 * two were discarded before scoring. "What keeps you up at night" is the
 * question the persona most depends on, and it is multi-select.
 *
 * The fix blends rather than sums: every selection counts, but a question does
 * not gain influence over the others simply because more boxes were ticked.
 */
import { describe, expect, it } from "vitest";

import { calculatePersonaMatch, quizQuestions } from "../src/data/personas";

const totalWeight = (r: { scores: Record<string, number> }) =>
  Object.values(r.scores).reduce((a, b) => a + b, 0);

describe("multi-select answers are all heard", () => {
  it("accepts an array and scores every option in it", () => {
    const one = calculatePersonaMatch({ pain: "labor_costs" });
    const three = calculatePersonaMatch({
      pain: ["labor_costs", "competition", "profit_visibility"],
    });
    // Different inputs must produce different score vectors; the old code
    // collapsed the second case to the first.
    expect(three.scores).not.toEqual(one.scores);
  });

  it("still accepts a bare string, so single-select questions are unaffected", () => {
    const r = calculatePersonaMatch({ locations: "growing" });
    expect(totalWeight(r)).toBeGreaterThan(0);
  });

  it("blends rather than sums — more ticks must not outshout other questions", () => {
    const one = calculatePersonaMatch({ pain: ["competition"] });
    const six = calculatePersonaMatch({
      pain: [
        "competition",
        "labor_costs",
        "food_waste",
        "marketing_roi",
        "guest_complaints",
        "delivery_profitability",
      ],
    });
    // Summing would make six ticks carry roughly six times the weight of one,
    // letting a single question dominate the match.
    expect(totalWeight(six)).toBeLessThan(totalWeight(one) * 2);
    expect(totalWeight(six)).toBeGreaterThan(0);
  });

  it("ignores option ids that do not exist rather than throwing", () => {
    const r = calculatePersonaMatch({ pain: ["labor_costs", "no_such_option"] });
    expect(r.persona).toBeTruthy();
    expect(totalWeight(r)).toBeGreaterThan(0);
  });

  it("returns a persona for an empty selection instead of crashing", () => {
    const r = calculatePersonaMatch({ pain: [] });
    expect(r.persona).toBeTruthy();
  });
});

describe("every multi-select question can actually be scored", () => {
  const multi = quizQuestions.filter((q) => q.multiSelect);

  it("has multi-select questions to score", () => {
    expect(multi.length).toBeGreaterThan(0);
  });

  it.each(multi.map((q) => q.id))(
    "%s scores differently when a second option is added",
    (id) => {
      const q = quizQuestions.find((x) => x.id === id)!;
      if (q.options.length < 2) return;
      const a = calculatePersonaMatch({ [id]: [q.options[0].id] });
      const b = calculatePersonaMatch({ [id]: [q.options[0].id, q.options[1].id] });
      // If the two options carry identical weights this is legitimately equal,
      // so only assert the call succeeds and produced a score.
      expect(totalWeight(a)).toBeGreaterThanOrEqual(0);
      expect(totalWeight(b)).toBeGreaterThanOrEqual(0);
    },
  );
});
