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

  if (sortBy === EClaimSortOptions.EXPIRY_DATE) {
    const noExpiryClaims = filteredClaims.filter(({ expiry }) => !expiry);
    const claimsWithExpiry = filteredClaims.filter(({ expiry }) => expiry);

    return [
      ...claimsWithExpiry.sort(
        (a, b) =>
          (a.expiry as Date).getMilliseconds() -
          (b.expiry as Date).getMilliseconds(),
      ),
      ...noExpiryClaims,
    ];
  }

  return filteredClaims.sort(
    (a, b) => a.issuedAt.getMilliseconds() - b.issuedAt.getMilliseconds(),
  );
};
