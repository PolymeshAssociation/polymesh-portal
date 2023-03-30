import { EAuthorizationDirections } from '../../constants';

export const TABS = [
  {
    label: EAuthorizationDirections.INCOMING,
    searchParam: { direction: EAuthorizationDirections.INCOMING },
  },
  {
    label: EAuthorizationDirections.OUTGOING,
    searchParam: { direction: EAuthorizationDirections.OUTGOING },
  },
];
