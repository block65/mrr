import type { FC, ReactNode } from 'react';

type Path = string | undefined;

export type RouteParams = Record<string, string>;

// CREDIT @types/react-router
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3067ea199822cc2f06edcb84854adeecdfe640ad/types/react-router/index.d.ts#L149
export type ExtractRouteOptionalParam<T extends string> =
  T extends `${infer Param}?`
    ? { [k in Param]: string | undefined }
    : T extends `${infer Param}*`
    ? { [k in Param]: string | undefined }
    : T extends `${infer Param}+`
    ? { [k in Param]: string }
    : { [k in T]: string };

// CREDIT @types/react-router
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3067ea199822cc2f06edcb84854adeecdfe640ad/types/react-router/index.d.ts#L149
export type ExtractRouteParams<PathType extends Path> = string extends PathType
  ? { [k in string]: string }
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PathType extends `${infer _Start}:${infer ParamWithOptionalRegExp}/${infer Rest}`
  ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ParamWithOptionalRegExp extends `${infer Param}(${infer _RegExp})`
    ? ExtractRouteOptionalParam<Param> & ExtractRouteParams<Rest>
    : ExtractRouteOptionalParam<ParamWithOptionalRegExp> &
        ExtractRouteParams<Rest>
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PathType extends `${infer _Start}:${infer ParamWithOptionalRegExp}`
  ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ParamWithOptionalRegExp extends `${infer Param}(${infer _RegExp})`
    ? ExtractRouteOptionalParam<Param>
    : ExtractRouteOptionalParam<ParamWithOptionalRegExp>
  : RouteParams;

  : Params;

export interface RouteProps<T extends string | undefined> {
  path: T;
  wildcard?: boolean | undefined;
}

export type DefaultRouteProps = { children: ReactNode };

export type PartialWithUndefined<T> = {
  [P in keyof T]?: T[P] | undefined;
};

export interface URLProps {
  hash: string;
  host: string;
  hostname: string;
  // href: string;
  origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  searchParams: URLSearchParams;
  username: string;
}

// these are the only things that can change with history API
export interface RestrictedURLProps {
  hash: string;
  pathname: string;
  searchParams: URLSearchParams;

  // things you can never provide (just to make sure TS doesnt allow
  // a stray URL object to be passed)
  origin?: never;
  username?: never;
  password?: never;
  hostname?: never;
  host?: never;
  port?: never;
}

export type RequireKeys<T extends object, K extends keyof T> = Required<
  Pick<T, K>
> &
  Omit<T, K>;
