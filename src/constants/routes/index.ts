import { lazy } from 'react';

const NotFound = lazy(() => import('~/layouts/NotFound'));
const Landing = lazy(() => import('~/layouts/Landing'));
const Overview = lazy(() => import('~/layouts/Overview'));

interface IRoute {
  path: string;
  label: string | null;
  component: React.LazyExoticComponent<() => JSX.Element>;
}

export const PATHS = {
  LANDING_PAGE: '/',
  OVERVIEW: '/overview',
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
    path: PATHS.NOT_FOUND,
    label: null,
    component: NotFound,
  },
] as IRoute[];
