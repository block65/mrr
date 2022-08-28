import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import {
  Link,
  Route,
  RouteComponentProps,
  Router,
  Routes,
  useLocation,
} from '../src/index.js';
import { routify } from '../lib/routify.js';
import { useNavigate } from '../lib/router.js';

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

test('wildcard routes + nested', async () => {
  const origin = 'https://router.example.com';

  const userRoot = routify('/users');
  const userView = routify('/users/blah/:userId');

  const ComponentWithUserId: FC<RouteComponentProps<{ userId: string }>> = ({
    params: { userId },
  }) => <>userId = {userId}</>;

  const ParamlessComponent: FC = () => <>I am a Paramless Component</>;

  /* const { debug } =  */ render(
    <Router origin={origin} pathname="/users/blah/test1">
      <LocationDisplay />
      <Routes>
        <Route wildcard path={userRoot.path}>
          <h1>inside userRoot</h1>
          <Routes>
            <Route path={userRoot.path}>this should not display</Route>
            <Route wildcard path={userView.path}>
              {(params) => (
                <h1 data-testid="users">You are user {params.userId}</h1>
              )}
            </Route>
            <Route path={userView.path} component={ComponentWithUserId} />
            <Route component={ParamlessComponent} />
            <Route>{(params) => <ParamlessComponent {...params} />}</Route>
            <Route>
              <h1>fail</h1>
            </Route>
          </Routes>
        </Route>
      </Routes>
    </Router>,
  );

  await waitFor(() => screen.getByTestId('users'));
});

test('programmatic nav', async () => {
  const origin = 'https://router.example.com';

  const usersView = routify('/users/:userId');

  // const ComponentWithUserId: FC<{ userId: string }> = ({ userId }) => (
  //   <>userId = {userId}</>
  // );
  // const ParamlessComponent: FC = () => <>Paramless</>;

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

  /* const { debug } =  */ render(
    <Router origin={origin} pathname="/users/test1">
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
