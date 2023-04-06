import { createContext } from 'react';
import { IAuthorizationsContext, initialState } from './constants';

const AuthorizationsContext =
  createContext<IAuthorizationsContext>(initialState);

export default AuthorizationsContext;
