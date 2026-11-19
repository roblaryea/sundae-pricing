export const LOCATION_INACTIVITY_MS = 24 * 60 * 60 * 1000;

/** Missing, future or expired activity cannot keep a default footprint visible. */
export function isRecentLocationActivity(value: unknown, now = Date.now()): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= now && now - value < LOCATION_INACTIVITY_MS;
}
