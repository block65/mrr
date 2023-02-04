import { StrictMode, useCallback, type FC } from 'react';
import { createRoot } from 'react-dom/client';
import { namedRoute } from '../lib/named-route.js';
import { useNavigate } from '../lib/router.js';
import { Link, Redirect, Route, Router, Routes } from '../src/index.js';

const container = document.getElementById('root');

if (!container) {
  throw new Error('No root container found');
}

const root = createRoot(container);

const logout = namedRoute('/');
const admin = namedRoute('/admin');
const login = namedRoute('/login');
const user = namedRoute('/user');
const there = namedRoute('/there');
const here = namedRoute('/here');

const Programmatic: FC = () => {
  const { navigate } = useNavigate();

  const nav = useCallback(() => {
    navigate({
      // pathname: '/woot',
      searchParams: new URLSearchParams({ foo: Date.now().toString() }),
    });
  }, [navigate]);

  return (
    <p>
      This
      <button type="button" onClick={nav}>
        nav
      </button>
      is programmatic
    </p>
  );
};

root.render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path={logout.path}>
          <h2>I present to you, a menu!</h2>
          <p>
            <Link dest={here.build()}>go here!</Link>
          </p>
          <p>
            <Link dest={there.build()}>dont go there</Link>
          </p>
          <p>
            <Link
              dest={{
                searchParams: new URLSearchParams({ foo: 'bar' }),
              }}
            >
              foo must equal bar
            </Link>
          </p>
        </Route>
        <Route path={there.path}>
          <Programmatic />
        </Route>
        <Route path={login.path}>
          <p>press ok when logged in</p>
          <Link dest={admin.build()}>ok</Link>
        </Route>
        <Route path={admin.path}>
          <h1>admin</h1>
          <Link dest={user.build()}>user</Link>|
          <Link dest={logout.build()}>logout</Link>
        </Route>
        <>
          <Route path={user.path}>
            <h1>user</h1>
            <Link dest={admin.build()}>admin</Link>|
            <Link dest={logout.build()}>logout</Link>
          </Route>
        </>
        <Route path="/broken-link">
          <h1>404 soz</h1>
          <Redirect dest={login.build()}>
            <Link dest={login.build()}>click here if no redirect</Link>
          </Redirect>
        </Route>
        <Route>
          <h1>404 soz</h1>
          <Link dest={login.build()}>login?</Link>
        </Route>
      </Routes>
    </Router>
    <hr />
    <p>
      <a href="https://www.google.com">Meh, just go somewhere else</a>
    </p>
  </StrictMode>,
);
