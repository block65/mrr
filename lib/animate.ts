import { flushSync } from 'react-dom';

export function startViewTransition(
  updateCallback: () => Promise<unknown> | unknown,
  withFlush = true,
): ViewTransition {
  if (document?.startViewTransition) {
    return document.startViewTransition(async () => {
      if (withFlush) {
        await flushSync(updateCallback);
      } else {
        await updateCallback();
      }
    });
  }

  updateCallback();

  const resolved = Promise.resolve();

  return {
    ready: resolved,
    finished: resolved,
    skipTransition: async () => {},
    updateCallbackDone: resolved,
  };
}
