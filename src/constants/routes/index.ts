import { lazy, ReactElement } from 'react';
import { TIcons } from '~/assets/icons/types';

const NotFound = lazy(() => import('~/layouts/NotFound'));
const Landing = lazy(() => import('~/layouts/Landing'));
const Overview = lazy(() => import('~/layouts/Overview'));
const Portfolio = lazy(() => import('~/layouts/Portfolio'));
const Authorizations = lazy(() => import('~/layouts/Authorizations'));
const Transfers = lazy(() => import('~/layouts/Transfers'));
const MultiSig = lazy(() => import('~/layouts/MultiSig'));
const Claims = lazy(() => import('~/layouts/Claims'));
const Distributions = lazy(() => import('~/layouts/Distributions'));
const Settings = lazy(() => import('~/layouts/Settings'));
const Staking = lazy(() => import('~/layouts/Staking'));
interface IRoute {
  path: string;
  label: string | null;
  component: React.LazyExoticComponent<() => ReactElement>;
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
  MULTISIG: '/multisig',
  AUTHORIZATIONS: '/authorizations',
  CLAIMS: '/claims',
  DISTRIBUTIONS: '/distributions',
  SETTINGS: '/settings',
  STAKING: '/staking',
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
    path: PATHS.MULTISIG,
    label: 'MultiSig',
    component: MultiSig,
  },
  {
    path: PATHS.CLAIMS,
    label: 'Claims',
    component: Claims,
  },
  {
    path: PATHS.DISTRIBUTIONS,
    label: 'Capital Distributions',
    component: Distributions,
  },
  {
    path: PATHS.STAKING,
    label: 'Staking',
    component: Staking,
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
  {
    path: PATHS.STAKING,
    label: 'Staking',
    icon: 'StakingIcon',
    disabled: false,
  },
  { path: PATHS.PORTFOLIO, label: 'Portfolio', icon: 'PortfolioIcon' },
  {
    path: PATHS.TRANSFERS,
    label: 'Transfers',
    icon: 'TransfersIcon',
    notifications: 'instructions',
  },
  {
    path: PATHS.MULTISIG,
    label: 'MultiSig',
    icon: 'MultisigIcon',
    notifications: 'proposals',
  },
  {
    path: PATHS.AUTHORIZATIONS,
    label: 'Authorizations',
    icon: 'AuthorizationsIcon',
    notifications: 'authorizations',
  },
  { path: PATHS.CLAIMS, label: 'Claims', icon: 'ClaimsIcon' },
  {
    path: PATHS.DISTRIBUTIONS,
    label: 'Distributions',
    icon: 'Bank',
    notifications: 'distributions',
  },
  {
    path: '',
    label: 'Resources',
    icon: 'ResourcesIcon',
    expandable: true,
    nestedLinks: [
      {
        nestedPath: import.meta.env.VITE_SUBSCAN_URL,
        nestedLabel: 'SubScan',
        nestedIcon: 'SubscanIcon',
      },
      {
        nestedPath: import.meta.env.VITE_POLKASSEMBLY_URL,
        nestedLabel: 'Governance',
        nestedIcon: 'PolkassemblyIcon',
      },
      {
        nestedPath: import.meta.env.VITE_DEVELOPER_APP_URL,
        nestedLabel: 'Developer App',
        nestedIcon: 'DeveloperIcon',
      },
      {
        nestedPath: import.meta.env.VITE_TOKENSTUDIO_URL,
        nestedLabel: 'Token Studio',
        nestedIcon: 'PolymathLogo',
      },
    ],
  },
  { path: PATHS.SETTINGS, label: 'Settings', icon: 'SettingsIcon' },
] as INavLink[];
