import { type FC, type PropsWithChildren, useLayoutEffect } from 'react';
import { type Destination, type NavigationMethodOptions } from '../Router.js';
import { useLocation } from '../use-router.js';

export const Redirect: FC<
  PropsWithChildren<
    NavigationMethodOptions & {
      href: Destination;
    }
  >
> = ({ href, children, history }) => {
  const [, { navigate }] = useLocation();

  useLayoutEffect(() => {
    navigate(href, history && { history });
  }, [href, history, navigate]);

  return <>{children}</>;
};
