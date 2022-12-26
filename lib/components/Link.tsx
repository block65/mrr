import {
  AnchorHTMLAttributes,
  cloneElement,
  ForwardedRef,
  forwardRef,
  Fragment,
  isValidElement,
  KeyboardEvent,
  MouseEvent,
  PropsWithChildren,
  useCallback,
} from 'react';
import {
  Destination,
  NavigationMethodOptions,
  useLocation,
  useRouter,
} from '../router.js';
import { calculateDest, nullOrigin, urlRhs } from '../util.js';

type LinkBaseProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export type LinkProps = PropsWithChildren<
  Omit<LinkBaseProps, 'href'> & NavigationMethodOptions & { dest: Destination }
>;

export type LinkChildProps = LinkBaseProps & {
  ref?: ForwardedRef<HTMLAnchorElement>;
};

export const Link = forwardRef<
  HTMLAnchorElement,
  LinkProps
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

  const newProps: LinkChildProps = {
    ...props,
    href: isSameOrigin ? urlRhs(destAsUrl) : dest.toString(),
    ...(typeof navigation === 'undefined' && { onClick: handleClick }),
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
