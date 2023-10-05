import { useContext } from 'react';
import MultiSigContext from './context';

export { default as MultiSigProvider } from './provider';

export const useMultiSigContext = () => useContext(MultiSigContext);
