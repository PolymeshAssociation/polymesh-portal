import { createContext } from 'react';
import { IMultiSigContext, initialState } from './constants';

const MultiSigContext = createContext<IMultiSigContext>(initialState);

export default MultiSigContext;
