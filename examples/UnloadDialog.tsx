import { useCallback, useEffect, useState, type FC } from 'react';
import { useRouterIntercept } from '@block65/mrr';

export const UnloadDialog: FC = () => {
  const [canLeave, setCanLeave] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingResolve, setPendingResolve] =
    useState<(value: boolean) => void>();

  const intercept = useRouterIntercept();

  useEffect(
    () =>
      intercept(async (e, next) => {
        if (!canLeave) {
          const allowed = await new Promise<boolean>((resolve) => {
            setPendingResolve(() => resolve);
            setShowModal(true);
          });

          if (!allowed) {
            e.preventDefault();
          }
        }

        await next();
      }),
    [canLeave, intercept],
  );

  const handleResponse = useCallback(
    (allowed: boolean) => {
      pendingResolve?.(allowed);
      setShowModal(false);
    },
    [pendingResolve],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${canLeave ? 'bg-signal-go' : 'bg-signal-stop'}`}
        />
        <span>{canLeave ? 'Navigation allowed' : 'Navigation blocked'}</span>
      </div>

      {showModal && (
        <dialog
          open
          className="fixed inset-0 z-50 m-auto w-96 rounded-xl border border-border bg-surface-overlay text-text shadow-xl shadow-black/30 p-0"
        >
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-semibold">Leave this page?</h2>
            <p className="text-sm text-text-muted mt-1">You have unsaved state.</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <button
              type="button"
              className="px-5 py-4 text-text-muted hover:bg-surface-raised hover:text-text transition-colors rounded-bl-xl"
              onClick={() => handleResponse(false)}
            >
              Stay
            </button>
            <button
              type="button"
              className="px-5 py-4 text-accent font-medium hover:bg-surface-raised transition-colors rounded-br-xl"
              onClick={() => handleResponse(true)}
            >
              Leave
            </button>
          </div>
        </dialog>
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={canLeave}
          onChange={(e) => setCanLeave(e.target.checked)}
          className="w-4 h-4 rounded accent-accent"
        />
        <span className="text-text-muted">Allow navigation</span>
      </label>
    </div>
  );
};
