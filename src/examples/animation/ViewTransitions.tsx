import {
  Heading,
  TextLink,
  type TextLinkProps,
} from '@block65/react-design-system';
import { type FC, type HTMLAttributes, type PropsWithChildren } from 'react';
import { startViewTransition } from '../../../lib/animate.js';
import { Routes } from '../../../lib/routes.js';
import { Route, useLocation, useNavigate } from '../../index.js';
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

const Page: FC<PropsWithChildren<HTMLAttributes<HTMLElement>>> = (props) => (
  <div
    style={{
      viewTransitionName: 'pooopies',
      ...props.style,
    }}
    {...props}
  >
    <Heading>Page</Heading>
    {props.children}
  </div>
);

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
            <Page>
              <HSL />
            </Page>
          }
        />

        <Route
          path={rgbRoute.path}
          children={
            <Page>
              <RGB />
            </Page>
          }
        />

        <Route>
          <Heading>404</Heading>
        </Route>
      </Routes>
    </div>
  );
};
