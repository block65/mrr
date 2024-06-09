import {
  Block,
  Heading,
  Inline,
  Paragraph,
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
import { ActionType, Direction } from '../../../lib/State.js';
import { startViewTransition } from '../../../lib/animate.js';
import { Route, useLocation, useNavigate, useRouter } from '../../index.js';
import { HSL, RGB } from './components.js';
import { hslRoute, rgbRoute } from './routes.js';

export const NavLink = ({ href, ...props }: TextLinkProps) => {
  const { navigate } = useNavigate();

  return (
    <Inline component="li">
      <TextLink
        {...props}
        onClick={(e) => {
          e.preventDefault();
          // startViewTransition(() => navigate(`${href}`).committed);
          navigate(`${href}`);
        }}
      />
    </Inline>
  );
};

const TransitionPage: FC<PropsWithChildren<HTMLAttributes<HTMLElement>>> = (
  props,
) => {
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

  return (
    <Block
      {...props}
      borderWidth="1"
      padding="7"
      className={[
        props.className,
        direction === Direction.Forward && styles.fwd,
        direction === Direction.Backward && styles.bwd,
      ]}
      alignItems="center"
    >
      <Paragraph fontSize="0">
        navDirection=
        {direction}
      </Paragraph>
      <Paragraph>{sinceRender}</Paragraph>
      <Inline>{props.children}</Inline>
    </Block>
  );
};

export const ViewTransitionsExample = () => {
  const [location] = useLocation();

  return (
    <Block padding="10">
      <Inline component="ul" justifyContent="center">
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
      </Inline>

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
    </Block>
  );
};
