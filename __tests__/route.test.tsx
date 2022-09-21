import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import type { ComponentProps, FC } from 'react';
import { namedRoute } from '../lib/named-route.js';
import { Route, Router, Routes } from '../src/index.js';

const CustomRoute: FC<ComponentProps<typeof Route>> = (props) => (
  <Route {...props} />
);

test('custom route', async () => {
  const login = namedRoute('/');

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
