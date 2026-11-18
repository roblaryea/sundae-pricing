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
