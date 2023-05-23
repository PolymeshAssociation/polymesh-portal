import { createContext } from 'react';
import { IDistributionsContext, initialState } from './constants';

const DistributionsContext = createContext<IDistributionsContext>(initialState);

export default DistributionsContext;
