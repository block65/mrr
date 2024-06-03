import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { ExtractRouteParams } from '../lib/types.js';
import { Route, Router, Routes } from '../src/index.js';
import { namedRoute } from '../src/named-route.js';

const login = namedRoute('/foo/:foo');

const EffCee = (props: ExtractRouteParams<typeof login.path>) => (
  <h1>{props.foo}</h1>
);

test('inferred component function props', async () => {
  const { asFragment } = render(
    <Router>
      <Routes>
        <Route path={login.path}>
          <h1>normal</h1>
        </Route>
        <Route
          path={login.path}
          component={(params) => <h1>{params.foo}</h1>}
        />
        <Route path={login.path} component={EffCee} />
        <Route>Default route with children</Route>
      </Routes>
    </Router>,
  );

  expect(asFragment()).toMatchSnapshot();
});
