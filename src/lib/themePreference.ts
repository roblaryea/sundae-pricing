export type Theme = 'dark' | 'light';
export const THEME_COOKIE = 'sundae_theme';
const valid = (value: string | null | undefined): value is Theme => value === 'dark' || value === 'light';

/** Shared explicit choice wins over an older origin-local choice. Dark is the owner's chosen default. */
export function readThemePreference(): Theme {
  try {
    const cookie = document.cookie.match(/(?:^|;\s*)sundae_theme=(light|dark)(?:;|$)/)?.[1];
    if (valid(cookie)) return cookie;
  } catch { /* Storage restrictions must not prevent rendering. */ }
  try {
    const local = localStorage.getItem('sundae-theme');
    if (valid(local)) return local;
  } catch { /* Keep the deliberate default. */ }
  return 'dark';
}
export function writeThemePreference(theme: Theme) {
  try { localStorage.setItem('sundae-theme', theme); } catch { /* Cookie can still carry the preference. */ }
  const domain = location.hostname === 'sundae.io' || location.hostname.endsWith('.sundae.io') ? '; Domain=.sundae.io' : '';
  try { document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${domain}${location.protocol === 'https:' ? '; Secure' : ''}`; } catch { /* Local choice still works. */ }
}
