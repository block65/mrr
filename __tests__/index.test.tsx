import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, Route, Router, Routes, useLocation } from '../lib/index.js';
import { routify } from '../lib/routify.js';

export const LocationDisplay = () => {
  const [location] = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
};

test('basic', async () => {
  const origin = 'https://router.example.com';

  const root = routify('/');
  const login = routify('/login');
  const userView = routify('/user/:userId');

  /* const { debug } =  */ render(
    <Router origin={origin} pathname="/">
      <LocationDisplay />
      <Routes>
        <Route path={userView.path}>
          <h1 data-testid="users">You are at the users view page</h1>
        </Route>
        <Route path={login.path}>
          <h1 data-testid="login">You are at the login page</h1>
        </Route>
        <Route path="/">
          <h1 data-testid="root">You are at the root!</h1>
          <Link url={login.build({ origin })}>login</Link>
        </Route>
        <Route>
          <h1>404</h1>
          <Link url={root.build({ origin })}>Go to root</Link>
        </Route>
      </Routes>
    </Router>,
  );

  await waitFor(() => screen.getByTestId('root'));

  fireEvent.click(screen.getByText('login'));

  await waitFor(() => screen.getByTestId('login'));

  expect(screen.getByRole('heading')).toHaveTextContent(
    'You are at the login page',
  );
});
