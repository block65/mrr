import { assertType, expectTypeOf, test } from 'vitest';
import { namedRoute } from '@block65/mrr/named-route';

test('paramless route - build is optional', () => {
  const route = namedRoute('/');
  assertType<string>(route.build());
  assertType<string>(route.build({ hash: '#foo' }));
});

test('parameterised route - params required', () => {
  const route = namedRoute('/user/:id');
  assertType<string>(route.build({ params: { id: '1' } }));

  // @ts-expect-error - params is required
  route.build();
  // @ts-expect-error - params is required
  route.build({});
  // @ts-expect-error - id is required
  route.build({ params: {} });
});

test('searchParams() narrows searchParams type', () => {
  const route = namedRoute('/search').searchParams<{ q: string }>();

  assertType<string>(route.build({ searchParams: { q: 'hello' } }));

  // @ts-expect-error - wrong key
  route.build({ searchParams: { wrong: 'nope' } });
  // @ts-expect-error - missing required key
  route.build({ searchParams: {} });
});

test('searchParams() with path params', () => {
  const route = namedRoute('/user/:id').searchParams<{ tab: string }>();

  assertType<string>(
    route.build({ params: { id: '1' }, searchParams: { tab: 'posts' } }),
  );

  // @ts-expect-error - params still required
  route.build({ searchParams: { tab: 'posts' } });
  // @ts-expect-error - wrong searchParams key
  route.build({ params: { id: '1' }, searchParams: { wrong: 'nope' } });
});

test('path type is preserved as literal', () => {
  const route = namedRoute('/user/:id');
  expectTypeOf(route.path).toEqualTypeOf<'/user/:id'>();
});

test('path type preserved through searchParams()', () => {
  const route = namedRoute('/user/:id').searchParams<{ q: string }>();
  expectTypeOf(route.path).toEqualTypeOf<'/user/:id'>();
});

test('searchParams is chainable', () => {
  const route = namedRoute('/').searchParams<{ a: string }>();
  const route2 = route.searchParams<{ b: string }>();

  assertType<string>(route2.build({ searchParams: { b: 'yes' } }));
  // @ts-expect-error - old type no longer valid
  route2.build({ searchParams: { a: 'nope' } });
});
