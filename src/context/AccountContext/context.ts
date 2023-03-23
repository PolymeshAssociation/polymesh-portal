import { createContext } from 'react';
import { IAccountContext, initialState } from './constants';

const AccountContext = createContext<IAccountContext>(initialState);

export default AccountContext;
