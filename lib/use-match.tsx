import { useContext } from 'react';
import { RoutesContext } from './RoutesContext.js';
import type { Match } from './matcher.js';

export function useMatch<TPath extends string>(): Match<TPath> {
  return useContext(RoutesContext) as Match<TPath>;
}
