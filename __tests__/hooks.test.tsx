import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { expect, test } from 'vitest';
import type { ExtractRouteParams } from '../lib/types.js';
import { Route, Router, Routes, useRouteParams } from '../src/index.js';
import { namedRoute } from '../src/named-route.js';

const login = namedRoute('/foo/:foo/bar/:bar?');

const EffCee: FC<ExtractRouteParams<typeof login.path>> = () => {
  const match = useRouteParams();

  return <pre>{JSON.stringify(match, null, 2)}</pre>;
};

test('useMatch', async () => {
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
      </Routes>
    </Router>,
  );

  expect(asFragment()).toMatchSnapshot();
});
