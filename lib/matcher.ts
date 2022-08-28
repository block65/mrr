import { parse } from 'regexparam';
import { pathCache } from './path-cache.js';
import type { RouteComponent } from './routes.js';
import type { RouteParams, RouteProps } from './types.js';

export type Match<P extends RouteParams> = MatchResult<P> | false;

export interface MatchResult<P extends RouteParams> {
  path: string;
  index: number;
  params: P;
}

export type Matcher = (
  component: RouteComponent,
  url: URL,
) => Match<RouteParams> | false;

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
  RouteProps<string>,
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
  const matches = (pattern.exec(path) || []).slice(1);
  return Object.fromEntries(
    matches.map((m, idx) => [keys[idx], m]),
  ) as RouteParams;
}

export const regexParamMatcher: Matcher = (
  { props }: RouteComponent,
  { pathname }: URL,
): Match<RouteParams> => {
  if (!('path' in props)) {
    return { index: 0, params: {}, path: '' };
  }

  const { keys, pattern } = pathCache(regexparamCache, props, (p) =>
    parse(p.path, !!p.wildcard),
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
