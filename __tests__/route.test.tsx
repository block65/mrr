import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { useCallback, type FC, type PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { expect, test, vi } from 'vitest';
import { namedRoute } from '../lib/named-route.js';
import {
  Route,
  Router,
  Routes,
  type PartialNavigateEventListener,
} from '../src/index.js';

const login = namedRoute('/');

test('custom route', async () => {
  const CustomRoute = (props: PropsWithChildren<{ path: string }>) => (
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
    const onNav = useCallback<PartialNavigateEventListener>(async (e) => {
      e.preventDefault();
    }, []);
    return (
      <Router hook={onNav}>
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
  const HelloComponent: FC = () => <h1>hello</h1>;

  const { asFragment } = render(
    <Router>
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
    <Router>
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
