import { useCallback, type FC } from 'react';
import { useNavigate } from '@block65/mrr';

export const Programmatic: FC = () => {
  const { navigate } = useNavigate();

  const nav = useCallback(() => {
    navigate({
      searchParams: new URLSearchParams({ foo: Date.now().toString() }),
    });
  }, [navigate]);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={nav}
        className="px-5 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-dim transition-colors"
      >
        navigate()
      </button>
      <span className="text-text-muted">
        Appends timestamp to search params
      </span>
    </div>
  );
};
