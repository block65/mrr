import '@testing-library/jest-dom';
import { expect, test } from 'vitest';
import { namedRoute } from '../src/named-route.js';

const route1 = namedRoute('/');
const route2 = namedRoute('/test');
const route3 = namedRoute('/test/:welp');
const route4 = namedRoute('/test/:welp/:welp2/:kelp3?');

test('custom route', async () => {
  expect(route1.build()).toMatchInlineSnapshot(`"/"`);
  expect(route2.build()).toMatchInlineSnapshot(`"/test"`);
  expect(
    route3.build({
      params: {
        welp: '123',
      },
    }),
  ).toMatchInlineSnapshot(`"/test/123"`);

  expect(
    route3.build({
      // @ts-expect-error - required params not supplied
      params: {},
    }),
  ).toMatchInlineSnapshot(`"/test"`);

  expect(
    // @ts-expect-error - required prop not supplied
    route3.build({}),
  ).toMatchInlineSnapshot(`"/test/:welp"`);

  expect(
    // @ts-expect-error - required arg not supplied
    route3.build(),
  ).toMatchInlineSnapshot(`"/test/:welp"`);

  expect(
    route4.build({
      params: {
        welp: '123',
        welp2: '456',
      },
    }),
  ).toMatchInlineSnapshot(`"/test/123/456"`);

  expect(
    route4.build({
      params: {
        welp: '123',
        welp2: '456',
      },
      origin: 'https://example.com',
    }),
  ).toMatchInlineSnapshot(`"https://example.com/test/123/456"`);
});
