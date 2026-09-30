/**
 * Recover once from a stale HTML/module graph after a deployment removes a
 * hashed Vite chunk. The session guard prevents an unavailable release from
 * trapping the visitor in an infinite reload loop.
 */
export async function importWithRecovery<T>(load: () => Promise<T>, key: string): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      throw error;
    }

    const recoveryKey = `sundae:chunk-recovery:${key}`;
    if (window.sessionStorage.getItem(recoveryKey) === '1') {
      throw error;
    }

    window.sessionStorage.setItem(recoveryKey, '1');
    window.location.reload();
    // Reload is asynchronous; reject so callers remain safe in test/browser
    // environments where reload is stubbed or cancelled.
    throw error;
  }
}
