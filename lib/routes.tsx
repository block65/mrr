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
import type { RouteParams } from './types.js';
import { flattenChildren } from './util.js';

export type RouteComponent = ReactElement<ComponentProps<typeof Route>>;

export const RoutesContext = createContext<Match<RouteParams>>(false);

export const Routes: FC<PropsWithChildren> = ({ children }) => {
  const [url] = useLocation();
  const { matcher } = useRouter();

  let matchResult: MatchResult<RouteParams> | false = false;
  let child: RouteComponent | null = null;

  flattenChildren(children)
    .filter(
      (c): c is RouteComponent =>
        isValidElement<RouteComponent>(c) && c.type === Route,
    )
    // NOTE: using some() for early exit on match
    .some((c) => {
      matchResult = matcher(c, url);

      if (matchResult) {
        child = c;
      }

      // return true means don't attempt further matches
      return matchResult !== false;
    });

  return (
    <RoutesContext.Provider value={matchResult}>{child}</RoutesContext.Provider>
  );
};

export function useMatch<T extends RouteParams>(): Match<T> {
  return useContext(RoutesContext) as Match<T>;
}
