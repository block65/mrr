import type { RouteParams, ExtractRouteParams } from './types.js';
import { urlObjectAssign } from './util.js';

type QueryParams = Record<string, string>;

export interface Routified<P extends string, Q extends QueryParams> {
  path: P;
  build: (x?: {
    params?: ExtractRouteParams<P>;
    query?: Q;
    hash?: string;
    origin?: string;
  }) => URL;
}

function interpolate<T extends RouteParams>(path: string, params: T): string {
  return path.replace(
    /:(\w+)/g,
    (_match, token: string) =>
      (params && token in params && params[token]) || '',
  );
}

export function routify<T extends string, Q extends QueryParams = never>(
  pathname: T,
): Routified<T, Q> {
  return {
    path: pathname,
    build({ params, query, origin, ...rest } = {}) {
      const interpolatedPathname = params
        ? interpolate(pathname, params)
        : pathname;

      const searchParams = new URLSearchParams(query);
      searchParams.sort();

      if (!origin && typeof window === 'undefined') {
        throw new Error('origin is not defined and no DOM is available');
      }

      const newUrl = urlObjectAssign(
        new URL(origin || window.location.origin),
        {
          pathname: interpolatedPathname,
          ...rest,
        },
      );

      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value);
      });

      return newUrl;
    },
  };
}
