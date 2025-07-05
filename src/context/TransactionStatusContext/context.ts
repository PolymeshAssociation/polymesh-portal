import { createContext } from 'react';
import { ITransactionStatusContext, initialState } from './constants';

const TransactionStatusContext =
  createContext<ITransactionStatusContext>(initialState);

export default TransactionStatusContext;
