import type { FC, ReactNode } from 'react';

export type DefaultRouteParams = Record<string, string>;

// CREDIT @types/react-router
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3067ea199822cc2f06edcb84854adeecdfe640ad/types/react-router/index.d.ts#L149
export type ExtractRouteOptionalParam<PathType extends string> =
  PathType extends `${infer Param}?`
    ? { [k in Param]: string | undefined }
    : PathType extends `${infer Param}*`
    ? { [k in Param]: string | undefined }
    : PathType extends `${infer Param}+`
    ? { [k in Param]: string }
    : { [k in PathType]: string };

// CREDIT @types/react-router
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3067ea199822cc2f06edcb84854adeecdfe640ad/types/react-router/index.d.ts#L149
export type ExtractRouteParams<PathType extends string> =
  string extends PathType
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
    : DefaultRouteParams;

export interface RouteWithChildren<T extends string> {
  path?: T;
  children?: ReactNode;
}
export interface RouteWithChildFunction<
  T extends string,
  P extends DefaultRouteParams = ExtractRouteParams<T>,
> {
  path?: T;
  children: (params: P) => JSX.Element;
}
export interface RouteWithComponent<
  T extends string,
  P extends DefaultRouteParams = ExtractRouteParams<T>,
> {
  path?: T;
  component: FC<P>;
}

export type PartialWithUndefined<T> = {
  [P in keyof T]?: T[P] | undefined;
};

export interface RouteComponentProps<
  T extends DefaultRouteParams = DefaultRouteParams,
> {
  params: T;
}

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

  // things you can never provider (just to make sure TS doesnt allow
  // a stray URL object to be passed)
  origin?: never;
  username?: never;
  password?: never;
  hostname?: never;
  host?: never;
  port?: never;
}
