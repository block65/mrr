import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { Matcher, regexParamMatcher } from './matcher.js';
import type { PartialWithUndefined, RestrictedURLProps } from './types.js';
import {
  calculateDest,
  urlObjectAssign,
  urlRhs,
  withWindow,
  nullOrigin,
} from './util.js';

interface ContextInterface {
  url: URL;
  matcher: Matcher;
}

export type Destination =
  | PartialWithUndefined<RestrictedURLProps>
  | URL
  | string;

/** @deprecated */
type LegacyNavigationMethod = (dest: Destination) => void;

export type NavigationMethodOptions = { history?: NavigationHistoryBehavior };

type NavigationMethod = (
  dest: Destination,
  options?: NavigationMethodOptions,
) => void;

type NavigateEventListener = (evt: NavigateEvent) => void;

const hasNav = typeof navigation !== 'undefined';

export const RouterContext = createContext<null | ContextInterface>(null);

export const Router: FC<
  PropsWithChildren<{
    matcher?: Matcher;
    pathname?: string;
    search?: string;
  }>
> = ({ children, matcher = regexParamMatcher, search, pathname }) => {
  const [url, setUrl] = useState(() =>
    withWindow<URL, URL>(
      ({ location }) =>
        urlObjectAssign(new URL(location.href), {
          pathname: pathname || '',
          search: search || '',
        }),
      urlObjectAssign(new URL(nullOrigin), {
        pathname: pathname || '',
        search: search || '',
      }),
    ),
  );

  const setUrlOnlyIfChanged = useCallback((dest: string) => {
    setUrl((src) => (src.toString() !== dest ? new URL(dest) : src));
  }, []);

  // useLayoutEffect so we can synchronously (or as close to) change the URL
  // or start a navigation, avoiding a flash of rendered DOMS based on soon to
  // be stale state
  useLayoutEffect(() => {
    // Navigation API
    if (hasNav) {
      const navigateEventHandler: NavigateEventListener = (e) => {
        // Don't intercept fragment navigations or downloads.
        if (e.hashChange || e.downloadRequest !== null) {
          return;
        }

        const handler: NavigationInterceptHandler = async () => {
          setUrlOnlyIfChanged(e.destination.url);
        };

        // Some navigations, e.g. cross-origin navigations, we cannot intercept.
        // Let the browser handle those normally.
        if (e.canIntercept) {
          e.intercept?.({
            handler,
          });
        }

        // as of Chrome 102, this seems to be the only thing that works
        if (e.canTransition && e.transitionWhile) {
          e.transitionWhile(handler());
        }
      };

      const eventName = 'navigate';

      navigation.addEventListener(
        eventName,
        navigateEventHandler as EventListener,
      );

      return () => {
        navigation.removeEventListener(
          eventName,
          navigateEventHandler as EventListener,
        );
      };
    }

    // History API
    if (typeof window !== 'undefined') {
      const navigateEventHandler = (/* evt: PopStateEvent */): void => {
        setUrlOnlyIfChanged(window.location.href);
      };

      const eventName = 'popstate';

      window.addEventListener(eventName, navigateEventHandler);

      return () => {
        window.removeEventListener(eventName, navigateEventHandler);
      };
    }

    // noop
    return () => {};
  }, [setUrlOnlyIfChanged]);

  return (
    <RouterContext.Provider value={{ url, matcher }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const state = useContext(RouterContext);
  if (!state) {
    throw new Error('Must be used within a Router');
  }
  return state;
}

export function useLocation(): [
  URL,
  {
    navigate: NavigationMethod;
    back: () => void;
    /** @deprecated */
    push: LegacyNavigationMethod;
    /** @deprecated */
    replace: LegacyNavigationMethod;
  },
] {
  const { url } = useRouter();

  const navigate = useCallback(
    (
      dest: PartialWithUndefined<RestrictedURLProps> | URL | string,
      options?: { history?: NavigationHistoryBehavior },
    ) => {
      const nextDest = calculateDest(dest, url);

      if (hasNav) {
        navigation.navigate(nextDest.toString(), {
          ...(options?.history && { history: options.history }),
        });
      } else {
        const { history } = window;

        const nextRhs = urlRhs(nextDest);

        // we can only use push/replaceState for same origin
        if (nextDest.origin === url.origin) {
          if (options?.history === 'replace') {
            history.replaceState(null, '', nextRhs);
          } else {
            history.pushState(null, '', nextRhs);
          }
        } else {
          window.location.assign(nextDest);
        }

        // pushState and replaceState don't trigger popstate event
        dispatchEvent(new PopStateEvent('popstate'));
      }
    },
    [url],
  );

  const replace: LegacyNavigationMethod = useCallback(
    (dest) => {
      navigate(dest, {
        history: 'replace',
      });
    },
    [navigate],
  );

  const push: LegacyNavigationMethod = useCallback(
    (dest) => {
      navigate(dest, { history: 'push' });
    },
    [navigate],
  );

  const back = useCallback(
    (alternateDest?: Destination) => {
      if (hasNav) {
        if (navigation.entries()?.length > 0) {
          navigation.back();
        } else if (alternateDest) {
          // No history entries, go directly to alternateDest
          navigate(alternateDest, { history: 'replace' });
        }
        navigation.back();
      } else {
        window.history.back();
      }
    },
    [navigate],
  );

  return [url, { navigate, back, replace, push }];
}

export function useNavigate() {
  return useLocation()[1];
}
