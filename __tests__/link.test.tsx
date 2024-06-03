import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import type { AnchorHTMLAttributes, FC, PropsWithChildren } from 'react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { expect, test } from 'vitest';
import { Link, Router } from '../src/index.js';
import { namedRoute } from '../src/named-route.js';

const ComponentThatTakesProps: FC<
  PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>
> = (props) => <a data-linkylink {...props} />;

const ComponentThatIgnoresProps: FC<PropsWithChildren> = ({ children }) => (
  <>{children}</>
);

test('basic', async () => {
  const login = namedRoute('/login');

  const { asFragment } = render(
    <IntlProvider locale="en" onError={() => {}}>
      <Router>
        <Link href={login.build()}>test as string</Link>
        <Link href={login.build()}>
          <>test as fragment</>
        </Link>
        <Link href={login.build()}>
          <ComponentThatTakesProps>
            this text should be in a component that has a href
          </ComponentThatTakesProps>
        </Link>

        <Link href={login.build()}>
          <FormattedMessage
            description="broken"
            defaultMessage="this text will not be in a component that has a href :sadface:"
          />
        </Link>

        <Link href={login.build()}>
          <a id="123">This anchor should have a href!</a>
        </Link>

        <Link href={login.build()}>
          <ComponentThatIgnoresProps>
            this text will not be in a component that has a href :sadface:
          </ComponentThatIgnoresProps>
        </Link>

        <Link href="https://invalid.example.com">cross origin link</Link>
      </Router>
    </IntlProvider>,
  );

  expect(asFragment()).toMatchSnapshot();
});
