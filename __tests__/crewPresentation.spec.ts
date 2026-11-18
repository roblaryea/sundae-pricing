import { describe, expect, it } from 'vitest';
import { additionalBundleCapabilities } from '../src/lib/crewPresentation';
import { computeCrewQuote } from '../src/lib/crewPricing';
import type { CrewBundleId, CrewSkuId } from '../src/types/configuration';

describe('capabilities supplied by the actual billed Crew bundle', () => {
  it('shows unrequested Time without altering requested selections or the price', () => {
    const requested: CrewSkuId[] = ['crew_operations','crew_scheduling','crew_payroll'];
    const before = computeCrewQuote(requested, 3);
    expect(before.lines[0].id).toBe('crew_suite_bundle');
    expect(before.monthly).toBe(697);
    expect(additionalBundleCapabilities(before.lines[0].id as CrewBundleId, requested)).toEqual(['crew_tna']);
    expect(requested).toEqual(['crew_operations','crew_scheduling','crew_payroll']);
    expect(computeCrewQuote(requested, 3)).toEqual(before);
  });
  it('includes the Schedule entitlement granted transitively by Manage', () => {
    const requested: CrewSkuId[] = ['crew_operations','crew_payroll'];
    const quote = computeCrewQuote(requested, 3);
    expect(additionalBundleCapabilities(quote.lines[0].id as CrewBundleId, requested)).toEqual(['crew_scheduling','crew_tna']);
  });
  it('shows no extra capabilities for a fully requested bundle', () => {
    expect(additionalBundleCapabilities('crew_suite_bundle', ['crew_operations','crew_scheduling','crew_tna','crew_payroll'])).toEqual([]);
  });
  it('uses the billed bundle definition rather than assuming Operating', () => {
    expect(additionalBundleCapabilities('crew_schedule_time_bundle', ['crew_scheduling'])).toEqual(['crew_tna']);
    expect(additionalBundleCapabilities('crew_complete_bundle', ['crew_operations','crew_scheduling','crew_payroll'])).toEqual(['crew_tna','crew_people_intelligence']);
  });
});
