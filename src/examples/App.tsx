// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Block,
  DesignSystem,
  Divider,
  Heading,
  Inline,
  Text,
  TextLink,
  interFontThemeClassName,
} from '@block65/react-design-system';
import { type FC } from 'react';
import { Link, Redirect, Route, Router, Routes } from '../index.js';
import { Programmatic } from './Programmatic.js';
import { UnloadDialog } from './UnloadDialog.js';
import { UnloadWarn } from './UnloadWarn.js';
import {
  admin,
  everywhere,
  here,
  index,
  login,
  nowhere,
  there,
  user,
} from './paths.js';

export const App: FC = () => (
  <DesignSystem
    className={[interFontThemeClassName]}
    style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    }}
  >
    <Block padding="7">
      <Router>
        <Routes>
          <Route path={index.path}>
            <Heading level="1">I present to you, a menu!</Heading>
            <Text>
              <Link href={here.build()}>
                <TextLink>go here!</TextLink>
              </Link>
            </Text>
            <Text>
              <Link href={there.build()}>
                <TextLink>there</TextLink>
              </Link>
            </Text>
            <Text>
              <Link href={everywhere.build()}>
                <TextLink>everywhere</TextLink>
              </Link>
            </Text>
            <Text>
              <Link href={nowhere.build()}>
                <TextLink>nowhere</TextLink>
              </Link>
            </Text>
            <Text>
              <Link
                href={{
                  searchParams: new URLSearchParams({ foo: 'bar' }),
                }}
              >
                <TextLink>foo must equal bar</TextLink>
              </Link>
            </Text>
          </Route>
          <>
            <>
              <>
                <Route path={there.path}>
                  <Programmatic />
                </Route>
              </>
            </>
          </>
          <Route path={everywhere.path}>
            <UnloadWarn />
          </Route>
          <Route path={nowhere.path}>
            <UnloadDialog />
          </Route>
          <Route path={login.path}>
            <Text>press ok when logged in</Text>
            <Link href={admin.build()}>
              <TextLink>ok</TextLink>
            </Link>
          </Route>
          <Route path={admin.path}>
            <Heading>admin</Heading>
            <Link href={user.build()}>
              <TextLink>user</TextLink>
            </Link>
            |
            <Link href={index.build()}>
              <TextLink>logout</TextLink>
            </Link>
          </Route>
          <>
            <Route path={user.path}>
              <Heading>user</Heading>
              <Inline>
                <Link href={admin.build()}>
                  <TextLink>admin</TextLink>
                </Link>
                |
                <Link href={index.build()}>
                  <TextLink>logout</TextLink>
                </Link>
              </Inline>
            </Route>
          </>
          <Route path="/broken-link">
            <Heading>404 soz</Heading>
            <Redirect href={login.build()}>
              <Link href={login.build()}>
                <TextLink>click here if no redirect</TextLink>
              </Link>
            </Redirect>
          </Route>
          <Route>
            <Heading>404 soz</Heading>
            <Link href={login.build()}>
              <TextLink>login?</TextLink>
            </Link>
          </Route>
        </Routes>
      </Router>
      <Divider />
      <Inline>
        <TextLink href={index.build()}>Index</TextLink>|
        <TextLink href="https://www.google.com">Google</TextLink>
      </Inline>
    </Block>
  </DesignSystem>
);
