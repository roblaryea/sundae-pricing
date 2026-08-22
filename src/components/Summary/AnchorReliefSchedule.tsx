import { anchorReliefSchedule } from '../../lib/anchorRelief';

/**
 * The four-year price path under anchor relief.
 *
 * Shown in full, step-ups included. A schedule that prints only the discounted
 * years is the same document that produces an unwelcome surprise at renewal,
 * and the entire reason for a glide rather than a cliff is that the buyer can
 * see where it lands before they sign.
 */
export function AnchorReliefSchedule({
  anchorTotal,
  recurringTotal,
  locations,
  money,
}: {
  anchorTotal: number;
  recurringTotal: number;
  locations: number;
  money: (n: number) => string;
}) {
  if (anchorTotal <= 0) return null;
  const rows = anchorReliefSchedule({ anchorTotal, recurringTotal, locations });
  const list = rows[rows.length - 1].monthly;
  const yearOneSaving = 1 - rows[0].monthly / list;

  return (
    <div className="rounded-xl border border-white/10 bg-sundae-surface p-5">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3 className="font-bold text-base">Onboarding price path</h3>
        <span className="text-xs text-sundae-muted">
          {(yearOneSaving * 100).toFixed(0)}% off in year one
        </span>
      </div>
      <p className="text-xs text-sundae-muted mb-4">
        Relief applies to the first-location anchor only. Your per-location rates never change.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-sundae-muted">
              <th className="pb-2 font-medium">Year</th>
              <th className="pb-2 font-medium text-right">Anchor relief</th>
              <th className="pb-2 font-medium text-right">Monthly</th>
              <th className="pb-2 font-medium text-right">Avg / location</th>
              <th className="pb-2 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className="border-t border-white/5">
                <td className="py-2">Year {r.year}</td>
                <td className="py-2 text-right tabular-nums text-sundae-muted">
                  {r.discount > 0 ? `−${(r.discount * 100).toFixed(0)}%` : '—'}
                </td>
                <td className="py-2 text-right tabular-nums font-semibold text-white">
                  {money(Math.round(r.monthly))}
                </td>
                <td className="py-2 text-right tabular-nums text-sundae-muted">
                  {money(Math.round(r.perLocation))}
                </td>
                <td className="py-2 text-right tabular-nums text-sundae-muted">
                  {r.stepUp === null ? '—' : `+${(r.stepUp * 100).toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-sundae-muted">
        Year 4 is list price. The increases are shown so the path is visible before you sign it —
        the average is total ÷ locations, an outcome rather than a rate card.
      </p>
    </div>
  );
}
