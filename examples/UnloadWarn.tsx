import { useState, type FC } from 'react';
import { usePreventUnload } from '@block65/mrr';

export const UnloadWarn: FC = () => {
  const defaultValue = 'delicious';
  const [value, setValue] = useState(defaultValue);

  const preventUnload = value !== defaultValue;

  usePreventUnload(preventUnload);

  return (
    <div className="space-y-6 max-w-sm">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${preventUnload ? 'bg-signal-stop' : 'bg-signal-go'}`}
        />
        <span>{preventUnload ? 'Browser unload prevented (refresh/close)' : 'No unload guard'}</span>
      </div>

      <form className="space-y-4">
        <label className="block">
          <span className="text-sm text-text-muted">Edit to trigger guard</span>
          <input
            className="mt-2 block w-full rounded-lg border border-border bg-surface-raised px-4 py-3 placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
            name="taste"
            value={value}
            placeholder="delicious"
            autoFocus
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        </label>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-dim transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
};
