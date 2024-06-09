import { type Dispatch } from 'react';
import { type Matcher } from './matcher.js';
import type { PartialWithUndefined, RestrictedURLProps } from './types.js';

export type EntryMeta = {
  navigationType?: NavigationApiNavigationType | undefined;
  navDirection?: Direction;
};

export type State = {
  url: URL;
  matcher: Matcher;
  intercept?: SyntheticNavigateEventListener | undefined;
  change?: SyntheticChangeEventListener | undefined;
  direction: Direction;

  /** @deprecated this was just an escape hatch avoid the navigation API */
  useNavApi: boolean;
};

export type ContextInterface = [State, Dispatch<Action>];

export const enum ActionType {
  Hooks,
  Navigate,
}

export const enum Direction {
  Backward = -1,
  Unknown,
  Forward,
}

export type Action =
  | {
      type: ActionType.Navigate;
      direction: Direction;
    }
  | {
      type: ActionType.Navigate;
      dest: string;
      direction?: Direction;
    }
  | ({ type: ActionType.Hooks } & Pick<State, 'intercept' | 'change'>);

export type SyntheticNavigateEvent = Pick<
  NavigateEvent,
  'preventDefault' | 'signal' | 'navigationType' | 'cancelable'
>;

export type Destination =
  | PartialWithUndefined<RestrictedURLProps>
  | URL
  | string;

export type NavigationMethodOptions = { history?: NavigationHistoryBehavior };

export type NavigationMethod = (
  href: Destination,
  options?: NavigationMethodOptions,
) => void;

export type SyntheticNavigateEventListener =
  | ((
      e: SyntheticNavigateEvent,
      next: () => Promise<void>,
    ) => void | Promise<void>)
  | ((e: SyntheticNavigateEvent) => void | Promise<void>);

export type SyntheticChangeEventListener = (
  e: SyntheticNavigateEvent,
) => void | Promise<void>;

// used so we can recognise the subsequent recovery navigation event that
// occurs after cancelling a navigation
export const kCancelRecovery = Symbol('kCancelRecovery');

export const navigationEventName = 'navigate';
export const currentEntryChangeEventName = 'currententrychange';
