import type { Params, ExtractRouteParams } from './types.js';
import { nullOrigin, urlObjectAssign, urlRhs } from './util.js';

type Path = string;

type SearchParamsObject = Record<string, string>;

export interface NamedRouteWithParams<
  TPath extends Path,
  Q extends SearchParamsObject,
> {
  path: TPath;
  build: (options: {
    params: ExtractRouteParams<TPath>;
    searchParams?: Q;
    hash?: string;
    origin?: string;
  }) => string;
}

export interface NamedRouteWithoutParams<
  TPath extends Path,
  Q extends SearchParamsObject,
> {
  path: TPath;
  build: (options?: {
    searchParams?: Q;
    hash?: string;
    origin?: string;
  }) => string;
}

export type NamedRoute<
  TPath extends Path,
  Q extends SearchParamsObject = never,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = TPath extends `${string}:${infer _Rest}`
  ? {
      path: TPath;
      build: (x: {
        params: ExtractRouteParams<TPath>;
        searchParams?: Q;
        hash?: string;
        origin?: string;
      }) => string;
    }
  : {
      path: TPath;
      build: (x?: {
        searchParams?: Q;
        hash?: string;
        origin?: string;
      }) => string;
    };

export function interpolate<TPath extends Path>(
  path: TPath,
  params: ExtractRouteParams<TPath> | Params = {},
): string {
  return path.replace(/\/:(\w+)[?+*]?/g, (_match, token: keyof typeof params) =>
    params[token] ? `/${params[token]}` : '',
  );
}

type PathWithParams = `${Path}:${string}`;

function pathHasParams(path: PathWithParams | Path): path is PathWithParams {
  return path.includes(':');
}

export function namedRoute<
  Q extends SearchParamsObject = never,
  TPath extends PathWithParams = PathWithParams,
>(path: TPath): NamedRouteWithParams<TPath, Q>;
export function namedRoute<
  Q extends SearchParamsObject = never,
  TPath extends Path = Path,
>(path: TPath): NamedRouteWithoutParams<TPath, Q>;
export function namedRoute<
  Q extends SearchParamsObject = never,
  TPath extends PathWithParams | Path = Path,
>(path: TPath) {
  if (pathHasParams(path)) {
    return {
      path,
      build(options: {
        params: ExtractRouteParams<TPath>;
        searchParams?: Q;
        hash?: string;
        origin?: string;
      }) {
        const search = new URLSearchParams(options?.searchParams);
        search.sort();

        const newUrl = urlObjectAssign(new URL(origin || nullOrigin), {
          pathname:
            options && 'params' in options
              ? interpolate(path, options.params)
              : path,
          search: search.toString(),
          hash: options?.hash,
          origin: options?.origin,
        });

        return newUrl.origin === nullOrigin.origin
          ? urlRhs(newUrl)
          : newUrl.toString();
      },
    };
  }
  return {
    path,
    build(options: { searchParams?: Q; hash?: string; origin?: string }) {
      const search = new URLSearchParams(options?.searchParams);
      search.sort();

      const newUrl = urlObjectAssign(new URL(origin || nullOrigin), {
        pathname: path,
        search: search.toString(),
        hash: options?.hash,
        origin: options?.origin,
      });

      return newUrl.origin === nullOrigin.origin
        ? urlRhs(newUrl)
        : newUrl.toString();
    },
  };
}
