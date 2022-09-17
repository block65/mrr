import {
  AnchorHTMLAttributes,
  cloneElement,
  FC,
  isValidElement,
  KeyboardEvent,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useLayoutEffect,
} from 'react';
import {
  Destination,
  NavigationMethodOptions,
  useLocation,
  useRouter,
} from './router.js';
import { useMatch } from './routes.js';
import type {
  DefaultRoute,
  ExtractRouteParams,
  RouteParams,
  RouteWithChildFunction,
  RouteWithChildren,
  RouteWithComponent,
} from './types.js';

export function asWildcardRoute<T extends string>(pattern: T): `${T}/*` {
  return `${pattern}/*`;
}

export function Route<
  T extends string,
  P extends RouteParams = ExtractRouteParams<T>,
>(
  props:
    | DefaultRoute
    | RouteWithChildren<T>
    | RouteWithChildFunction<T, P>
    | RouteWithComponent<T, P>,
): ReactElement | null {
  const match = useMatch<P>();

  if ('component' in props) {
    return props.component({ params: match ? match.params : ({} as P) });
  }

  if ('children' in props) {
    const { children } = props;
    if (typeof children === 'function') {
      return children(match ? match.params : ({} as P));
    }
    return <>{children}</>;
  }

  return null;
}

export const Link: FC<
  PropsWithChildren<
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
      NavigationMethodOptions & { dest: Destination }
  >
> = ({ children, dest, onClick, history, ...props }) => {
  const router = useRouter();
  const [, { navigate }] = useLocation();

  const stringDest = typeof dest === 'string';

  const sameOrigin =
    stringDest || !dest.origin || dest.origin === router.url.origin;

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement> | KeyboardEvent<HTMLAnchorElement>) => {
      // conditions under which we ignore the event
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.shiftKey ||
        ('button' in e && e.button !== 0)
      ) {
        return;
      }

      if (!e.defaultPrevented) {
        e.preventDefault();
      }

      if (onClick && 'button' in e) {
        onClick(e);
      }

      const navOptions = history && { history };

      if (stringDest) {
        navigate(dest, navOptions);
      } else {
        navigate(
          {
            hash: dest.hash,
            pathname: dest.pathname,
            searchParams: dest.searchParams,
          },
          navOptions,
        );
      }
    },
    [onClick, history, stringDest, navigate, dest],
  );

  const newProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
    ...props,
    href: stringDest ? dest : dest.pathname,
    ...(typeof navigation === 'undefined' && { onClick: handleClick }),
    ...(sameOrigin && { rel: 'no-opener noreferrer' }),
  };

  return <a {...newProps}>{children}</a>;
};

export const Redirect: FC<
  PropsWithChildren<
    NavigationMethodOptions & {
      dest: Destination;
    }
  >
> = ({ dest, children, history }) => {
  const [, { navigate }] = useLocation();

  useLayoutEffect(() => {
    navigate(dest, history && { history });
  }, [dest, history, navigate]);

  return <>{children}</>;
};
