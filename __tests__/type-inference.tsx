import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import type { ExtractRouteParams } from '../lib/types.js';
import { Route, Router, Routes } from '../src/index.js';
import { namedRoute } from '../src/named-route.js';

const login = namedRoute('/foo/:foo/bar/:bar?');

const EffCee: FC<ExtractRouteParams<typeof login.path>> = (props) => (
  <h1>{props.foo}</h1>
);

test('inferred component function props', async () => {
  const { asFragment } = render(
    <Router>
      <Routes>
        <Route path={login.path}>
          <h1>normal</h1>
        </Route>
        <Route path={login.path} component={(props) => <h1>{props.foo}</h1>} />
        <Route path={login.path} component={EffCee} />
        <Route path={login.path} component={EffCee}>
          not both
        </Route>
        <Route>Default - 404 </Route>
      </Routes>
    </Router>,
  );

  expect(asFragment()).toMatchSnapshot();
});
