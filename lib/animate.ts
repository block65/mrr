import { flushSync } from 'react-dom';

export function startViewTransition(
  updateCallback: () => Promise<unknown> | unknown, // allowing any return type makes calling easier
): ViewTransition {
  if (document?.startViewTransition) {
    return document.startViewTransition(async () => {
      // https://developer.chrome.com/docs/web-platform/view-transitions/same-document#working_with_frameworks
      await flushSync(updateCallback);
    });
  }

  // VTA not supported, run it immediately.
  updateCallback();
  const resolved = Promise.resolve();
  return {
    ready: resolved,
    finished: resolved,
    skipTransition: async () => {},
    updateCallbackDone: resolved,
  };
}
