/** Keep the first-visit prompt within the existing form; no new step/modal. */
export function focusLocationInput() {
  const input = document.getElementById('buyer-locations') as HTMLInputElement | null;
  if (!input) return;
  input.scrollIntoView({ block: 'center' });
  input.focus({ preventScroll: true });
  input.reportValidity();
}
