import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { PartialWithUndefined, RestrictedURLProps } from './types.js';
import { urlObjectAssign, urlRhs, withWindow } from './util.js';
import { Matcher, regexParamMatcher } from './matcher.js';

interface ContextInterface {
  url: URL;
  matcher: Matcher;
}

/** @deprecated */
type LegacyNavigationMethod = (
  dest: PartialWithUndefined<RestrictedURLProps> | URL,
) => void;

type NavigationMethod = (
  dest: PartialWithUndefined<RestrictedURLProps> | URL | string,
  options?: { history?: NavigationHistoryBehavior },
) => void;

type NavigateEventListener = (evt: NavigateEvent) => void;

export const RouterContext = createContext<null | ContextInterface>(null);

const navigationApiAvailable = typeof navigation !== 'undefined';

export const Router: FC<
  PropsWithChildren<{
    origin: string;
    hash?: string;
    pathname?: string;
    search?: string;
    matcher?: Matcher;
  }>
> = ({
  children,
  matcher = regexParamMatcher,
  search,
  hash,
  pathname,
  origin,
}) => {
  const [url, setUrl] = useState(() =>
    withWindow<URL, URL>(
      ({ location }) =>
        urlObjectAssign(new URL(location.origin), {
          search: search || location.search,
          hash: hash || location.hash,
          pathname: pathname || location.pathname,
        }),
      urlObjectAssign(new URL(origin), {
        search: search || '',
        hash: hash || '',
        pathname: pathname || '',
      }),
    ),
  );

  const setUrlOnlyIfChanged = useCallback((dest: string) => {
    setUrl((src) => (src.toString() !== dest ? new URL(dest) : src));
  }, []);

  useEffect(() => {
    // Navigation API
    if (navigationApiAvailable) {
      const navigateEventHandler: NavigateEventListener = (e) => {
        // make sure we're only listening to relevant events
        if (
          (e.navigationType === 'push' || e.navigationType === 'replace') &&
          e.destination.sameDocument
        ) {
          setUrlOnlyIfChanged(e.destination.url);
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
      const nextUrl =
        dest instanceof URL
          ? dest
          : urlObjectAssign(
              new URL(url),
              typeof dest === 'string' ? { pathname: dest } : dest,
            );

      if (navigationApiAvailable) {
        navigation.navigate(nextUrl.toString(), {
          history: options?.history ?? 'auto',
        });
      } else {
        const { history } = window;
        const nextRhs = urlRhs(nextUrl);

        if (options?.history === 'replace') {
          history.replaceState(null, '', nextRhs);
        } else {
          history.pushState(null, '', nextRhs);
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
      navigate(dest);
    },
    [navigate],
  );

  const back = useCallback(() => {
    if (navigationApiAvailable) {
      navigation.back();
    } else {
      window.history.back();
    }
  }, []);

  return [url, { navigate, back, replace, push }];
}

export function useNavigate() {
  return useLocation()[1];
}
