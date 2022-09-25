import type { RouteParams, ExtractRouteParams } from './types.js';
import { nullOrigin, urlObjectAssign, urlRhs } from './util.js';

type QueryParams = Record<string, string>;

export interface NamedRoute<P extends string, Q extends QueryParams> {
  path: P;
  build: (x?: {
    params?: ExtractRouteParams<P>;
    query?: Q;
    hash?: string;
    origin?: string;
  }) => string;
}

function interpolate<T extends RouteParams>(path: string, params: T): string {
  return path.replace(
    /:(\w+)/g,
    (_match, token: string) =>
      (params && token in params && params[token]) || '',
  );
}

export function namedRoute<T extends string, Q extends QueryParams = never>(
  pathname: T,
): NamedRoute<T, Q> {
  return {
    path: pathname,
    build({ params, query, origin, ...rest } = {}) {
      const interpolatedPathname = params
        ? interpolate(pathname, params)
        : pathname;

      const searchParams = new URLSearchParams(query);
      searchParams.sort();

      const newUrl = urlObjectAssign(new URL(origin || nullOrigin), {
        pathname: interpolatedPathname,
        search: searchParams.toString(),
        ...rest,
      });

      return newUrl.origin === nullOrigin.origin
        ? urlRhs(newUrl)
        : newUrl.toString();
    },
  };
}
