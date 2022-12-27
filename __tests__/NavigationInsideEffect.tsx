import { FC, useEffect } from 'react';
import { useNavigate } from '../lib/router.js';
import { LocationDisplay } from './index.test.js';

export const NavigationInsideEffect: FC = () => {
  const { navigate } = useNavigate();

  useEffect(() => {
    navigate({
      pathname: '/pickles',
      searchParams: new URLSearchParams({ foo: 'bar' }),
    });
  }, [navigate]);

  return <LocationDisplay />;
};
