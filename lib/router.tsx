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

type NavigationMethod = (
  partial: PartialWithUndefined<RestrictedURLProps> | URL,
  options?: { data: unknown },
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

  const setUrlIfChanged = useCallback((dest: string) => {
    setUrl((src) => (src.toString() !== dest ? new URL(dest) : src));
  }, []);

  useEffect(() => {
    // Navigation API
    if (navigationApiAvailable) {
      const navigateEventHandler: NavigateEventListener = (e) => {
        setUrlIfChanged(e.destination.url);
      };

      navigation.addEventListener(
        'navigate',
        navigateEventHandler as EventListener,
      );

      return () => {
        navigation.removeEventListener(
          'navigate',
          navigateEventHandler as EventListener,
        );
      };
    }

    // History API
    if (typeof window !== 'undefined') {
      const navigateEventHandler = (/* evt: PopStateEvent */): void => {
        setUrlIfChanged(window.location.href);
      };

      window.addEventListener('popstate', navigateEventHandler);

      return () => {
        window.removeEventListener('popstate', navigateEventHandler);
      };
    }

    // noop
    return () => {};
  }, [setUrlIfChanged]);

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
    push: NavigationMethod;
    replace: NavigationMethod;
    go: (offset?: number) => void;
    back: () => void;
  },
] {
  const { url } = useRouter();

  const navigateTo = useCallback(
    (
      partialOrUrl: PartialWithUndefined<RestrictedURLProps> | URL,
      options?: { replace?: boolean; state?: unknown },
    ) => {
      const nextUrl = urlObjectAssign(new URL(url), partialOrUrl);

      if (navigationApiAvailable) {
        navigation.navigate(nextUrl.toString(), {
          history: options?.replace ? 'replace' : 'auto',
          state: options?.state,
        });
      } else {
        const { history } = window;
        const nextRhs = urlRhs(nextUrl);

        if (options?.replace) {
          history.replaceState(options.state, '', nextRhs);
        } else {
          history.pushState(options?.state, '', nextRhs);
        }

        // pushState and replaceState don't trigger popstate event
        dispatchEvent(
          new PopStateEvent('popstate', {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            state: history.state,
          }),
        );
      }
    },
    [url],
  );

  const replace: NavigationMethod = useCallback(
    (partial, { data }: { data?: unknown } = {}) => {
      navigateTo(partial, {
        state: data,
        replace: true,
      });
    },
    [navigateTo],
  );

  const push: NavigationMethod = useCallback(
    (partial, { data }: { data?: unknown } = {}) => {
      navigateTo(partial, { state: data });
    },
    [navigateTo],
  );

  const go = useCallback((offset = 0) => {
    window.history.go(offset);
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  return [url, { replace, push, go, back }];
}
