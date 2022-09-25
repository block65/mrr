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
import { calculateDest, urlRhs, nullOrigin } from './util.js';

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
  const { url } = useRouter();
  const [, { navigate }] = useLocation();

  const isStringDest = typeof dest === 'string';

  const destAsUrl = calculateDest(dest, url);

  const isSameOrigin =
    destAsUrl.origin === nullOrigin.origin || destAsUrl.origin === url.origin;

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

      if (isStringDest) {
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
    [onClick, history, isStringDest, navigate, dest],
  );

  const newProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
    ...props,
    href: isSameOrigin ? urlRhs(destAsUrl) : dest.toString(),
    ...(typeof navigation === 'undefined' && { onClick: handleClick }),
    ...(!isSameOrigin && { rel: 'no-opener noreferrer' }),
  };

  // its not possible to tell if a child will accept a href prop or not
  // we can only tell if its a component or not
  // so we simply always wrap in an anchor, unless it's already an anchor
  return isValidElement(children) && children.type === 'a' ? (
    cloneElement(children, newProps)
  ) : (
    <a {...newProps}>{children}</a>
  );
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
