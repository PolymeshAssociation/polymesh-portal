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
const AssetManager = lazy(() => import('~/layouts/AssetManager'));
const CreateAsset = lazy(
  () => import('~/layouts/AssetManager/components/CreateAssetWizard/index'),
);
const AssetView = lazy(
  () => import('~/layouts/AssetManager/components/AssetView'),
);

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
  ASSET_MANAGER: '/asset-manager',
  CREATE_ASSET: '/asset-manager/create-asset',
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
    path: PATHS.ASSET_MANAGER,
    label: 'Asset Manager',
    component: AssetManager,
  },
  {
    path: PATHS.CREATE_ASSET,
    label: 'Create Asset',
    component: CreateAsset,
  },
  {
    path: `${PATHS.ASSET_MANAGER}/:assetId`,
    label: null,
    component: AssetView,
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
    path: PATHS.ASSET_MANAGER,
    label: 'Asset Manager',
    icon: 'Coins',
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
      {
        nestedPath: 'https://polymesh.protofire.io/',
        nestedLabel: 'Asset Explorer',
        nestedIcon: 'ExplorerIcon',
      },
    ],
  },
  { path: PATHS.SETTINGS, label: 'Settings', icon: 'SettingsIcon' },
] as INavLink[];
