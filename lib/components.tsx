import {
  AnchorHTMLAttributes,
  FC,
  KeyboardEvent,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
} from 'react';
import { useLocation, useRouter } from './router.js';
import { useMatch } from './routes.js';
import type {
  DefaultRoute,
  RouteParams,
  ExtractRouteParams,
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
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { url: URL }
  >
> = ({ children, url, onClick, ...props }) => {
  const router = useRouter();
  const [, { push }] = useLocation();

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

      push({
        hash: url.hash,
        pathname: url.pathname,
        // search: url.search,
        searchParams: url.searchParams,
      });
    },
    [onClick, push, url.hash, url.pathname, url.searchParams],
  );

  const sameOrigin = url.origin === router.url.origin;

  if (!sameOrigin)
    <a
      {...props}
      href={url.href}
      rel="no-opener noreferrer"
      onClick={handleClick}
    >
      {children}
    </a>;
  return (
    <a {...props} href={url.pathname} onClick={handleClick}>
      {children}
    </a>
  );
};

export const Redirect: FC<PropsWithChildren<{ url: URL }>> = ({
  url,
  children,
}) => {
  useEffect(() => {
    window.location.assign(url);
  }, [url]);

  return <>{children}</>;
};
