import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import type { AnchorHTMLAttributes, FC, PropsWithChildren } from 'react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { namedRoute } from '../lib/named-route.js';
import { Link, Router, useLocation } from '../src/index.js';

export const LocationDisplay = () => {
  const [location] = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
};

const LinkyLink: FC<
  PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>
> = (props) => <span data-linkylink {...props} />;

const CompyComp: FC<PropsWithChildren> = ({ children, ...props }) => (
  <div data-compycomp {...props}>
    {children}
  </div>
);

const BrokeyBroke: FC<PropsWithChildren> = ({ children }) => <>{children}</>;

test('basic', async () => {
  const login = namedRoute('/login');

  const { asFragment } = render(
    <IntlProvider locale="en" onError={() => {}}>
      <Router origin="https://www.example.com">
        <Link dest={login.build()}>test as string</Link>
        <Link dest="https://invalid.example.com">cross origin link</Link>
        <Link dest={login.build()}>
          <>test as fragment</>
        </Link>
        <Link dest={login.build()}>
          <LinkyLink>test nested in an FC</LinkyLink>
        </Link>
        <Link dest={login.build()}>
          <FormattedMessage
            id="broken"
            description="this will not work properly"
            defaultMessage="this will not work properly"
          />
        </Link>

        <Link dest={login.build()}>plnk plonk</Link>

        <Link dest={login.build()}>
          <a id="123">Hello!</a>
        </Link>

        <Link dest={login.build()}>
          <CompyComp>
            Once
            <CompyComp>
              Twice
              <CompyComp>Three times a lady</CompyComp>
            </CompyComp>
          </CompyComp>
        </Link>
        <Link dest={login.build()}>
          <BrokeyBroke>this will also not work properly</BrokeyBroke>
        </Link>
      </Router>
      ,
    </IntlProvider>,
  );

  expect(asFragment()).toMatchSnapshot();
});
