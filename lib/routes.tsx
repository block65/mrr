import {
  isValidElement,
  type ComponentProps,
  type FC,
  type PropsWithChildren,
  type ReactElement,
} from 'react';
import { RoutesContext } from './RoutesContext.js';
import type { MatchResult } from './matcher.js';
import type { Params, RouteComponentProps } from './types.js';
import { useRouteMatch } from './use-route-match.js';
import { useLocation, useRouter } from './use-router.js';
import { flattenChildren } from './util.js';

export type RouteComponent = ReactElement<ComponentProps<typeof Route>>;

export const Route = <TPath extends string>(
  props: RouteComponentProps<TPath>,
): ReturnType<FC<typeof props>> => {
  const match = useRouteMatch<TPath>();

  if (match) {
    if (
      props &&
      'component' in props &&
      typeof props.component === 'function'
    ) {
      return props.component(match.params);
    }
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{props.children}</>;
  }
  return <>{props.children}</>;
};

export const Routes: FC<PropsWithChildren> = ({ children }) => {
  const [url] = useLocation();
  const [{ matcher }] = useRouter();

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
