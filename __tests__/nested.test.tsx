import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { namedRoute } from '../lib/named-route.js';
import { Route, Router, Routes } from '../src/index.js';
import { LocationDisplay } from './index.test.js';

test('wildcard routes + nested', async () => {
  const userRoot = namedRoute('/users');
  const userView = namedRoute('/users/blah/:userId');

  const ComponentWithUserId: FC<{ userId: string }> = ({
    params: { userId },
  }) => <>userId = {userId}</>;

  const ParamlessComponent: FC = () => <>I am a Paramless Component</>;

  const { asFragment } = render(
    <Router pathname="/users/blah/test1">
      <LocationDisplay />
      <Routes>
        <Route wildcard path={userRoot.path}>
          <h1>inside userRoot</h1>
          <Routes>
            <Route path={userRoot.path}>this should not display</Route>
            <Route
              wildcard
              path={userView.path}
              component={(params) => (
                <h1 data-testid="users">You are user {params.userId}</h1>
              )}
            ></Route>
            <Route path={userView.path} component={ComponentWithUserId} />
            <Route>
              <ParamlessComponent />
            </Route>
            <Route>
              <h1>fail</h1>
            </Route>
          </Routes>
        </Route>

        <Route>
          <h1>fail</h1>
        </Route>
      </Routes>
    </Router>,
  );

  await waitFor(() => screen.getByTestId('users'));

  expect(asFragment()).toMatchSnapshot();
});

test('default route + wildcard routes + nested', async () => {
  const userView = namedRoute('/users/blah/:userId');

  const { asFragment } = render(
    <Router pathname="/users/blah/test1">
      <LocationDisplay />
      <Routes>
        <Route>
          <Routes>
            <Route>
              <Routes>
                <Route
                  wildcard
                  path={userView.path}
                  component={(params) => (
                    <h1 data-testid="users">You are user {params.userId}</h1>
                  )}
                />
                <Route>
                  <h1>fail</h1>
                </Route>
              </Routes>
            </Route>
            <Route>
              <h1>fail</h1>
            </Route>
          </Routes>
        </Route>
      </Routes>
    </Router>,
  );

  await waitFor(() => screen.getByTestId('users'));

  expect(asFragment()).toMatchSnapshot();
});
