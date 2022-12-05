import {
  AnchorHTMLAttributes,
  cloneElement,
  FC,
  ForwardedRef,
  forwardRef,
  isValidElement,
  KeyboardEvent,
  MouseEvent,
  PropsWithChildren,
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
  DefaultRouteProps,
  ExtractRouteParams,
  Params,
  RouteProps,
} from './types.js';
import { calculateDest, nullOrigin, urlRhs } from './util.js';

export const Route = <
  TPath extends string,
  TProps extends Params = ExtractRouteParams<TPath>,
>(
  props:
    | DefaultRouteProps
    | PropsWithChildren<RouteProps<TPath> & { component?: never }>
    | (RouteProps<TPath> & {
        component: FC<PropsWithChildren<TProps>>;
        children?: never;
      }),
): ReturnType<FC<typeof props>> => {
  const match = useMatch<TProps>();

  if (props && 'component' in props && typeof props.component === 'function') {
    return props.component(match ? match.params : ({} as TProps));
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{props.children}</>;
};

export const Link = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
      NavigationMethodOptions & { dest: Destination }
  >
  // eslint-disable-next-line prefer-arrow-callback
>(function Link({ children, dest, onClick, history, ...props }, ref) {
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

  const newProps: AnchorHTMLAttributes<HTMLAnchorElement> & {
    ref?: ForwardedRef<HTMLAnchorElement>;
  } = {
    ...props,
    href: isSameOrigin ? urlRhs(destAsUrl) : dest.toString(),
    ...(typeof navigation === 'undefined' && { onClick: handleClick }),
    ...(!isSameOrigin && { rel: 'no-opener noreferrer' }),
    ref,
  };

  // its not possible to tell if a child will accept a href prop or not
  // we can only tell if its a component or not
  // so we simply always wrap in an anchor, unless it's already an anchor
  return isValidElement(children) && children.type === 'a' ? (
    cloneElement(children, newProps)
  ) : (
    <a {...newProps}>{children}</a>
  );
});

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
