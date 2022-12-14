import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import type { LinkChildProps } from '../lib/components/Link.js';
import { namedRoute } from '../lib/named-route.js';
import { Link, Router } from '../src/index.js';

const ComponentThatTakesProps: FC<PropsWithChildren<LinkChildProps>> = (
  props,
) => <a data-linkylink {...props} />;

const ComponentThatIgnoresProps: FC<PropsWithChildren> = ({ children }) => (
  <>{children}</>
);

test('basic', async () => {
  const login = namedRoute('/login');

  const { asFragment } = render(
    <IntlProvider locale="en" onError={() => {}}>
      <Router>
        <Link dest={login.build()}>test as string</Link>
        <Link dest={login.build()}>
          <>test as fragment</>
        </Link>
        <Link dest={login.build()}>
          <ComponentThatTakesProps>
            this text should be in a component that has a href
          </ComponentThatTakesProps>
        </Link>

        <Link dest={login.build()}>
          <FormattedMessage
            id="broken"
            description="broken"
            defaultMessage="this text will not be in a component that has a href :sadface:"
          />
        </Link>

        <Link dest={login.build()}>
          <a id="123">This anchor should have a href!</a>
        </Link>

        <Link dest={login.build()}>
          <ComponentThatIgnoresProps>
            this text will not be in a component that has a href :sadface:
          </ComponentThatIgnoresProps>
        </Link>

        <Link dest="https://invalid.example.com">cross origin link</Link>
      </Router>
    </IntlProvider>,
  );

  expect(asFragment()).toMatchSnapshot();
});
