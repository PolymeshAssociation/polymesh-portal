import {
  ClaimData,
  ClaimScope,
  Claim,
} from '@polymeshassociation/polymesh-sdk/types';

export interface IClaimsContext {
  receivedClaims: ClaimData<Claim>[];
  issuedClaims: ClaimData<Claim>[];
  receivedScopes: ClaimScope[];
  issuedScopes: ClaimScope[];
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
