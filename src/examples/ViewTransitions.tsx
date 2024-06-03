import { Heading } from '@block65/react-design-system';
import { type FC, type PropsWithChildren } from 'react';
import { Routes } from '../../lib/Routes.js';
import { Route, useLocation } from '../index.js';
import { NavLink } from './animation/ViewTransitions.js';
import { HSL, RGB } from './animation/components.js';
import { hslRoute, rgbRoute } from './animation/routes.js';

const Page: FC<PropsWithChildren> = (props) => (
  <div
    style={{
      viewTransitionName: 'page',
    }}
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

      <div style={{ overflow: 'hidden' }}>
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
    </div>
  );
};
