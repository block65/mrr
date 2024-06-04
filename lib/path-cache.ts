import type { RoutingProps } from './types.js';

export function pathCache<P extends RoutingProps, T>(
  map: WeakMap<P, T>,
  props: P,
  builder: (props: P) => T,
): T {
  const value = map.get(props) || builder(props);
  map.set(props, value);
  return value;
}
