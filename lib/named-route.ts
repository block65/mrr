import type { Params, ExtractRouteParams } from './types.js';
import { nullOrigin, urlObjectAssign, urlRhs } from './util.js';

type Path = string;

type SearchParamsObject = Record<string, string>;

interface BuildOptionsBase<Q extends SearchParamsObject> {
  searchParams?: Q;
  hash?: string;
  origin?: string;
}

interface BuildOptionsWithParams<
  TPath extends Path,
  Q extends SearchParamsObject,
> extends BuildOptionsBase<Q> {
  params: ExtractRouteParams<TPath>;
}

type NamedRouteWithParams<TPath extends Path, Q extends SearchParamsObject> = {
  path: TPath;
  build: (options: BuildOptionsWithParams<TPath, Q>) => string;
  searchParams: <QNew extends SearchParamsObject>() => NamedRouteWithParams<
    TPath,
    QNew
  >;
};

type NamedRouteWithoutParams<
  TPath extends Path,
  Q extends SearchParamsObject,
> = {
  path: TPath;
  build: (options?: BuildOptionsBase<Q>) => string;
  searchParams: <QNew extends SearchParamsObject>() => NamedRouteWithoutParams<
    TPath,
    QNew
  >;
};

export type NamedRoute<
  TPath extends Path,
  Q extends SearchParamsObject = never,
> = TPath extends `${string}:${string}`
  ? NamedRouteWithParams<TPath, Q>
  : NamedRouteWithoutParams<TPath, Q>;

function buildUrl<TPath extends Path>(
  path: TPath,
  options?: {
    params?: ExtractRouteParams<TPath> | Params;
    searchParams?: SearchParamsObject;
    hash?: string;
    origin?: string;
  },
): string {
  const search = new URLSearchParams(options?.searchParams);
  search.sort();

  const pathname = options?.params ? interpolate(path, options.params) : path;

  const newUrl = urlObjectAssign(new URL(options?.origin || nullOrigin), {
    pathname,
    search: search.toString(),
    hash: options?.hash,
    origin: options?.origin,
  });

  return newUrl.origin === nullOrigin.origin
    ? urlRhs(newUrl)
    : newUrl.toString();
}

export function namedRoute<const TPath extends `${string}:${string}`>(
  path: TPath,
): NamedRouteWithParams<TPath, never>;
export function namedRoute<const TPath extends Path>(
  path: TPath,
): NamedRouteWithoutParams<TPath, never>;
export function namedRoute<const TPath extends Path>(path: TPath) {
  const mkbuild =
    <T extends SearchParamsObject = SearchParamsObject>() =>
    (options?: {
      params?: ExtractRouteParams<TPath> | Params;
      searchParams?: T;
      hash?: string;
      origin?: string;
    }) =>
      buildUrl(path, options);

  return {
    path,
    build: mkbuild(),
    searchParams<QNew extends SearchParamsObject>() {
      return {
        ...this,
        build: mkbuild<QNew>(),
      };
    },
  };
}

export function interpolate<TPath extends Path>(
  path: TPath,
  params: ExtractRouteParams<TPath> | Params = {},
): string {
  return path.replace(/\/:(\w+)[?+*]?/g, (_match, token: keyof typeof params) =>
    params[token] ? `/${params[token]}` : '',
  );
}
