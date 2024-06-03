import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { expect, test } from 'vitest';
import { Route, Router, Routes, useNavigate } from '../src/index.js';
import { namedRoute } from '../src/named-route.js';
import { NavigationInsideEffect } from './NavigationInsideEffect.js';
import { LocationDisplay } from './index.test.js';

const usersView = namedRoute('/users/:userId');

const Buttons: FC = () => {
  const { navigate } = useNavigate();

  const users = ['alice', 'bob', 'carol', 'dave'];

  return (
    <ul>
      {users.map((userId) => (
        <li key={userId}>
          <button
            type="button"
            data-testid={`button-${userId}`}
            onClick={() => {
              const href = usersView.build({ params: { userId } });
              navigate(href);
            }}
          >
            {userId}
          </button>
        </li>
      ))}
    </ul>
  );
};

test('nav with clicks', async () => {
  render(
    <Router pathname="/users/test1">
      <LocationDisplay />
      <Routes>
        <Route
          path={usersView.path}
          component={(params) => (
            <h1 data-testid={`heading-${params.userId}`}>
              You are user {params.userId}
            </h1>
          )}
        />

        <Route>
          <h1>fail</h1>
        </Route>
      </Routes>

      <Buttons />
    </Router>,
  );

  await waitFor(() => screen.getByTestId('heading-test1'));

  fireEvent.click(screen.getByTestId('button-alice'));
  await waitFor(() =>
    expect(screen.getByRole('heading')).toHaveTextContent(/alice/),
  );

  fireEvent.click(screen.getByTestId('button-bob'));
  await waitFor(() =>
    expect(screen.getByRole('heading')).toHaveTextContent(/bob/),
  );

  fireEvent.click(screen.getByTestId('button-carol'));
  await waitFor(() =>
    expect(screen.getByRole('heading')).toHaveTextContent(/carol/),
  );
});

test('programmatic navigation with hooks', async () => {
  render(
    <Router pathname="/">
      <NavigationInsideEffect />
    </Router>,
  );

  await waitFor(() => {
    expect(window?.location.href).toBe('http://localhost:3000/pickles?foo=bar');

    expect(screen.getByTestId('location-display')).toHaveTextContent(
      'http://localhost:3000/pickles?foo=bar',
    );
  });
});
