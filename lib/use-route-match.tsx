import { useContext } from 'react';
import { RoutesContext } from './RoutesContext.js';
import type { Match } from './matcher.js';

export function useRouteMatch<TPath extends string>(): Match<TPath> {
  return useContext(RoutesContext) as Match<TPath>;
}
