import { useId, useState } from 'react';
import { MAX_LOCATIONS, DEFAULT_LOCATION_TICKS } from '../../constants/locations';

/**
 * The estate-size control, in ONE place.
 *
 * There were two: TierSelector hardcoded `max={100}` with tick labels
 * `1 · 10 · 25 · 50 · 100+`, and CrewBuilder used `1 · 25 · 50 · 75 · 100+`.
 * Both laid their labels out with `justify-between`, which spreads five labels
 * evenly at 0 / 25 / 50 / 75 / 100 % of the track regardless of what they say.
 *
 * Crew's values happen to be evenly spaced, so its labels land where they
 * claim. Core's do not: on a linear 1–100 track "10" sits at 9 % and "25" at
 * 24 %, so they rendered 16 and 26 percentage points to the right of the value
 * they name. The buyer drags to the mark under "25" and gets 50 locations.
 *
 * Labels here are positioned at their own value's percentage, so a tick set
 * cannot lie about where it points no matter which values a caller passes.
 *
 * The numeric input exists because a 250-stop track is roughly four pixels per
 * location on a laptop: fine for "about 40", useless for "exactly 137".
 */

export interface LocationSelectorProps {
  locations: number;
  onChange: (next: number) => void;
  /** Upper bound. Crew Lite passes its own cap. */
  max?: number;
  min?: number;
  ticks?: number[];
  label?: string;
  hint?: string;
  /** Track fill + numeral colour, so Core and Crew keep their identities. */
  accent?: string;
  idPrefix?: string;
}

export function LocationSelector({
  locations,
  onChange,
  max = MAX_LOCATIONS,
  min = 1,
  ticks,
  label = 'How many locations?',
  hint,
  accent = '#FF5C4D',
  idPrefix = 'estate',
}: LocationSelectorProps) {
  const reactId = useId();
  const sliderId = `${idPrefix}-size-${reactId}`;
  const numberId = `${idPrefix}-count-${reactId}`;

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const value = clamp(locations);
  const pct = (n: number) => ((clamp(n) - min) / (max - min)) * 100;

  // The number field keeps its own draft so a partially typed value ("1" on the
  // way to "137") is not clamped to something else under the cursor. When the
  // slider moves the value out from under us, the draft resyncs during render
  // (React's documented "adjust state when a prop changes" pattern) rather than
  // in an effect, which would paint the stale number for a frame first.
  const [draft, setDraft] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(String(value));
  }

  const commitDraft = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(parsed);
    setDraft(String(next));
    onChange(next);
  };

  const tickValues = (ticks ?? DEFAULT_LOCATION_TICKS).filter((t) => t >= min && t <= max);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={sliderId} className="block font-bold text-base">
            {label}
          </label>
          {hint ? <p className="text-xs text-sundae-muted mt-1">{hint}</p> : null}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div
              className="font-display text-3xl font-bold tabular-nums leading-none"
              style={{ color: accent }}
            >
              {value}
            </div>
            <p className="text-xs text-sundae-muted mt-1">
              {value === 1 ? 'location' : 'locations'}
            </p>
          </div>
          <input
            id={numberId}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitDraft();
              }
            }}
            aria-label={`${label} (type an exact number)`}
            className="w-20 rounded-lg border border-white/15 bg-sundae-surface px-2 py-1.5 text-right text-sm tabular-nums text-white focus:border-white/40 focus:outline-none"
          />
        </div>
      </div>

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          ['--track' as string]: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct(
            value
          )}%, #2A231C ${pct(value)}%, #2A231C 100%)`,
        }}
        className="touch-slider mt-4 w-full cursor-pointer"
      />

      {/* Absolute positioning, so each label sits at its own value. */}
      <div className="relative mt-2 h-4 select-none">
        {tickValues.map((t) => (
          <span
            key={t}
            className="absolute top-0 -translate-x-1/2 text-[10px] tabular-nums text-sundae-muted"
            style={{ left: `${pct(t)}%` }}
          >
            {t === max ? `${t}+` : t}
          </span>
        ))}
      </div>
    </div>
  );
}
