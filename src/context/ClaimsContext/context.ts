import { createContext } from 'react';
import { IClaimsContext, initialState } from './constants';

const ClaimsContext = createContext<IClaimsContext>(initialState);

export default ClaimsContext;
