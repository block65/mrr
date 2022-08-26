import {
  AnchorHTMLAttributes,
  ComponentProps,
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
  DefaultRouteParams,
  ExtractRouteParams,
  RequireKeys,
  RouteWithChildFunction,
  RouteWithChildren,
  RouteWithComponent,
} from './types.js';

export function asWildcardRoute<T extends string>(pattern: T): `${T}/:__rest*` {
  return `${pattern}/:__rest*`;
}

export function Route<
  T extends string,
  P extends DefaultRouteParams = ExtractRouteParams<T>,
>(
  props:
    | RouteWithChildren<T>
    | RouteWithChildFunction<T, P>
    | RouteWithComponent<T, P>,
): ReactElement | null {
  const match = useMatch<P>();

  if ('component' in props) {
    return match ? props.component(match.params) : props.component({} as P);
  }

  if ('children' in props) {
    if (typeof props.children === 'function') {
      return match ? props.children(match.params) : props.children({} as P);
    }
    return <>{props.children}</>;
  }

  return null;
}

export const WildcardRoute: FC<
  RequireKeys<ComponentProps<typeof Route>, 'path'>
> = (props) => <Route {...props} path={asWildcardRoute(props.path)} />;

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
