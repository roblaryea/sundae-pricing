import { describe, expect, it } from 'vitest';
import { journeyFor, lastStepIndex, stepAtIn, stepIndexIn } from '../src/lib/journey';
describe('the shorter buyer journey', () => {
  it.each(['core','crew','both'] as const)('%s needs at most three screens and does not require discovery or ROI', (layer) => {
    const journey = journeyFor(layer);
    expect(journey).toEqual(['tier','addons','summary']);
    expect(journey).not.toContain('persona');
    expect(journey).not.toContain('roi');
    expect(stepAtIn(layer,lastStepIndex(layer))).toBe('summary');
    for (const id of journey) expect(stepAtIn(layer,stepIndexIn(layer,id))).toBe(id);
  });
});
