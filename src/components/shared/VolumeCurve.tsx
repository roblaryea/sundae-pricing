import { corePackages, type CorePackageId } from '../../data/pricing';
import { calculateBandedTotal, marginalRateForNextUnit } from '../../lib/pricingEngine';

/**
 * What scale actually does to the rate.
 *
 * The marginal-band mechanic was explained in prose and never shown, so the
 * buyer had to take on trust both halves of a claim that sounds
 * self-contradictory: adding locations makes it cheaper, and adding locations
 * never lowers your bill. Both are true — the RATE falls, the TOTAL does not —
 * and a paragraph is a poor way to carry that.
 *
 * So show it. The price of the NEXT location at a few estate sizes makes the
 * staircase visible, and stating the average beside it keeps the distinction
 * honest: the average is total ÷ locations, an outcome, never a rate card.
 */

const SAMPLE_POINTS = [2, 26, 51, 101];

export function VolumeCurve({
  packageId,
  locations,
}: {
  packageId: CorePackageId;
  locations: number;
}) {
  const pkg = corePackages[packageId];
  const units = Math.max(1, Math.floor(locations));
  const total = calculateBandedTotal(pkg, units);
  const average = Math.round(total / units);
  const next = marginalRateForNextUnit(pkg, units);
  const money = (n: number) => `$${n.toLocaleString()}`;

  // Only the steps that are a real step DOWN, so the strip cannot imply a
  // discount that the curve does not actually give.
  const steps = SAMPLE_POINTS.map((at) => ({
    at,
    rate: marginalRateForNextUnit(pkg, at - 1),
  })).filter((s, i, all) => s.rate !== null && (i === 0 || s.rate !== all[i - 1].rate));

  return (
    <div className="rounded-xl border border-white/10 bg-sundae-surface p-4">
      <p className="text-xs uppercase tracking-wider text-sundae-muted mb-3">
        What scale does to the rate — {pkg.name}
      </p>

      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4">
        {steps.map((s) => (
          <div key={s.at}>
            <div className="font-display text-xl font-bold tabular-nums text-white">
              {money(s.rate as number)}
            </div>
            <p className="text-[11px] text-sundae-muted">
              location #{s.at.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3 text-sm text-sundae-muted">
        <p>
          At <strong className="text-white">{units.toLocaleString()}</strong>{' '}
          {units === 1 ? 'location' : 'locations'}, {pkg.name} totals{' '}
          <strong className="text-white">{money(total)}/mo</strong> — an average of{' '}
          <strong className="text-white">{money(average)}</strong> per location.
          {next !== null ? (
            <>
              {' '}Your next location is priced at{' '}
              <strong className="text-white">{money(next)}</strong>, and adding it does not
              reprice the locations you already have.
            </>
          ) : null}
        </p>
        <p className="mt-2 text-xs">
          The average is total ÷ locations — an outcome, not a rate card. Your bill still
          rises with every location; the rate it rises by is what falls.
        </p>
      </div>
    </div>
  );
}
