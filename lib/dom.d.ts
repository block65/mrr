declare global {
  type BeforeUnloadEvent<T = unknown> = {
    preventDefault(): void;
    returnValue: T;
  };

  type AddEventListenerOptions = {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
  };

  interface Location {
    href: string;
    pathname: string;
    search: string;
    origin: string;
    assign(url: URL | string): void;
  }

  interface Document {
    getElementById(id: string): HTMLElement | null;
  }

  class PopStateEvent extends Event {}

  type BeforeUnloadEvent = Event;

  type EventListener = (event: Event) => void;

  interface HTMLInputElement {
    checked: boolean;
    value: string;
  }

  interface Window {
    navigation: Navigation | undefined;
    location: Location;
    history: History;
    addEventListener(
      type: 'beforeunload' | 'popstate',
      listener: EventListener,
      options?: AddEventListenerOptions,
    ): void;
    removeEventListener(
      type: 'beforeunload' | 'popstate',
      listener: EventListener,
      options?: AddEventListenerOptions,
    ): void;
    document: Document;
    navigation: Navigation;
    dispatchEvent;
  }

  // we only need this because navigation-api-types attaches to the Window object
  // we attach it to globalThis here instead to support SSR
  // eslint-disable-next-line no-var
  const navigation: Navigation | undefined;

  const document: Document | undefined;

  const window: Window | undefined;

  const location: Location | undefined;

  function dispatchEvent(event: Event): boolean;
}

interface HTMLInputElement {
  checked: boolean;
  value: string;
}

export {};
