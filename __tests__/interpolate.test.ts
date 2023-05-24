import '@testing-library/jest-dom';
import { expect, test } from 'vitest';
import { interpolate } from '../lib/named-route.js';

// type PathPart = `/${string}`;
// type Path = `${PathPart}${PathPart}?` | `${PathPart}${PathPart}*`;

test('custom route', async () => {
  expect(interpolate('/test', {})).toBe('/test');

  expect(
    interpolate('/foo/:foo', {
      foo: 'oof',
    }),
  ).toBe('/foo/oof');

  expect(
    interpolate('/foo/:foo?', {
      foo: 'oof',
    }),
  ).toBe('/foo/oof');

  expect(interpolate('/foo/:foo?', {})).toBe('/foo');
  expect(
    interpolate('/foo/:foo?/bar/:bar', {
      bar: 'rab',
    }),
  ).toBe('/foo/bar/rab');

  expect(
    interpolate('/foo/:foo*', {
      foo: 'oof',
    }),
  ).toBe('/foo/oof');

  expect(
    interpolate('/foo/:foo+', {
      foo: 'oof',
    }),
  ).toBe('/foo/oof');

  expect(
    interpolate('/foo/:foo*', {
      foo: 'oof/rab/zab',
    }),
  ).toBe('/foo/oof/rab/zab');
  expect(
    interpolate('/set/:set/q/:id?', {
      set: 'BTT',
      id: 'YES!',
    }),
  ).toBe('/set/BTT/q/YES!');
});
