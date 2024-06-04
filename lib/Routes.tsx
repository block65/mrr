import {
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  type PropsWithChildren,
  type ReactElement,
} from 'react';
import { Route } from './Route.js';
import { RoutesContext } from './RoutesContext.js';
import type { MatchResult } from './matcher.js';
import type { Params, RouteComponentProps } from './types.js';
import { useLocation, useRouter } from './use-router.js';
import { flattenFragments } from './util.js';

export const Routes = forwardRef<HTMLElement, PropsWithChildren>(
  ({ children }, forwardedRef) => {
    const [url] = useLocation();
    const [{ matcher }] = useRouter();

    const { pathname } = url;

    const [child, matchResult] = useMemo((): [
      ReactElement<RouteComponentProps> | null,
      MatchResult<Params> | false,
    ] => {
      let match: MatchResult<Params> | false = false;
      let matchChild: ReactElement<RouteComponentProps> | null = null;

      flattenFragments(children)
        .filter(
          (c): c is ReactElement<RouteComponentProps> =>
            isValidElement<RouteComponentProps>(c) &&
            // supports native routes, and also custom route components
            (c.type === Route || 'path' in c.props),
        )
        // NOTE: using some() for early exit on match
        .some((c) => {
          match = matcher(c, pathname);

          if (match) {
            matchChild = cloneElement(c, {
              ...(forwardedRef && { ref: forwardedRef }),
              ...c.props,
            });
          }

          // return true means don't attempt further matches
          return !!match;
        });

      return [matchChild, match];
    }, [children, forwardedRef, matcher, pathname]);

    return (
      <RoutesContext.Provider value={matchResult}>
        {child}
      </RoutesContext.Provider>
    );
  },
);
