// import { match, type MatchFunction } from 'path-to-regexp';
import type { ReactElement, ComponentProps } from 'react';
import { parse } from 'regexparam';
import type { Route } from './components.js';
import { pathCache } from './path-cache.js';
import type { DefaultRouteParams } from './types.js';

export type RouteComponent = ReactElement<ComponentProps<typeof Route>>;

export interface MatchResult<P extends DefaultRouteParams> {
  path: string;
  index: number;
  params: P;
}

export type Matcher = (
  component: RouteComponent,
  url: URL,
) => MatchResult<DefaultRouteParams> | false;

// const pathToRegexpCache = new Map<string, MatchFunction<DefaultRouteParams>>();

// export const pathToRegexpMatcher: Matcher = (
//   { props }: RouteComponent,
//   { pathname }: URL,
// ): MatchResult<DefaultRouteParams> | false => {
//   if (!props.path) {
//     return { index: 0, params: {}, path: '' };
//   }
//   const fn = pathCache(pathToRegexpCache, props.path, (k) =>
//     match<DefaultRouteParams>(k, {
//       decode: decodeURIComponent,
//     }),
//   );

//   return fn(pathname);
// };

const regexparamCache = new Map<
  string,
  | {
      keys: string[];
      pattern: RegExp;
    }
  | {
      keys: false;
      pattern: RegExp;
    }
>();

function regexParamExec(path: string, keys: string[], pattern: RegExp) {
  const matches = pattern.exec(path) || [];
  return Object.fromEntries(
    matches.map((m, idx) => [keys[idx], m]),
  ) as DefaultRouteParams;
}

export const regexParamMatcher: Matcher = (
  { props }: RouteComponent,
  { pathname }: URL,
): MatchResult<DefaultRouteParams> | false => {
  if (!props.path) {
    return { index: 0, params: {}, path: '' };
  }
  const { keys, pattern } = pathCache(regexparamCache, props.path, (path) =>
    parse(path),
  );

  if (pattern.test(pathname)) {
    return {
      index: 0,
      // apparently keys is always an array if parse input is a string
      // https://github.com/lukeed/regexparam#regexparamparseinput-string-loose-boolean
      params: regexParamExec(pathname, keys || [], pattern),
      path: pathname,
    };
  }
  return false;
};
