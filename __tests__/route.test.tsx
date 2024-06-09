import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { useCallback, useEffect, type FC } from 'react';
import { expect, test, vi } from 'vitest';
import { namedRoute } from '../lib/named-route.js';
import type { RouteComponentProps } from '../lib/types.js';
import {
  Route,
  Router,
  Routes,
  type SyntheticNavigateEvent,
} from '../src/index.js';

const login = namedRoute('/');

test('custom route', async () => {
  const CustomRoute = <T extends string>(props: RouteComponentProps<T>) => (
    <Route {...props} />
  );

  const { asFragment } = render(
    <Router>
      <Routes>
        <CustomRoute path={login.path}>
          <h1>custom route</h1>
        </CustomRoute>
      </Routes>
    </Router>,
  );

  expect(asFragment()).toMatchSnapshot();
});

test('cancel nav', async () => {
  const Component: FC = () => {
    const onNav = useCallback(async (e: SyntheticNavigateEvent) => {
      e.preventDefault();
    }, []);
    return (
      <Router intercept={onNav} useNavApi={false}>
        <Routes>
          <Route path={login.path}>
            <h1>custom route</h1>
          </Route>
        </Routes>
      </Router>
    );
  };

  const { asFragment } = render(<Component />);

  expect(asFragment()).toMatchSnapshot();
});

test('routes with components/children/paths/no paths', async () => {
  const HelloComponent = () => <h1>hello</h1>;

  const { asFragment } = render(
    <Router useNavApi={false}>
      <Routes>
        <Route path={login.path} component={HelloComponent} />
        <Route path={login.path}>
          <HelloComponent />
        </Route>
        <Route component={HelloComponent} />
        <Route>
          <HelloComponent />
        </Route>
      </Routes>
    </Router>,
  );

  expect(asFragment()).toMatchSnapshot();
});

test('effects inside route components or children dont fire', async () => {
  const effectFn = vi.fn();

  const HelloComponent: FC = () => {
    useEffect(() => {
      effectFn();
    }, []);
    return <h1>hello</h1>;
  };

  render(
    <Router useNavApi={false}>
      <Routes>
        <Route path="/random" component={HelloComponent} />
        <Route path="random2">
          <HelloComponent />
        </Route>
      </Routes>
    </Router>,
  );

  expect(effectFn).not.toHaveBeenCalled();
});
