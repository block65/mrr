import { useCallback, useContext } from 'react';
import {
  RouterContext,
  type Destination,
  type PartialNavigateEventListener,
} from './Router.js';
import { type PartialWithUndefined, type RestrictedURLProps } from './types.js';
import { calculateUrl, popStateEventName, urlRhs, withWindow } from './util.js';

type SyntheticNavigationResult = {
  committed: Promise<void>;
  finished: Promise<void>;
};

const resolved = Promise.resolve();
const syntheticNavigationResult = {
  committed: resolved,
  finished: resolved,
};

export function useRouter() {
  const state = useContext(RouterContext);
  if (!state) {
    throw new Error('Must be used within a Router');
  }
  return state;
}

export function useRouterHook() {
  const [, dispatch] = useRouter();

  return useCallback(
    (hook: PartialNavigateEventListener) => {
      dispatch({
        hook,
      });

      return () => {
        dispatch({ hook: undefined });
      };
    },
    [dispatch],
  );
}

export function useLocation() {
  const [{ url, useNavigationApi }] = useRouter();
  const hasNav =
    typeof navigation !== 'undefined' && useNavigationApi !== false;

  const navigate = useCallback(
    (
      href: PartialWithUndefined<RestrictedURLProps> | URL | string,
      options?: { history?: NavigationHistoryBehavior },
    ): NavigationResult | SyntheticNavigationResult => {
      const nextUrl = calculateUrl(href, url);

      if (hasNav) {
        return navigation.navigate(nextUrl.toString(), {
          ...(options?.history && { history: options.history }),
        });
      }

      return withWindow(({ history }) => {
        // we can only use push/replaceState for same origin
        if (nextUrl.origin === url.origin) {
          const nextRhs = urlRhs(nextUrl);

          if (options?.history === 'replace') {
            history.replaceState(null, '', nextRhs);
          } else {
            history.pushState(null, '', nextRhs);
          }

          // pushState and replaceState don't trigger popstate event
          dispatchEvent(new PopStateEvent(popStateEventName));
        } else {
          window?.location.assign(nextUrl);
        }

        return syntheticNavigationResult;
      }, syntheticNavigationResult);
    },
    [hasNav, url],
  );

  const back = useCallback(
    async (
      alternateHref?: Destination,
    ): Promise<NavigationResult | SyntheticNavigationResult> => {
      if (hasNav) {
        if (navigation.entries()?.length > 0) {
          return navigation.back();
        }

        if (alternateHref) {
          // No history entries, go directly to alternateHref
          return navigate(alternateHref, { history: 'replace' });
        }

        return navigation.back();
      }
      window?.history.back();
      return syntheticNavigationResult;
    },
    [hasNav, navigate],
  );

  return [url, { navigate, back }] as const;
}
