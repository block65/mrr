import type { RouteComponentProps } from './types.js';
import { useRouteMatch } from './use-route-match.js';

export const Route = <TPath extends string>(
  props: RouteComponentProps<TPath>,
) => {
  const match = useRouteMatch<TPath>();

  if (match) {
    if (
      props &&
      'component' in props &&
      typeof props.component === 'function'
    ) {
      return props.component(match.params);
    }

    if ('children' in props) {
      return <>{props.children}</>;
    }

    return <props.component {...match.params} />;
  }

  return null;
};
