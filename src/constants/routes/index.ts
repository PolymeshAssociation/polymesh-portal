import { lazy } from 'react';
import { TIcons } from '~/assets/icons/types';

const NotFound = lazy(() => import('~/layouts/NotFound'));
const Landing = lazy(() => import('~/layouts/Landing'));
const Overview = lazy(() => import('~/layouts/Overview'));
const Portfolio = lazy(() => import('~/layouts/Portfolio'));
const Authorizations = lazy(() => import('~/layouts/Authorizations'));
const Transfers = lazy(() => import('~/layouts/Transfers'));

const Claims = lazy(() => import('~/layouts/Claims'));

const Settings = lazy(() => import('~/layouts/Settings'));

interface IRoute {
  path: string;
  label: string | null;
  component: React.LazyExoticComponent<() => JSX.Element>;
}

interface INavLink {
  path: string;
  label: string;
  icon: TIcons;
  notifications?: 'instructions' | 'authorizations';
  expandable?: boolean;
  disabled?: boolean;
  nestedLinks?: {
    nestedPath: string;
    nestedLabel: string;
    nestedIcon: TIcons;
  }[];
}

export const PATHS = {
  LANDING_PAGE: '/',
  OVERVIEW: '/overview',
  PORTFOLIO: '/portfolio',
  TRANSFERS: '/transfers',
  AUTHORIZATIONS: '/authorizations',
  CLAIMS: '/claims',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
};

export const ROUTES = [
  {
    path: PATHS.LANDING_PAGE,
    label: null,
    component: Landing,
  },
  {
    path: PATHS.OVERVIEW,
    label: 'Overview',
    component: Overview,
  },
  {
    path: PATHS.PORTFOLIO,
    label: 'Portfolio',
    component: Portfolio,
  },
  {
    path: PATHS.AUTHORIZATIONS,
    label: 'Authorizations',
    component: Authorizations,
  },
  { path: PATHS.SETTINGS, label: 'Settings', component: Settings },
  {
    path: PATHS.TRANSFERS,
    label: 'Transfers',
    component: Transfers,
  },
  {
    path: PATHS.CLAIMS,
    label: 'Claims',
    component: Claims,
  },
  {
    path: PATHS.NOT_FOUND,
    label: null,
    component: NotFound,
  },
] as IRoute[];

export const NAV_LINKS = [
  {
    path: PATHS.OVERVIEW,
    label: 'Overview',
    icon: 'OverviewIcon',
  },
  { path: PATHS.PORTFOLIO, label: 'Portfolio', icon: 'PortfolioIcon' },
  {
    path: PATHS.TRANSFERS,
    label: 'Transfers',
    icon: 'TransfersIcon',
    notifications: 'instructions',
  },
  {
    path: PATHS.AUTHORIZATIONS,
    label: 'Authorizations',
    icon: 'AuthorizationsIcon',
    notifications: 'authorizations',
  },
  { path: PATHS.CLAIMS, label: 'Claims', icon: 'ClaimsIcon' },
  { path: '', label: 'Staking', icon: 'StakingIcon', disabled: true },
  {
    path: '',
    label: 'Resources',
    icon: 'ResourcesIcon',
    expandable: true,
    nestedLinks: [
      {
        nestedPath: '/',
        nestedLabel: 'SubScan',
        nestedIcon: 'SubscanIcon',
      },
      {
        nestedPath: '/',
        nestedLabel: 'Polkassembly',
        nestedIcon: 'PolkassemblyIcon',
      },
      {
        nestedPath: '/',
        nestedLabel: 'Bridge',
        nestedIcon: 'BridgeIcon',
      },
      {
        nestedPath: '/',
        nestedLabel: 'Developer App',
        nestedIcon: 'DeveloperIcon',
      },
      {
        nestedPath: '/',
        nestedLabel: 'Governance',
        nestedIcon: 'GovernanceIcon',
      },
    ],
  },
  { path: PATHS.SETTINGS, label: 'Settings', icon: 'SettingsIcon' },
] as INavLink[];
