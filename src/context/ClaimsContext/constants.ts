import {
  ClaimData,
  Claim,
  Scope,
} from '@polymeshassociation/polymesh-sdk/types';

export interface ScopeItem {
  scope: null | Scope;
}
export interface IClaimsContext {
  receivedClaims: ClaimData<Claim>[];
  issuedClaims: ClaimData<Claim>[];
  receivedScopes: ScopeItem[];
  issuedScopes: ScopeItem[];
  claimsLoading: boolean;
  refreshClaims: () => void;
}

export const initialState = {
  receivedClaims: [],
  issuedClaims: [],
  receivedScopes: [],
  issuedScopes: [],
  claimsLoading: true,
  refreshClaims: () => {},
};
