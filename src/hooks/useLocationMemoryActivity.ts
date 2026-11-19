import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfiguration } from './useConfiguration';

/** Count visits and purposeful foreground input, never renders or refreshes. */
export function useLocationMemoryActivity() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/' && pathname.replace(/\/+$/, '') !== '/simulator') return;
    const record = () => {
      if (document.visibilityState === 'visible') useConfiguration.getState().recordLocationActivity();
    };
    const interact = (event: Event) => { if (event.isTrusted) record(); };
    record();
    window.addEventListener('pointerdown', interact, true);
    window.addEventListener('keydown', interact, true);
    document.addEventListener('scrollend', interact);
    window.addEventListener('focus', record);
    window.addEventListener('pageshow', record);
    document.addEventListener('visibilitychange', record);
    return () => {
      window.removeEventListener('pointerdown', interact, true);
      window.removeEventListener('keydown', interact, true);
      document.removeEventListener('scrollend', interact);
      window.removeEventListener('focus', record);
      window.removeEventListener('pageshow', record);
      document.removeEventListener('visibilitychange', record);
    };
  }, [pathname]);
}
