import {
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  type AnchorHTMLAttributes,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type PropsWithChildren,
} from 'react';
import { type Destination, type NavigationMethodOptions } from '../router.js';
import { useLocation, useRouter } from '../use-router.js';
import { calculateUrl, nullOrigin, urlRhs } from '../util.js';

type LinkBaseProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export type LinkProps = PropsWithChildren<
  Omit<LinkBaseProps, 'href'> & NavigationMethodOptions & { href: Destination }
>;

type LinkChildProps = LinkBaseProps & {
  ref?: ForwardedRef<HTMLAnchorElement>;
};

export const Link = forwardRef<
  HTMLAnchorElement,
  LinkProps
  // eslint-disable-next-line prefer-arrow-callback
>(function Link({ children, href, onClick, history, ...props }, ref) {
  const [url, { navigate }] = useLocation();
  const [{ useNavigationApi }] = useRouter();
  const hasNav = useNavigationApi;

  const isStringDest = typeof href === 'string';

  const destAsUrl = calculateUrl(href, url);

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
        navigate(href, navOptions);
      } else {
        navigate(
          {
            hash: href.hash,
            pathname: href.pathname,
            searchParams: href.searchParams,
          },
          navOptions,
        );
      }
    },
    [onClick, history, isStringDest, navigate, href],
  );

  const newProps: LinkChildProps = {
    ...props,
    href: isSameOrigin ? urlRhs(destAsUrl) : href.toString(),
    ...(!hasNav && { onClick: handleClick }),
    ...(!isSameOrigin && { rel: 'no-opener noreferrer' }),
    ref,
  };

  // If it's a valid element (that is also not a fragment), we pass the props
  // in, otherwise we wrap with an anchor.
  // It's up to the consumer to make sure they pass an element that
  // can interpret/handle the received props
  const isValid = isValidElement(children);
  const isFragment = isValid && children.type === Fragment;

  const shouldWrap = !isValid || isFragment;

  return shouldWrap ? (
    <a {...newProps}>{children}</a>
  ) : (
    cloneElement(children, newProps)
  );
});
