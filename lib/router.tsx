import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Matcher, regexParamMatcher } from './matcher.js';
import type { PartialWithUndefined, RestrictedURLProps } from './types.js';
import {
  calculateDest,
  Deferred,
  noop,
  nullOrigin,
  urlObjectAssign,
  urlRhs,
  withWindow,
} from './util.js';

interface ContextInterface {
  url: URL;
  matcher: Matcher;
  ready: Promise<void>;
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

const useNavigationApi = typeof navigation !== 'undefined';
const popStateEventName = 'popstate';

export const RouterContext = createContext<null | ContextInterface>(null);

export const Router: FC<
  PropsWithChildren<{
    matcher?: Matcher;
    pathname?: string;
    search?: string;
  }>
> = ({ children, matcher = regexParamMatcher, search, pathname }) => {
  // In React, children fire effects before the parent, therefore  it is
  // possible for a child to navigate before we add any event listeners.
  // In this situation, all component logic would be bypassed.
  // Storing this "deferred" allows us to wait for the event listeners to be
  // added before then final navigation is honoured, without having to
  // delay rendering
  const def = useRef(new Deferred());

  const [url, setUrl] = useState<URL>(() =>
    withWindow(
      ({ location }) =>
        urlObjectAssign(new URL(location.href), {
          pathname: pathname || location.pathname,
          search: search || location.search,
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

  useEffect(() => {
    // Navigation API
    if (useNavigationApi) {
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
        // as of Chrome 108, this works
        if (e.canIntercept) {
          e.intercept?.({
            handler,
          });
        }

        // as of Chrome 102, this seems to be the only thing that works
        // as of Chrome 108, this no longer works
        else if (e.canTransition && e.transitionWhile) {
          e.transitionWhile(handler());
        }
      };

      const eventName = 'navigate';

      navigation.addEventListener(
        eventName,
        navigateEventHandler as EventListener,
      );

      def.current.resolve();

      return () => {
        navigation.removeEventListener(
          eventName,
          navigateEventHandler as EventListener,
        );
        def.current = new Deferred();
      };
    }

    // History API
    if (typeof window !== 'undefined') {
      const navigateEventHandler = (/* evt: PopStateEvent */): void => {
        setUrlOnlyIfChanged(window.location.href);
      };

      window.addEventListener(popStateEventName, navigateEventHandler);

      def.current.resolve();

      return () => {
        window.removeEventListener(popStateEventName, navigateEventHandler);
        def.current = new Deferred();
      };
    }

    // noop
    return noop;
  }, [def, setUrlOnlyIfChanged]);

  return (
    <RouterContext.Provider
      value={{ url, matcher, ready: def.current.promise }}
    >
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
  const { url, ready } = useRouter();

  const navigate = useCallback(
    async (
      dest: PartialWithUndefined<RestrictedURLProps> | URL | string,
      options?: { history?: NavigationHistoryBehavior },
    ) => {
      const nextDest = calculateDest(dest, url);

      await ready;

      if (useNavigationApi) {
        return navigation.navigate(nextDest.toString(), {
          ...(options?.history && { history: options.history }),
        });
      }

      const { history } = window;

      // we can only use push/replaceState for same origin
      if (nextDest.origin === url.origin) {
        const nextRhs = urlRhs(nextDest);

        if (options?.history === 'replace') {
          history.replaceState(null, '', nextRhs);
        } else {
          history.pushState(null, '', nextRhs);
        }
      } else {
        window.location.assign(nextDest);
      }

      // pushState and replaceState don't trigger popstate event
      dispatchEvent(new PopStateEvent(popStateEventName));

      return {
        committed: Promise.resolve(),
        finished: Promise.resolve(),
      };
    },
    [ready, url],
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
      if (useNavigationApi) {
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
