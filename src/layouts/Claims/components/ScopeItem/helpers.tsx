import {
  Claim,
  ClaimData,
  ScopedClaim,
} from '@polymeshassociation/polymesh-sdk/types';
import { ScopeItem } from '~/context/ClaimsContext/constants';
import { EClaimSortOptions } from '../../constants';

// Type guard to check if a claim is a ScopedClaim
const isScopedClaim = (claim: Claim): claim is ScopedClaim => {
  return 'scope' in claim && claim.scope !== undefined && claim.scope !== null;
};

export const filterClaimsByScope = (
  claims: ClaimData<Claim>[],
  scopeItem: ScopeItem,
  sortBy: EClaimSortOptions,
) => {
  const { scope } = scopeItem;

  let filteredClaims: ClaimData<Claim>[];

  if (scope) {
    filteredClaims = claims
      .filter(({ claim }) => isScopedClaim(claim))
      .filter(({ claim }) => {
        const scopedClaim = claim as ScopedClaim;
        return (
          scopedClaim.scope.type === scope.type &&
          scopedClaim.scope.value === scope.value
        );
      });
  } else {
    filteredClaims = claims.filter(({ claim }) => !isScopedClaim(claim));
  }

  if (sortBy === EClaimSortOptions.EXPIRY_DATE) {
    const noExpiryClaims = filteredClaims.filter(({ expiry }) => !expiry);
    const claimsWithExpiry = filteredClaims.filter(({ expiry }) => expiry);

    return [
      ...claimsWithExpiry.sort(
        (a, b) => (a.expiry as Date).getTime() - (b.expiry as Date).getTime(),
      ),
      ...noExpiryClaims,
    ];
  }

  return filteredClaims.sort(
    (a, b) => a.issuedAt.getTime() - b.issuedAt.getTime(),
  );
};
