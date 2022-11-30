import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FC, useEffect } from 'react';
import { Route } from '../lib/components.js';
import { namedRoute } from '../lib/named-route.js';
import { Router, useNavigate } from '../lib/router.js';
import { Routes } from '../lib/routes.js';
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
            data-testid={`button-${userId}`}
            onClick={() => {
              const dest = usersView.build({ params: { userId } });
              navigate(dest);
            }}
          >
            {userId}
          </button>
        </li>
      ))}
    </ul>
  );
};

const NavigationInsideEffect: FC = () => {
  const { navigate } = useNavigate();

  useEffect(() => {
    // navigate({
    //   pathname: '/pickles',
    //   searchParams: new URLSearchParams({ foo: 'bar' }),
    // });
    navigate('/pickles?foo=bar');
  }, [navigate]);

  return <LocationDisplay />;
};

test('nav with clicks', async () => {
  // const { debug } =
  render(
    <Router pathname="/users/test1">
      <LocationDisplay />
      <Routes>
        <Route path={usersView.path}>
          {(params) => (
            <h1 data-testid={`heading-${params.userId}`}>
              You are user {params.userId}
            </h1>
          )}
        </Route>

        <Route>
          <h1>fail</h1>
        </Route>
      </Routes>

      <Buttons />
    </Router>,
  );

  // debug();

  await waitFor(() => screen.getByTestId('heading-test1'));

  fireEvent.click(screen.getByTestId('button-alice'));
  expect(screen.getByRole('heading')).toHaveTextContent(/alice/);

  fireEvent.click(screen.getByTestId('button-bob'));
  expect(screen.getByRole('heading')).toHaveTextContent(/bob/);

  fireEvent.click(screen.getByTestId('button-carol'));
  expect(screen.getByRole('heading')).toHaveTextContent(/carol/);
});

test.only('programmatic navigation with hooks', async () => {
  render(
    <Router pathname="/">
      <NavigationInsideEffect />
    </Router>,
  );

  await waitFor(() => {
    // global location
    expect(location.href).toBe('http://localhost/pickles?foo=bar');
  });

  await waitFor(() =>
    expect(screen.getByTestId('location-display')).toHaveTextContent(
      'http://localhost/pickles?foo=bar',
    ),
  );
});
