export function pathCache<K extends string = string, T = never>(
  map: Map<K, T>,
  key: K,
  builder: (path: K) => T,
): T {
  const value = map.get(key) || builder(key);
  map.set(key, value);
  return value;
}
