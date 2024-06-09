import { useEffect, useMemo } from 'react';
import { useLocation } from './use-router.js';

export function useNavigate() {
  return useLocation()[1];
}

export function useSearchParams() {
  const [{ searchParams }] = useLocation();
  return searchParams;
}

export function useSearchParam(param: string) {
  return useSearchParams()?.get(param);
}

export function usePathname(): string {
  const [{ pathname }] = useLocation();
  return pathname;
}

export function useHashAsParams(): URLSearchParams {
  const [{ hash }] = useLocation();
  return useMemo(() => new URLSearchParams(hash.slice(1)), [hash]);
}

export function useHashParam(value: string) {
  return useHashAsParams().get(value);
}

/**
 * @deprecated
 * @use navigation API and intercept hook
 */
export function usePreventUnload(
  cb: boolean | ((e: BeforeUnloadEvent) => boolean),
) {
  useEffect(() => {
    const listenerOpts = { capture: true };

    const listener = (e: BeforeUnloadEvent) => {
      const preventUnload = typeof cb === 'function' ? cb(e) : cb;
      if (preventUnload) {
        e.preventDefault();
        e.returnValue = preventUnload;
      }
    };

    window?.addEventListener('beforeunload', listener, listenerOpts);

    return () => {
      window?.removeEventListener('beforeunload', listener, listenerOpts);
    };
  }, [cb]);
}
