import {
  Claim,
  ClaimData,
  ClaimScope,
  ScopedClaim,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';

export const getScopesFromClaims = (claims: ClaimData<Claim>[]) => {
  return claims
    .map(({ claim }) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!claim.hasOwnProperty('scope')) {
        return { scope: null } as ClaimScope;
      }
      if ((claim as ScopedClaim).scope.type === ScopeType.Ticker) {
        return {
          scope: (claim as ScopedClaim).scope,
          ticker: (claim as ScopedClaim).scope.value,
        } as ClaimScope;
      }

      return { scope: (claim as ScopedClaim).scope } as ClaimScope;
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
