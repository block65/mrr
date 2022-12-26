import { FC, PropsWithChildren, useLayoutEffect } from 'react';
import {
  Destination,
  NavigationMethodOptions,
  useLocation,
} from '../router.js';

export const Redirect: FC<
  PropsWithChildren<
    NavigationMethodOptions & {
      dest: Destination;
    }
  >
> = ({ dest, children, history }) => {
  const [, { navigate }] = useLocation();

  useLayoutEffect(() => {
    navigate(dest, history && { history });
  }, [dest, history, navigate]);

  return <>{children}</>;
};
