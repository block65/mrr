import {
  Children,
  Fragment,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from 'react';
import type { Destination } from './State.js';
import type { PartialWithUndefined, URLProps } from './types.js';

export const nullOrigin = new URL('https://0');

export const popStateEventName = 'popstate';

export function withWindow<A>(a: (window: Window) => A): A | undefined;
export function withWindow<A, B>(a: (window: Window) => A, b: B): A | B;
export function withWindow<A, B>(
  a: (window: Window) => A,
  b?: B,
): A | B | undefined {
  return typeof window !== 'undefined' ? a(window) : b;
}

export function withNavigation<A>(
  a: (navigation: Navigation) => A,
): A | undefined;
export function withNavigation<A, B>(
  a: (navigation: Navigation) => A,
  b: B,
): A | B;
export function withNavigation<A, B>(
  a: (navigation: Navigation) => A,
  b?: B,
): A | B | undefined {
  return withWindow((w) => (w.navigation ? a(w.navigation) : b), b);
}

export function urlRhs(url: URL): string {
  return decodeURI(url.toString().slice(url.origin.length));
}

export function urlObjectAssign(
  url: URL,
  props: PartialWithUndefined<URLProps>,
): URL {
  const { origin, searchParams, ...rest } = props;

  const newUrl = origin ? new URL(urlRhs(url), origin) : new URL(url);

  Object.entries(rest).forEach(([k, v]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newUrl[k as keyof typeof rest] = v || '';
  });

  if (searchParams) {
    newUrl.search = '';
    searchParams.forEach((v, k) => newUrl.searchParams.append(k, v));
  }

  return newUrl;
}

export function flattenFragments(children: React.ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child): ReactNode[] => {
    if (
      isValidElement<ComponentProps<typeof Fragment>>(child) &&
      child.type === Fragment
    ) {
      return flattenFragments(child.props.children);
    }
    return [child];
  }, []);
}

export function calculateUrl(href: Destination, currentUrl: URL) {
  if (href instanceof URL) {
    return href;
  }
  if (typeof href === 'string') {
    return new URL(href, currentUrl);
  }

  return urlObjectAssign(new URL(currentUrl), href);
}
