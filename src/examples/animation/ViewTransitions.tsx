import {
  Block,
  Heading,
  Inline,
  TextLink,
  type TextLinkProps,
} from '@block65/react-design-system';
import {
  useEffect,
  useState,
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import styles from './ViewTransitions.module.scss';
import { Routes } from '../../../lib/Routes.js';
import { startViewTransition } from '../../../lib/animate.js';
import { Route, useLocation, useNavigate, useRouterHook } from '../../index.js';
import { HSL, RGB } from './components.js';
import { hslRoute, rgbRoute } from './routes.js';

export const NavLink = ({ href, ...props }: TextLinkProps) => {
  const { navigate } = useNavigate();

  return (
    <li>
      <TextLink
        {...props}
        onClick={(e) => {
          e.preventDefault();
          startViewTransition(() => navigate(`${href}`).committed);
        }}
      />
    </li>
  );
};

const TransitionPage: FC<PropsWithChildren<HTMLAttributes<HTMLElement>>> = (
  props,
) => {
  // this is the navigation type of the current page. It will be set to null
  // when the page has just loaded and will change when a navigation occurs
  const [pageExitNavType, setPageExitNavType] =
    useState<NavigationApiNavigationType | null>(null);

  const onNavigation = useRouterHook();
  useEffect(
    () =>
      onNavigation(async (e, next) => {
        setPageExitNavType(e.navigationType);
        return startViewTransition(async () => {
          await next(e);
        }).finished;
      }),
    [onNavigation],
  );

  return (
    <Block
      {...props}
      data-testid="transition-page"
      className={[props.className, styles.fwd]}
      alignItems="center"
    >
      <Heading>{pageExitNavType ? `bye! ${pageExitNavType}` : 'New'}</Heading>

      <Inline>{props.children}</Inline>
    </Block>
  );
};

export const ViewTransitionsExample = () => {
  const [location] = useLocation();

  return (
    <div>
      <ul>
        <NavLink
          href={hslRoute.build({
            params: {
              h: '10',
              s: '90',
              l: '50',
            },
          })}
        >
          HSL Red
        </NavLink>

        <NavLink
          href={hslRoute.build({
            params: {
              h: '120',
              s: '100',
              l: '40',
            },
          })}
        >
          HSL Green
        </NavLink>

        <NavLink
          href={rgbRoute.build({
            params: {
              r: '33',
              g: '150',
              b: '243',
            },
          })}
        >
          RGB Blue
        </NavLink>

        <NavLink
          href={rgbRoute.build({
            params: {
              r: '240',
              g: '98',
              b: '146',
            },
          })}
        >
          RGB Pink
        </NavLink>
      </ul>

      <Routes key={location.pathname}>
        <Route
          path={hslRoute.path}
          children={
            <TransitionPage>
              <HSL />
            </TransitionPage>
          }
        />

        <Route
          path={rgbRoute.path}
          children={
            <TransitionPage>
              <RGB />
            </TransitionPage>
          }
        />

        <Route>
          <Heading>404</Heading>
        </Route>
      </Routes>
    </div>
  );
};
