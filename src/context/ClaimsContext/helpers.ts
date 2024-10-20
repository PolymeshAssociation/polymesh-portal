import {
  Claim,
  ClaimData,
  ScopedClaim,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import { ScopeItem } from './constants';

export const getScopesFromClaims = (
  claims: ClaimData<Claim>[],
): ScopeItem[] => {
  return claims
    .map(({ claim }) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!claim.hasOwnProperty('scope')) {
        return { scope: null };
      }
      if ((claim as ScopedClaim).scope.type === ScopeType.Asset) {
        return {
          scope: (claim as ScopedClaim).scope,
        };
      }

      return { scope: (claim as ScopedClaim).scope };
    })
    .filter(
      (scopeItem, idx, array) =>
        idx ===
        array.findIndex(
          (t) =>
            t.scope?.value === scopeItem.scope?.value &&
            t.scope?.type === scopeItem.scope?.type,
        ),
    )
    .sort((a, b) => {
      if (!a.scope || !b.scope) {
        return -1;
      }
      return a.scope.value.localeCompare(b.scope.value);
    });
};
