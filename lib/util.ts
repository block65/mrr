/// <reference lib="dom" />

import {
  type ReactNode,
  Children,
  isValidElement,
  type ComponentProps,
  Fragment,
} from 'react';
import type { PartialWithUndefined } from './types.js';

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
  props: PartialWithUndefined<Omit<URL, 'href'>>,
): URL {
  const { origin, searchParams, ...rest } = props;

  const newUrl = origin ? new URL(urlRhs(url), origin) : url;

  Object.entries(rest).forEach(([k, v]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newUrl[k as keyof typeof rest] = v;
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
