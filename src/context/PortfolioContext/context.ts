import { createContext } from 'react';
import { initialState, IPortfolioContext } from './constants';

const PortfolioContext = createContext<IPortfolioContext>(initialState);

export default PortfolioContext;
