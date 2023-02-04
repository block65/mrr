import '@testing-library/jest-dom';
import { namedRoute } from '../lib/named-route.js';

const route1 = namedRoute('/');
const route2 = namedRoute('/test');
const route3 = namedRoute('/test/:welp');
const route4 = namedRoute('/test/:welp/:welp2/:kelp3?');

test('custom route', async () => {
  expect(route1.build()).toMatchInlineSnapshot();
  expect(route2.build()).toMatchInlineSnapshot();
  expect(
    route3.build({
      params: {
        welp: '123',
      },
    }),
  ).toMatchInlineSnapshot();

  expect(
    route3.build({
      // @ts-expect-error - required param not supplied
      params: {},
    }),
  ).toMatchInlineSnapshot();

  expect(
    // @ts-expect-error - required paramss not supplied
    route3.build({}),
  ).toMatchInlineSnapshot();

  expect(
    // @ts-expect-error - required s not supplied
    route3.build(),
  ).toMatchInlineSnapshot();

  expect(
    route4.build({
      params: {
        welp: '123',
        welp2: '456',
      },
    }),
  ).toMatchInlineSnapshot();
});
