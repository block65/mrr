import { Heading } from '@block65/react-design-system';
import { AnimatePresence, motion } from 'framer-motion';
import type { FC, PropsWithChildren } from 'react';
import { Routes } from '../../../lib/routes.js';
import { Link, Route, useLocation, type LinkProps } from '../../index.js';
import { HSL, RGB } from './components.js';
import { hslRoute, rgbRoute } from './routes.js';

export const NavLink = (props: LinkProps) => (
  <li>
    <Link {...props} style={{ color: 'inherit' }} />
  </li>
);

const Page: FC<PropsWithChildren> = ({ children }) => (
  <motion.div
    initial={{ x: 300, opacity: 0 }}
    animate={{
      x: 0,
      opacity: 1,
      transition: { duration: 0.1 },
    }}
    exit={{ x: -300, opacity: 0 }}
  >
    {children}
  </motion.div>
);

export const FramerMotionExample = () => {
  const [location] = useLocation();

  return (
    <div>
      {location.pathname}
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
        <AnimatePresence mode="popLayout">
          <Routes>
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
        </AnimatePresence>
      </div>
    </div>
  );
};
