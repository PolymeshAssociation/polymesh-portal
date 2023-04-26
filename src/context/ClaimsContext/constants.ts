import {
  ClaimData,
  ClaimScope,
  Claim,
} from '@polymeshassociation/polymesh-sdk/types';

export interface IClaimsContext {
  scopeOptions: ClaimScope[];
  receivedClaims: ClaimData<Claim>[];
  issuedClaims: ClaimData<Claim>[];
  claimsLoading: boolean;
  refreshClaims: () => void;
}

export const initialState = {
  scopeOptions: [],
  receivedClaims: [],
  issuedClaims: [],
  claimsLoading: true,
  refreshClaims: () => {},
};
