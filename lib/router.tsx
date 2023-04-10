import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type FC,
  type PropsWithChildren,
} from 'react';
import { regexParamMatcher, type Matcher } from './matcher.js';
import type { PartialWithUndefined, RestrictedURLProps } from './types.js';
import {
  Deferred,
  hasNavigationApi,
  noop,
  nullOrigin,
  popStateEventName,
  urlObjectAssign,
  withWindow,
} from './util.js';

export interface State {
  url: URL;
  matcher: Matcher;
  ready: Promise<void>;
  hook?: PartialNavigateEventListener | undefined;
}

export type ContextInterface = [State, Dispatch<ActionInterface>];

export type ActionInterface = Partial<State>;

export type PartialNavigateEvent = Pick<
  NavigateEvent,
  'preventDefault' | 'signal' | 'type' | 'cancelable'
>;

export type Destination =
  | PartialWithUndefined<RestrictedURLProps>
  | URL
  | string;

export type NavigationMethodOptions = { history?: NavigationHistoryBehavior };

export type NavigationMethod = (
  href: Destination,
  options?: NavigationMethodOptions,
) => void;

type NavigateEventListener = (evt: NavigateEvent) => void;

const { navigation } = window;
const hasNav = hasNavigationApi(navigation);

// used so we can recognise the subsequent recovery navigation event that
// occurs after cancelling a navigation
const kCancelRecovery = Symbol('recover');

function reducer(state: State, action: ActionInterface) {
  return { ...state, ...action };
}

export const RouterContext = createContext<ContextInterface | null>(null);

export type PartialNavigateEventListener = (
  e: PartialNavigateEvent,
) => void | Promise<void>;

export const Router: FC<
  PropsWithChildren<{
    matcher?: Matcher;
    pathname?: string;
    search?: string;
    hook?: PartialNavigateEventListener;
  }>
> = ({ children, pathname, search, ...props }) => {
  // In React, children fire effects before the parent, therefore  it is
  // possible for a child to navigate before we even add any event listeners.
  // In this situation, all component logic would be bypassed.
  // Storing this "deferred" allows us to wait for the event listeners to be
  // added before then final navigation is honoured, without having to
  // delay rendering
  const def = useRef(new Deferred());

  const [state, dispatch] = useReducer(reducer, {
    url: withWindow(
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
    ready: def.current.promise,
    matcher: regexParamMatcher,
    ...props,
  });

  const setUrlOnlyIfChanged = useCallback(
    (dest: string) => {
      if (state.url.toString() !== dest) {
        dispatch({ url: new URL(dest) });
      }
    },
    [state.url],
  );

  const { hook } = state;

  useEffect(() => {
    // Navigation API
    if (hasNav) {
      const navigateEventHandler: NavigateEventListener = (e) => {
        const currentUrl = navigation.currentEntry?.url;

        // Don't intercept fragment navigations or downloads.
        if (e.hashChange || e.downloadRequest !== null) {
          return;
        }

        // some urls for reference:
        // Cancelling UI initiated navigations (back/forward) - https://github.com/WICG/navigation-api/issues/32
        // Cancelable traversals: avoiding a slowdown - https://github.com/WICG/navigation-api/issues/254
        const handler: NavigationInterceptHandler = async () => {
          // we could also detect not user initiated, not cancellable etc

          if (hook && e.info !== kCancelRecovery) {
            // WARN: `e` can be different after this is called
            // especially if the user calls `preventDefault`
            await hook({
              preventDefault: () => e.preventDefault(),
              cancelable: e.cancelable,
              signal: e.signal,
              type: e.type,
            });
          }

          if (e.defaultPrevented && currentUrl) {
            navigation.back({
              info: kCancelRecovery,
            });
          }

          if (!e.defaultPrevented && !e.signal.aborted) {
            setUrlOnlyIfChanged(e.destination.url);
          }
        };

        // Some navigations, e.g. cross-origin navigations, we cannot intercept.
        // Let the browser handle those normally.
        // as of Chrome 108, this works
        if (e.canIntercept && !e.defaultPrevented) {
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
      const navigateEventHandler = (evt: PopStateEvent): void => {
        if (hook) {
          hook({
            preventDefault: evt.preventDefault,
            signal: new AbortController().signal,
            cancelable: evt.cancelable,
            type: 'push',
          });
        }

        setUrlOnlyIfChanged(window.location.href);
      };

      window.addEventListener(popStateEventName, navigateEventHandler);

      def.current.resolve();

      return () => {
        window.removeEventListener(popStateEventName, navigateEventHandler);
        def.current = new Deferred();
      };
    }

    return noop;
  }, [hook, setUrlOnlyIfChanged]);

  return (
    <RouterContext.Provider value={[state, dispatch]}>
      {children}
    </RouterContext.Provider>
  );
};
