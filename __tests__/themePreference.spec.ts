import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readThemePreference, writeThemePreference } from '../src/lib/themePreference';
afterEach(() => vi.unstubAllGlobals());
function env(cookie = '', local: string | null = null, hostname = 'pricing.sundae.io') {
  const doc = {cookie}; const storage = {getItem:()=>local,setItem:vi.fn()};
  vi.stubGlobal('document',doc); vi.stubGlobal('localStorage',storage); vi.stubGlobal('location',{hostname,protocol:'https:'});
  return {doc,storage};
}
describe('explicit cross-site theme preference', () => {
  it('uses the owner-selected dark default',()=>{env();expect(readThemePreference()).toBe('dark');});
  it('prefers a shared choice to an older per-origin value',()=>{env('sundae_theme=light','dark');expect(readThemePreference()).toBe('light');});
  it('migrates an existing local choice when there is no shared preference',()=>{env('','light');expect(readThemePreference()).toBe('light');});
  it('writes only the expected parent domain and survives blocked storage',()=>{
    const {doc,storage}=env();writeThemePreference('light');expect(doc.cookie).toContain('Domain=.sundae.io');expect(doc.cookie).toContain('Secure');expect(storage.setItem).toHaveBeenCalledWith('sundae-theme','light');
    vi.stubGlobal('localStorage',{getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('blocked');}});
    expect(readThemePreference()).toBe('light');expect(()=>writeThemePreference('dark')).not.toThrow();
  });
  it('does not set the production parent cookie on a preview or local host',()=>{const {doc}=env('',null,'preview.vercel.app');writeThemePreference('light');expect(doc.cookie).not.toContain('Domain=');});
});

// Execute the shipped pre-paint script, rather than duplicating its logic.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const initializer = html.match(/<script id="sundae-theme-init">([\s\S]*?)<\/script>/)![1];
function initializeTheme(cookie: string | (() => never), local: string | null | (() => never)) {
  const add = vi.fn();
  const getItem = vi.fn(() => typeof local === 'function' ? local() : local);
  const document = { get cookie() { return typeof cookie === 'function' ? cookie() : cookie; }, documentElement: { classList: { add } } };
  runInNewContext(initializer, { document, localStorage: { getItem } });
  return { add, getItem };
}
const blocked = () => { throw new Error('storage blocked'); };
describe('actual inline theme initializer', () => {
  it('finds a shared light cookie after other cookies without reading blocked storage', () => {
    const { add, getItem } = initializeTheme('consent=yes; analytics=no; sundae_theme=light; other=1', blocked);
    expect(add).toHaveBeenCalledWith('light');
    expect(getItem).not.toHaveBeenCalled();
  });
  it('gives shared dark precedence over locally stored light', () => {
    const { add, getItem } = initializeTheme('sundae_theme=dark', 'light');
    expect(add).toHaveBeenCalledWith('dark');
    expect(getItem).not.toHaveBeenCalled();
  });
  it('falls back to local light without a valid shared cookie', () => {
    expect(initializeTheme('sundae_theme=invalid', 'light').add).toHaveBeenCalledWith('light');
  });
  it('can read local light even when cookies are unavailable', () => {
    expect(initializeTheme(blocked, 'light').add).toHaveBeenCalledWith('light');
  });
  it('keeps dark when both preference stores are unavailable', () => {
    expect(initializeTheme(blocked, blocked).add).toHaveBeenCalledWith('dark');
  });
});
