import {
  ClaimTarget,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import { IFieldValues, ISelectedClaimItem } from './constants';

export const createPlaceholderByScopeType = (type: ScopeType) => {
  switch (type) {
    case ScopeType.Ticker:
      return 'Enter Ticker';

    case ScopeType.Identity:
      return 'Ender DID';

    case ScopeType.Custom:
      return 'Ender custom value';

    default:
      return '';
  }
};

export const createClaimsData = ({
  data: { target, scopeType, scopeValue },
  selectedClaims,
}: {
  data: IFieldValues;
  selectedClaims: ISelectedClaimItem[];
}) => {
  return selectedClaims.map(({ claimType, expiry }) => ({
    target,
    expiry,
    claim: {
      type: claimType,
      scope: {
        type: scopeType,
        value: scopeValue,
      },
    },
  })) as ClaimTarget[];
};
