import {
  ComponentProps,
  createContext,
  FC,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useContext,
} from 'react';
import { Route } from './components.js';
import type { Match, MatchResult } from './matcher.js';
import { useLocation, useRouter } from './router.js';
import type { Params } from './types.js';
import { flattenChildren } from './util.js';

export type RouteComponent = ReactElement<ComponentProps<typeof Route>>;

export const RoutesContext = createContext<Match<Params>>(false);

export const Routes: FC<PropsWithChildren> = ({ children }) => {
  const [url] = useLocation();
  const { matcher } = useRouter();

  let matchResult: MatchResult<Params> | false = false;
  let child: RouteComponent | null = null;

  flattenChildren(children)
    .filter(
      (c): c is RouteComponent =>
        isValidElement<RouteComponent>(c) &&
        (c.type === Route || 'path' in c.props),
    )
    // NOTE: using some() for early exit on match
    .some((c) => {
      matchResult = matcher(c, url.pathname);

      if (matchResult) {
        child = c;
      }

      // return true means don't attempt further matches
      return !!matchResult;
    });

  return (
    <RoutesContext.Provider value={matchResult}>{child}</RoutesContext.Provider>
  );
};

export function useMatch<T extends Params>(): Match<T> {
  return useContext(RoutesContext) as Match<T>;
}
