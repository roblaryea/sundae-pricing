/**
 * Recover once from a stale HTML/module graph after a deployment removes a
 * hashed Vite chunk. The session guard prevents an unavailable release from
 * trapping the visitor in an infinite reload loop.
 */
export async function importWithRecovery<T>(load: () => Promise<T>, key: string): Promise<T> {
  const recoveryKey = `sundae:chunk-recovery:${key}`;
  try {
    const result = await load();
    // A successful new module graph permits recovery from a later deployment.
    try { window.sessionStorage.removeItem(recoveryKey); } catch { /* Storage is optional on success. */ }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i.test(message)
      || typeof window === 'undefined') {
      throw error;
    }

    try {
      const storage = window.sessionStorage;
      if (storage.getItem(recoveryKey) === '1') throw error;
      storage.setItem(recoveryKey, '1');
      // Fail closed if the guard cannot be persisted: no uncontrolled reloads.
      if (storage.getItem(recoveryKey) !== '1') throw error;
      window.location.reload();
    } catch {
      // Preserve the original import failure when storage/reload is denied.
    }
    // Reload is asynchronous; reject so callers remain safe in test/browser
    // environments where reload is stubbed or cancelled.
    throw error;
  }
}
