import { useContext } from 'react';
import TransactionStatusContext from './context';

export { default as TransactionStatusProvider } from './provider';

export const useTransactionStatusContext = () =>
  useContext(TransactionStatusContext);
