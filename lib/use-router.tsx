import { useCallback, useContext } from 'react';
import {
  RouterContext,
  type NavigationMethod,
  type Destination,
} from './router.js';
import { type PartialWithUndefined, type RestrictedURLProps } from './types.js';
import {
  calculateUrl,
  hasNavigationApi,
  popStateEventName,
  urlRhs,
} from './util.js';

const { navigation } = window;
const hasNav = hasNavigationApi(navigation);

export function useRouter() {
  const state = useContext(RouterContext);
  if (!state) {
    throw new Error('Must be used within a Router');
  }
  return state;
}

export function useHook() {
  const [, dispatch] = useRouter();
  return dispatch;
}

export function useLocation(): [
  URL,
  {
    navigate: NavigationMethod;
    back: () => void;
  },
] {
  const [{ url, ready }] = useRouter();

  const navigate = useCallback(
    async (
      href: PartialWithUndefined<RestrictedURLProps> | URL | string,
      options?: { history?: NavigationHistoryBehavior },
    ) => {
      const nextUrl = calculateUrl(href, url);

      await ready;

      if (hasNav) {
        return navigation.navigate(nextUrl.toString(), {
          ...(options?.history && { history: options.history }),
        });
      }

      const { history } = window;

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
        window.location.assign(nextUrl);
      }

      return {
        committed: Promise.resolve(),
        finished: Promise.resolve(),
      };
    },
    [ready, url],
  );

  const back = useCallback(
    (alternateHref?: Destination) => {
      if (hasNav) {
        if (navigation.entries()?.length > 0) {
          navigation.back();
        } else if (alternateHref) {
          // No history entries, go directly to alternateHref
          navigate(alternateHref, { history: 'replace' });
        }
        navigation.back();
      } else {
        window.history.back();
      }
    },
    [navigate],
  );

  return [url, { navigate, back }];
}
