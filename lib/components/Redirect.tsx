import { type FC, type PropsWithChildren, useLayoutEffect } from 'react';
import {
  type Destination,
  type NavigationMethodOptions,
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
