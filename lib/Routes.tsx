import {
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  type ComponentPropsWithRef,
  type PropsWithChildren,
  type ReactElement,
} from 'react';
import { Route } from './Route.js';
import { RoutesContext } from './RoutesContext.js';
import type { MatchResult } from './matcher.js';
import type { Params } from './types.js';
import { useLocation, useRouter } from './use-router.js';
import { flattenFragments } from './util.js';

export type RouteComponent = ComponentPropsWithRef<typeof Route>;

export const Routes = forwardRef<HTMLElement, PropsWithChildren>(
  ({ children }, forwardedRef) => {
    const [url] = useLocation();
    const [{ matcher }] = useRouter();

    const { pathname } = url;

    const [child, matchResult] = useMemo((): [
      ReactElement<RouteComponent> | null,
      MatchResult<Params> | false,
    ] => {
      let match: MatchResult<Params> | false = false;
      let matchChild: ReactElement<RouteComponent> | null = null;

      flattenFragments(children)
        .filter(
          (c): c is ReactElement<RouteComponent> =>
            isValidElement<RouteComponent>(c) &&
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
