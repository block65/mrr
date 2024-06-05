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
  const [navigationType, setNavigationType] =
    useState<NavigationApiNavigationType | null>(null);

  const onNavigation = useRouterHook();
  useEffect(
    () =>
      onNavigation(async (e, next) => {
        setNavigationType(e.navigationType);

        return startViewTransition(async () => {
          await next(e);
        }).finished;
      }),
    [onNavigation],
  );

  return (
    <Block>
      <Heading>TransitionPage</Heading>

      <Inline
        style={{
          viewTransitionName:
            navigationType === 'push'
              ? 'animation-example-fwd'
              : 'animation-example-bwd',
          ...props.style,
        }}
        {...props}
      >
        {props.children}
      </Inline>
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
