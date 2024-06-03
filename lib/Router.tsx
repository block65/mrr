import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type Dispatch,
  type FC,
  type PropsWithChildren,
} from 'react';
import { regexParamMatcher, type Matcher } from './matcher.js';
import type { PartialWithUndefined, RestrictedURLProps } from './types.js';
import {
  noop,
  nullOrigin,
  popStateEventName,
  urlObjectAssign,
  withWindow,
} from './util.js';

export interface State {
  url: URL;
  matcher: Matcher;
  hook?: PartialNavigateEventListener | undefined;
  /** @private - discouraged, this is just an escape hatch */
  useNavigationApi: boolean;
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

/**
 * Sometimes you want to run parent effects before those of the children. E.g.
   when setting something up or binding document event listeners. By passing the
   effect to the first child it will run before any effects by later children.
 * @param {Function} effect
 * @returns null
 */
const DelayedEffect: FC<{ effect: () => void }> = ({ effect }) => {
  useEffect(() => effect?.(), [effect]);
  return null;
};

export const Router: FC<
  PropsWithChildren<{
    matcher?: Matcher;
    pathname?: string;
    search?: string;
    hook?: PartialNavigateEventListener;
    useNavigationApi?: boolean;
  }>
> = ({ children, pathname, search, useNavigationApi, ...props }) => {
  const hasNav =
    typeof navigation !== 'undefined' && useNavigationApi !== false;

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
    matcher: regexParamMatcher,
    useNavigationApi: hasNav,
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

  const init = useCallback(() => {
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
            // "manual" allows react to handle focus, without it, elements lose
            // focus as the URL changes
            focusReset: 'manual',
            handler,
          });
        }

        // as of Chrome 102, this seems to be the only thing that works
        // as of Chrome 108, this no longer works
        // else if (e.canTransition && e.transitionWhile) {
        //   e.transitionWhile(handler());
        // }
      };

      const eventName = 'navigate';

      navigation.addEventListener(eventName, navigateEventHandler);

      // first trigger
      // navigation.dispatchEvent(new Event(eventName));

      return () => {
        navigation.removeEventListener(
          eventName,
          navigateEventHandler as EventListener,
        );
      };
    }

    return withWindow((w) => {
      const navigateEventHandler = (e: PopStateEvent): void => {
        if (hook) {
          hook({
            preventDefault: e.preventDefault.bind(e),
            signal: new AbortController().signal,
            cancelable: e.cancelable,
            type: 'push',
          });
        }

        setUrlOnlyIfChanged(w.location.href);
      };

      w.addEventListener(popStateEventName, navigateEventHandler);

      return () => {
        w.removeEventListener(popStateEventName, navigateEventHandler);
      };
    }, noop);
  }, [hasNav, hook, setUrlOnlyIfChanged]);

  return (
    <RouterContext.Provider value={[state, dispatch]}>
      <DelayedEffect effect={init} />
      {children}
    </RouterContext.Provider>
  );
};
