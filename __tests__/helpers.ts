export function urlRhs(url: URL): string {
  return decodeURI(url.toString().slice(url.origin.length));
}
