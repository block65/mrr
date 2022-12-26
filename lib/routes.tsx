import {
  ComponentProps,
  createContext,
  FC,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useContext,
} from 'react';
import type { Match, MatchResult } from './matcher.js';
import { useLocation, useRouter } from './router.js';
import type { Params, RouteComponentProps } from './types.js';
import { flattenChildren } from './util.js';

export type RouteComponent = ReactElement<ComponentProps<typeof Route>>;

export const RoutesContext = createContext<Match>(false);

export function useMatch<TPath extends string>(): Match<TPath> {
  return useContext(RoutesContext) as Match<TPath>;
}

export const Route = <TPath extends string>(
  props: RouteComponentProps<TPath>,
): ReturnType<FC<typeof props>> => {
  const match = useMatch<TPath>();

  if (props && 'component' in props && typeof props.component === 'function') {
    return match ? props.component(match.params) : null;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{props.children}</>;
};

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
