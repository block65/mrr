import {
  AnchorHTMLAttributes,
  FC,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import { useLocation, useRouter } from './router.js';
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
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { url: URL }
  >
> = ({ children, url, onClick, ...props }) => {
  const router = useRouter();
  const [, { navigate }] = useLocation();

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

      navigate({
        hash: url.hash,
        pathname: url.pathname,
        // search: url.search,
        searchParams: url.searchParams,
      });
    },
    [onClick, navigate, url.hash, url.pathname, url.searchParams],
  );

  const sameOrigin = url.origin === router.url.origin;

  const newProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
    ...props,
    href: url.pathname,
    ...(typeof navigation === 'undefined' && { onClick: handleClick }),
    ...(sameOrigin && { rel: 'no-opener noreferrer' }),
  };

  return <a {...newProps}>{children}</a>;
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
