import { createContext } from 'react';
import type { Match } from './matcher.js';

export const RoutesContext = createContext<Match>(false);
