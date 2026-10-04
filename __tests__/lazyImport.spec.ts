import { afterEach, describe, expect, it, vi } from 'vitest';
import { importWithRecovery } from '../src/lib/lazyImport';

describe('importWithRecovery', () => {
  afterEach(() => vi.unstubAllGlobals());

  function browser() {
    const values = new Map<string, string>();
    const reload = vi.fn();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal('window', { location: { reload }, sessionStorage: storage });
    return { reload, storage, values };
  }
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
  });

  it('does not reload for programming errors', async () => {
    const { reload } = browser();
    const failure = new ReferenceError('layer is not defined');
    await expect(importWithRecovery(async () => { throw failure; }, 'simulator')).rejects.toBe(failure);
    expect(reload).not.toHaveBeenCalled();
  });

  it('preserves the failure when the storage getter is denied', async () => {
    const reload = vi.fn();
    vi.stubGlobal('window', { location: { reload }, get sessionStorage() { throw new Error('denied'); } });
    const failure = new TypeError('Importing a module script failed');
    await expect(importWithRecovery(async () => { throw failure; }, 'simulator')).rejects.toBe(failure);
    expect(reload).not.toHaveBeenCalled();
  });

  it('does not reload when the guard is not persisted', async () => {
    const { reload, storage } = browser();
    storage.setItem = () => {};
    const failure = new TypeError('error loading dynamically imported module');
    await expect(importWithRecovery(async () => { throw failure; }, 'simulator')).rejects.toBe(failure);
    expect(reload).not.toHaveBeenCalled();
  });

  it('allows a later deployment to recover after a successful import', async () => {
    const { reload, values } = browser();
    values.set('sundae:chunk-recovery:simulator', '1');
    await expect(importWithRecovery(async () => 'module', 'simulator')).resolves.toBe('module');
    expect(values.has('sundae:chunk-recovery:simulator')).toBe(false);
    const failure = new TypeError('Failed to fetch dynamically imported module');
    await expect(importWithRecovery(async () => { throw failure; }, 'simulator')).rejects.toBe(failure);
    expect(reload).toHaveBeenCalledOnce();
  });

  it('does not require storage or a browser for successful imports', async () => {
    vi.stubGlobal('window', undefined);
    await expect(importWithRecovery(async () => 'module', 'server')).resolves.toBe('module');
    const failure = new TypeError('Failed to fetch dynamically imported module');
    await expect(importWithRecovery(async () => { throw failure; }, 'server')).rejects.toBe(failure);
  });
});
