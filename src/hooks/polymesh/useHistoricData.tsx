import { useContext, useState, useEffect } from 'react';
import {
  ExtrinsicData,
  HistoricInstruction,
} from '@polymeshassociation/polymesh-sdk/types';
import { AccountContext } from '~/context/AccountContext';

const useHistoricData = () => {
  const { account, selectedAccount } = useContext(AccountContext);
  const [extrinsicHistory, setExtrisicHistory] = useState<ExtrinsicData[]>([]);
  const [instructionsHistory, setInstructionsHistory] = useState<
    HistoricInstruction[]
  >([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // Get all extrinsics and instructions history for current account
  useEffect(() => {
    if (!account || !selectedAccount) return;

    (async () => {
      try {
        setDataLoading(true);

        const { data } = await account.getTransactionHistoryV2();

        setExtrisicHistory(data);

        const identity = await account.getIdentity();
        if (!identity) return;

        const instructions = await identity.getHistoricalInstructions();

        setInstructionsHistory(instructions);
      } catch (error) {
        setDataError((error as Error).message);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [account, selectedAccount]);

  return { extrinsicHistory, instructionsHistory, dataLoading, dataError };
};

export default useHistoricData;
