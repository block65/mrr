import { useCallback, type FC } from 'react';
import { useNavigate } from '../index.js';

export const Programmatic: FC = () => {
  const { navigate } = useNavigate();

  const nav = useCallback(() => {
    navigate({
      // pathname: '/woot',
      searchParams: new URLSearchParams({ foo: Date.now().toString() }),
    });
  }, [navigate]);

  return (
    <p>
      This
      <button type="button" onClick={nav}>
        nav
      </button>
      is programmatic
    </p>
  );
};
