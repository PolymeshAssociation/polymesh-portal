import { AuthorizationRequest } from '@polymeshassociation/polymesh-sdk/types';

export interface IAuthorizationsContext {
  incomingAuthorizations: AuthorizationRequest[];
  outgoingAuthorizations: AuthorizationRequest[];
  authorizationsLoading: boolean;
  refreshAuthorizations: () => void;
}

export const initialState = {
  incomingAuthorizations: [],
  outgoingAuthorizations: [],
  authorizationsLoading: true,
  refreshAuthorizations: () => {},
};
