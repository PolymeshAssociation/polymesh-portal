/* eslint-disable no-prototype-builtins */
import {
  Claim,
  ClaimData,
  Scope,
  ScopedClaim,
} from '@polymeshassociation/polymesh-sdk/types';
import { EClaimSortOptions } from '../../constants';

export const filterClaimsByScope = (
  claims: ClaimData<Claim>[],
  scope: Scope | null,
  sortBy: EClaimSortOptions,
) => {
  const filteredClaims = scope
    ? claims
        .filter(({ claim }) => claim.hasOwnProperty('scope'))
        .filter(
          ({ claim }) =>
            (claim as ScopedClaim).scope.type === scope.type &&
            (claim as ScopedClaim).scope.value === scope.value,
        )
    : claims.filter(({ claim }) => !claim.hasOwnProperty('scope'));
  return filteredClaims.sort((a, b) => {
    switch (sortBy) {
      case EClaimSortOptions.EXPIRY_DATE:
        if (!a.expiry || !b.expiry) return -1;
        return b.expiry.getMilliseconds() - a.expiry.getMilliseconds();

      case EClaimSortOptions.ISSUE_DATE:
        if (!a.expiry || !b.expiry) return -1;
        return b.issuedAt.getMilliseconds() - a.issuedAt.getMilliseconds();

      default:
        return 0;
    }
  });
};
