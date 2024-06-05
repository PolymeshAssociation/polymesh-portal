import { createContext } from 'react';
import { IAuthContext, initialState } from './constants';

const AuthContext = createContext<IAuthContext>(initialState);

export default AuthContext;
