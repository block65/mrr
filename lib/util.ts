/// <reference lib="dom" />

import {
  type ReactNode,
  Children,
  isValidElement,
  type ComponentProps,
  Fragment,
} from 'react';
import type { Destination } from './router.js';
import type { PartialWithUndefined, URLProps } from './types.js';

export const nullOrigin = new URL('http://null');

export function noop() {}

export function hasNavigationApi(n?: Navigation | undefined): n is Navigation {
  return typeof n !== 'undefined';
}

export const popStateEventName = 'popstate';

export class Deferred<T extends void = void> {
  public promise: Promise<T>;

  public resolve: (value: T | PromiseLike<T>) => void;

  constructor() {
    this.resolve = noop;
    this.promise = new Promise<T>((resolve) => {
      this.resolve = resolve;
    });
  }
}

export function withWindow<A>(
  a: (window: Window & typeof globalThis) => A,
): A | undefined;
export function withWindow<A, B>(
  a: (window: Window & typeof globalThis) => A,
  b: B,
): A | B;
export function withWindow<A, B>(
  a: (window: Window & typeof globalThis) => A,
  b?: B,
): A | B | undefined {
  return typeof window !== 'undefined' ? a(window) : b;
}

export function withDocument<A>(a: (document: Document) => A): A | undefined;
export function withDocument<A, B>(a: (document: Document) => A, b: B): A | B;
export function withDocument<A, B>(
  a: (document: Document) => A,
  b?: B,
): A | B | undefined {
  return typeof document !== 'undefined' ? a(document) : b;
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

export function flattenChildren(children: React.ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child): ReactNode[] => {
    if (
      isValidElement<ComponentProps<typeof Fragment>>(child) &&
      child.type === Fragment
    ) {
      return flattenChildren(child.props.children);
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
