import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { ExtractRouteParams } from '../lib/types.js';
import { Route, Router, Routes, useRouteParams } from '@block65/mrr';
import { namedRoute } from '@block65/mrr/named-route';

const login = namedRoute('/foo/:foo/bar/:bar?');

const EffCee = (_: ExtractRouteParams<typeof login.path>) => {
  const match = useRouteParams();
  return <pre>{JSON.stringify(match, null, 2)}</pre>;
};

test('Router preset pathname', async () => {
  const { asFragment } = render(
    <Router
      pathname={login.build({
        params: {
          foo: 'oh-look-a-foo',
          bar: 'omg-a-bar',
        },
      })}
    >
      <Routes>
        <Route path={login.path} component={EffCee} />
        <Route>if you see this, the test failed</Route>
      </Routes>
    </Router>,
  );

  expect(asFragment()).toMatchSnapshot();
});
