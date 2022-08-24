import { useMemo } from 'react';
import { useLocation } from './router.js';

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
