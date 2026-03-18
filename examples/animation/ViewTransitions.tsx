import './view-transitions.css';
import {
  useEffect,
  useState,
  type FC,
  type PropsWithChildren,
} from 'react';
import { Routes } from '../../lib/Routes.js';
import { ActionType, Direction } from '../../lib/State.js';
import { startViewTransition } from '@block65/mrr/animate';
import { Route, useLocation, useNavigate, useRouter } from '@block65/mrr';
import { HSL, RGB } from './components.js';
import { hslRoute, rgbRoute } from './routes.js';

const colorLinks = [
  { label: 'Red', href: hslRoute.build({ params: { h: '10', s: '90', l: '50' } }) },
  { label: 'Green', href: hslRoute.build({ params: { h: '120', s: '100', l: '40' } }) },
  { label: 'Blue', href: rgbRoute.build({ params: { r: '33', g: '150', b: '243' } }) },
  { label: 'Pink', href: rgbRoute.build({ params: { r: '240', g: '98', b: '146' } }) },
];

const NavLink: FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const { navigate } = useNavigate();
  const [location] = useLocation();
  const isActive = location.pathname === new URL(href, location).pathname;

  return (
    <a
      className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
        isActive
          ? 'bg-accent/15 text-accent font-medium'
          : 'text-text-muted hover:text-text hover:bg-surface-raised'
      }`}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(`${href}`);
      }}
    >
      {children}
    </a>
  );
};

const TransitionPage: FC<PropsWithChildren> = ({ children }) => {
  const [sinceRender, setSinceRender] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSinceRender((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [sinceRender]);

  const [{ direction }, dispatch] = useRouter();

  useEffect(() => {
    dispatch({
      type: ActionType.Hooks,
      intercept: async (_, update) =>
        startViewTransition(async () => {
          await update();
        }).finished,
    });

    return () => {
      dispatch({ type: ActionType.Hooks, intercept: undefined });
    };
  }, [dispatch]);

  const transitionName =
    direction === Direction.Forward
      ? 'animation-example-fwd'
      : direction === Direction.Backward
        ? 'animation-example-bwd'
        : undefined;

  return (
    <div
      className="rounded-lg border border-border p-6 flex flex-col items-center gap-4"
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
    >
      <div className="flex gap-4 text-xs text-text-dim tabular-nums">
        <span>
          dir: {direction === Direction.Forward ? 'fwd' : direction === Direction.Backward ? 'bwd' : '—'}
        </span>
        <span>tick: {sinceRender}</span>
      </div>
      {children}
    </div>
  );
};

export const ViewTransitionsExample = () => {
  const [location] = useLocation();

  return (
    <div className="px-8 space-y-6 pb-8 sm:px-12">
      <div>
        <h1 className="text-xl font-semibold">/animation</h1>
        <p className="text-sm text-text-muted mt-1">
          View Transitions with directional slides
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {colorLinks.map((link) => (
          <NavLink key={link.label} href={link.href}>
            {link.label}
          </NavLink>
        ))}
      </div>

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
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-text-dim">Pick a color above</p>
          </div>
        </Route>
      </Routes>
    </div>
  );
};
