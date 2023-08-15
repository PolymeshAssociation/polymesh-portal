import { createContext } from 'react';
import { initialState, IStakingContext } from './constants';

const StakingContext = createContext<IStakingContext>(initialState);

export default StakingContext;
