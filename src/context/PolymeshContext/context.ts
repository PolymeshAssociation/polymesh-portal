import { createContext } from 'react';
import { IPolymeshContext, initialState } from './constants';

const PolymeshContext = createContext<IPolymeshContext>(initialState);

export default PolymeshContext;
