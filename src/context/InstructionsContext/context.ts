import { createContext } from 'react';
import { IInstructionsContext, initialState } from './constants';

const InstructionsContext = createContext<IInstructionsContext>(initialState);

export default InstructionsContext;
