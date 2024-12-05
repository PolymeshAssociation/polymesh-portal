import {
  ClaimTarget,
  ClaimType,
  CountryCode,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import { IFieldValues, ISelectedClaimItem } from './constants';

export const createPlaceholderByScopeType = (type: ScopeType) => {
  switch (type) {
    case ScopeType.Asset:
      return 'Enter Asset ID or Ticker';

    case ScopeType.Identity:
      return 'Enter DID';

    case ScopeType.Custom:
      return 'Enter custom value';

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
  return selectedClaims.map(({ claimType, expiry, code }) => ({
    target,
    expiry,
    claim:
      claimType === ClaimType.Jurisdiction
        ? {
            type: claimType,
            code: code as CountryCode,
            scope: {
              type: scopeType,
              value: scopeValue,
            },
          }
        : {
            type: claimType,
            scope: {
              type: scopeType,
              value: scopeValue,
            },
          },
  })) as ClaimTarget[];
};
