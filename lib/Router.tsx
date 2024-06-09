import {
  createContext,
  useCallback,
  useReducer,
  useRef,
  type FC,
  type PropsWithChildren,
} from 'react';
import { flushSync } from 'react-dom';
import { DelayedEffect } from './DelayedEffect.js';
import {
  ActionType,
  Direction,
  currentEntryChangeEventName,
  kCancelRecovery,
  navigationEventName,
  type Action,
  type ContextInterface,
  type State,
  type SyntheticNavigateEventListener,
} from './State.js';
import { regexParamMatcher, type Matcher } from './matcher.js';
import {
  nullOrigin,
  popStateEventName,
  urlObjectAssign,
  withNavigation,
  withWindow,
} from './util.js';

function getDirection(
  type: NavigationApiNavigationType | null,
  from: NavigationHistoryEntry | null,
  to: NavigationHistoryEntry,
) {
  switch (type) {
    case 'push':
      return Direction.Forward;
    case 'traverse':
      if (!from || from.index === to.index) {
        return Direction.Unknown;
      }
      return from.index < to.index ? Direction.Forward : Direction.Backward;
    case 'reload':
    case 'replace':
    default:
      return Direction.Unknown;
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.Navigate: {
      if ('dest' in action) {
        // proper navigation update
        const { dest, ...rest } = action;
        const destUrl = new URL(dest);
        return state.url.href !== destUrl.href
          ? {
              ...state,
              direction: action.direction || state.direction,
              url: destUrl,
              ...rest,
            }
          : state;
      }

      // direction only
      return {
        ...state,
        direction: action.direction,
      };
    }
    case ActionType.Hooks: {
      const { type, ...hooks } = action;
      return { ...state, ...hooks };
    }

    default:
      return state;
  }
}

export const RouterContext = createContext<ContextInterface | null>(null);

export const Router: FC<
  PropsWithChildren<{
    matcher?: Matcher;
    pathname?: string;
    search?: string;
    intercept?: SyntheticNavigateEventListener;
    useNavApi?: false; // this can only ever be turned off
  }>
> = ({ children, pathname, search, useNavApi = true, ...props }) => {
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
    useNavApi,
    direction: Direction.Unknown,
    ...props,
  });

  const navigationDirectionGuess = useRef<Direction>(Direction.Unknown);

  const naviationApiChangeEventHandler = useCallback(
    async (e: NavigationCurrentEntryChangeEvent) => {
      if (navigation?.currentEntry) {
        navigationDirectionGuess.current = getDirection(
          e.navigationType || null,
          e.from,
          navigation.currentEntry,
        );
      }
    },
    [],
  );

  const { intercept, change } = state;

  const naviationApiNavigateEventHandler = useCallback(
    (e: NavigateEvent) => {
      if (typeof navigation === 'undefined') {
        return;
      }

      // Some navigations, e.g. cross-origin navigations, we cannot intercept.
      // Let the browser handle those normally.
      if (!e.canIntercept || e.defaultPrevented) {
        return;
      }

      // Don't intercept fragment navigations or downloads.
      if (e.hashChange || e.downloadRequest !== null) {
        return;
      }

      // Some urls for reference:
      // Cancelling UI initiated navigations (back/forward) - https://github.com/WICG/navigation-api/issues/32
      // Cancelable traversals: avoiding a slowdown - https://github.com/WICG/navigation-api/issues/254
      // TODO: we could also detect not user-initiated, not cancellable etc
      e.intercept({
        // "manual" allows react to handle focus, without it, elements lose
        // focus as the URL changes
        focusReset: 'manual',
        handler: async () => {
          // hoisted destructure so we are all dealing with the same entry
          const { currentEntry /* , activation */ } = navigation;

          // useless navigation
          if (!currentEntry || !currentEntry.url) {
            return;
          }

          const { url } = currentEntry;

          // a cancelled navigation
          if (e.info === kCancelRecovery) {
            dispatch({
              type: ActionType.Navigate,
              dest: url,
            });
            return;
          }

          const direction = navigationDirectionGuess.current;

          // direction state update which we will flush if we need to
          // WARN: we cannot change the URL here as we flush the state update
          // but we dont want the route to change yet.
          dispatch({
            type: ActionType.Navigate,
            direction,
          });

          const finish = async () => {
            // if the event was cancelled, we need to go back to the previous
            // this will trigger a navigate event again.
            if (e.defaultPrevented) {
              await navigation.back({
                info: kCancelRecovery,
              }).finished;
              return;
            }

            // full state update which will trigger a re-render
            dispatch({
              type: ActionType.Navigate,
              dest: url,
              direction,
            });
          };

          // this is the user intercept hook
          if (intercept) {
            // we need `intercept()` to have the absolute latest direction, so
            // it gets flushed here.

            const promise = flushSync(async () =>
              // we always pass cleanup, but it may not get called. we check
              // for that possibility below
              Promise.resolve(intercept(e, finish)),
            );

            // intercepter is DEFINITELY NOT handling the `next` themselves,
            // so we will await it
            if (intercept.length === 1) {
              await promise.then(finish);
            }
          } else {
            finish();
          }
          // eslint-disable-next-line no-useless-return
          return; // WARN: `finish()` should be the last code running
        },
      });
    },
    [intercept],
  );

  const popStateHandler = useCallback(
    (e: PopStateEvent): void => {
      if (typeof window !== 'undefined') {
        if (!e.defaultPrevented) {
          dispatch({
            type: ActionType.Navigate,
            dest: window.location.href,
            direction: Direction.Backward, // pop is always backwards
          });
        }

        // change hook
        if (change) {
          change({
            preventDefault: e.preventDefault.bind(e),
            signal: new AbortController().signal,
            cancelable: e.cancelable,
            navigationType: 'traverse', // pop is always traverse
          });
        }
      }
    },
    [change],
  );

  const init = useCallback(() => {
    if (useNavApi) {
      withNavigation((n) => {
        n.addEventListener(
          currentEntryChangeEventName,
          naviationApiChangeEventHandler,
        );
        n.addEventListener(
          navigationEventName,
          naviationApiNavigateEventHandler,
        );
      });
    } else {
      withWindow((w) => {
        w.addEventListener(popStateEventName, popStateHandler);
      });
    }

    return () => {
      if (useNavApi) {
        withNavigation((n) => {
          n.removeEventListener(
            currentEntryChangeEventName,
            naviationApiChangeEventHandler,
          );
          n.removeEventListener(
            navigationEventName,
            naviationApiNavigateEventHandler,
          );
        });
      } else {
        withWindow((w) => {
          w.removeEventListener(popStateEventName, popStateHandler);
        });
      }
    };
  }, [
    naviationApiChangeEventHandler,
    naviationApiNavigateEventHandler,
    popStateHandler,
    useNavApi,
  ]);

  return (
    <RouterContext.Provider value={[state, dispatch]}>
      <DelayedEffect effect={init} />
      {children}
    </RouterContext.Provider>
  );
};
