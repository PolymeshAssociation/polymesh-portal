import { createContext } from 'react';
import { IPolymeshContext } from './constants';

const PolymeshContext = createContext<IPolymeshContext>('');

export default PolymeshContext;
