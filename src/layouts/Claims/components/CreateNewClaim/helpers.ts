import {
  ClaimTarget,
  ClaimType,
  CountryCode,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import { IFieldValues, ISelectedClaimItem } from './constants';
import { uuidToHex } from '~/helpers/formatters';

export const createPlaceholderByScopeType = (type: ScopeType) => {
  switch (type) {
    case ScopeType.Asset:
      return 'Enter Asset ID or Ticker';

    case ScopeType.Ticker:
      return 'Enter Ticker';

    case ScopeType.Identity:
      return 'Enter DID';

    case ScopeType.Custom:
      return 'Enter custom value';

    default:
      return '';
  }
};

const getFormattedScopeValue = (scopeType: ScopeType, scopeValue: string) => {
  return scopeType === ScopeType.Asset ? uuidToHex(scopeValue) : scopeValue;
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
              value: getFormattedScopeValue(scopeType, scopeValue),
            },
          }
        : {
            type: claimType,
            scope: {
              type: scopeType,
              value: getFormattedScopeValue(scopeType, scopeValue),
            },
          },
  })) as ClaimTarget[];
};
