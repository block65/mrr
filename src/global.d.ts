// we only need this because navigation-api-types attaches to the Window object
// we attach it to globalThis here instead to support SSR
// eslint-disable-next-line no-var
declare var navigation: Navigation | undefined;
