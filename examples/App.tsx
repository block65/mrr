import { type FC } from 'react';
import {
  Link,
  Redirect,
  Route,
  Router,
  Routes,
  useLocation,
} from '@block65/mrr';
import { Programmatic } from './Programmatic.js';
import { UnloadDialog } from './UnloadDialog.js';
import { UnloadWarn } from './UnloadWarn.js';
import { ViewTransitionsExample } from './animation/ViewTransitions.js';
import {
  admin,
  animationRoute,
  everywhere,
  here,
  index,
  login,
  nowhere,
  there,
  user,
} from './paths.js';

const PathDisplay: FC = () => {
  const [location] = useLocation();
  return (
    <code className="font-mono text-sm text-text-dim">
      {location.pathname}
      {location.search}
    </code>
  );
};

const NavItem: FC<{
  href: string;
  label: string;
  tag: string;
  color?: string;
}> = ({ href, label, tag, color = 'bg-accent/10 text-accent' }) => (
  <Link href={href}>
    <a className="group flex items-center gap-4 px-4 py-4 rounded-lg hover:bg-surface-raised transition-colors">
      <span
        className={`font-mono text-sm px-2.5 py-1 rounded-md shrink-0 ${color}`}
      >
        {label}
      </span>
      <span className="text-base text-text-muted group-hover:text-text transition-colors">
        {tag}
      </span>
      <span className="ml-auto text-text-dim/30 group-hover:text-accent/60 transition-colors">
        &rarr;
      </span>
    </a>
  </Link>
);

const BackLink: FC = () => (
  <Link href={index.build()}>
    <a className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-accent transition-colors mb-4">
      &larr; back
    </a>
  </Link>
);

const PageFrame: FC<{
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="px-8 py-8 space-y-6 sm:px-12">
    <div>
      <BackLink />
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && (
        <p className="text-base text-text-muted mt-1.5">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

export const App: FC = () => (
  <Router>
    <div className="flex flex-col min-h-dvh max-w-2xl mx-auto w-full font-sans bg-surface text-text antialiased text-base">
      <header className="flex items-center justify-between px-8 py-6 sm:px-12">
        <Link href={index.build()}>
          <a className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-warm grid place-items-center text-xs font-bold text-white">
              m
            </span>
            <span className="font-semibold text-lg">mrr</span>
          </a>
        </Link>
        <PathDisplay />
      </header>

      <main className="flex-1 pb-12">
        <Routes>
          <Route path={index.path}>
            <div className="px-8 pt-4 pb-6 sm:px-12">
              <h1 className="text-3xl font-semibold">Explore</h1>
              <p className="text-base text-text-muted mt-2">
                Router feature demos
              </p>
            </div>

            <nav className="px-4 space-y-1 sm:px-8">
              <NavItem href={animationRoute.build()} label="/animation" tag="View transitions" />
              <NavItem href={here.build()} label="/here" tag="Static route" />
              <NavItem href={there.build()} label="/there" tag="Programmatic nav" color="bg-warm/10 text-warm" />
              <NavItem href={everywhere.build()} label="/everywhere" tag="Browser unload guard" color="bg-signal-go/10 text-signal-go" />
              <NavItem href={nowhere.build()} label="/nowhere" tag="Route interception" color="bg-signal-stop/10 text-signal-stop" />
              <NavItem href={login.build()} label="/login" tag="Auth redirect" />
              <NavItem href="/?foo=bar" label="?foo=bar" tag="Search params" color="bg-warm/10 text-warm" />
            </nav>
          </Route>

          <Route path={here.path}>
            <PageFrame title="/here" subtitle="You arrived. That's the demo." />
          </Route>

          <>
            <>
              <>
                <Route path={there.path}>
                  <PageFrame title="/there" subtitle="Programmatic navigation">
                    <Programmatic />
                  </PageFrame>
                </Route>
              </>
            </>
          </>

          <Route path={animationRoute.path} wildcard>
            <div className="px-8 pt-6 pb-2 sm:px-12">
              <BackLink />
            </div>
            <ViewTransitionsExample />
          </Route>

          <Route path={everywhere.path}>
            <PageFrame title="/everywhere" subtitle="Prevents browser unload (refresh/close) while form is dirty">
              <UnloadWarn />
            </PageFrame>
          </Route>

          <Route path={nowhere.path}>
            <PageFrame title="/nowhere" subtitle="Confirm before leaving">
              <UnloadDialog />
            </PageFrame>
          </Route>

          <Route path={login.path}>
            <PageFrame title="/login" subtitle="Simulated auth gate">
              <Link href={admin.build()}>
                <a className="inline-flex px-5 py-2.5 rounded-lg bg-accent text-white text-base font-medium hover:bg-accent-dim transition-colors">
                  Authenticate &rarr;
                </a>
              </Link>
            </PageFrame>
          </Route>

          <Route path={admin.path}>
            <PageFrame title="/admin">
              <div className="flex gap-4">
                <Link href={user.build()}>
                  <a className="text-accent hover:underline">/user</a>
                </Link>
                <Link href={index.build()}>
                  <a className="text-text-dim hover:text-signal-stop transition-colors">logout</a>
                </Link>
              </div>
            </PageFrame>
          </Route>

          <>
            <Route path={user.path}>
              <PageFrame title="/user">
                <div className="flex gap-4">
                  <Link href={admin.build()}>
                    <a className="text-accent hover:underline">/admin</a>
                  </Link>
                  <Link href={index.build()}>
                    <a className="text-text-dim hover:text-signal-stop transition-colors">logout</a>
                  </Link>
                </div>
              </PageFrame>
            </Route>
          </>

          <Route path="/broken-link">
            <PageFrame title="404" subtitle="Redirecting...">
              <Redirect href={login.build()}>
                <Link href={login.build()}>
                  <a className="text-accent hover:underline">
                    click if no redirect &rarr;
                  </a>
                </Link>
              </Redirect>
            </PageFrame>
          </Route>

          <Route>
            <PageFrame title="404" subtitle="Not found">
              <Link href={index.build()}>
                <a className="text-accent hover:underline">&larr; index</a>
              </Link>
            </PageFrame>
          </Route>
        </Routes>
      </main>

      <footer className="px-8 py-5 flex items-center gap-4 text-sm text-text-dim sm:px-12">
        <Link href={index.build()}>
          <a className="hover:text-accent transition-colors">/</a>
        </Link>
        <span>&middot;</span>
        <a
          className="hover:text-accent transition-colors"
          href="https://github.com/block65/mrr"
        >
          github
        </a>
      </footer>
    </div>
  </Router>
);
