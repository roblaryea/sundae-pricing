import { describe, expect, it, vi } from 'vitest';
import { importWithRecovery } from '../src/lib/lazyImport';

describe('importWithRecovery', () => {
  it('returns the loaded module when the import succeeds', async () => {
    await expect(importWithRecovery(async () => 'module', 'success')).resolves.toBe('module');
  });

  it('retries a failed chunk once by reloading, then stops looping', async () => {
    const reload = vi.fn();
    vi.stubGlobal('window', {
      location: { reload },
      sessionStorage: {
        values: new Map<string, string>(),
        getItem(key: string) { return this.values.get(key) ?? null; },
        setItem(key: string, value: string) { this.values.set(key, value); },
      },
    });
    const failure = new Error('Failed to fetch dynamically imported module');

    await expect(importWithRecovery(async () => { throw failure; }, 'simulator')).rejects.toBe(failure);
    expect(reload).toHaveBeenCalledOnce();
    await expect(importWithRecovery(async () => { throw failure; }, 'simulator')).rejects.toBe(failure);
    expect(reload).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});
