import {
  ExtrinsicData,
  HistoricInstruction,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';

const useHistoricData = () => {
  const {
    api: { sdk },
    state: { selectedAccount },
  } = useContext(PolymeshContext);
  const [extrinsicHistory, setExtrisicHistory] = useState<ExtrinsicData[]>([]);
  const [instructionsHistory, setInstructionsHistory] = useState<
    HistoricInstruction[]
  >([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // Get all extrinsics and instructions history for current account
  useEffect(() => {
    if (!selectedAccount) return;

    (async () => {
      try {
        setDataLoading(true);
        const account = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });
        if (!account) return;

        const { data } = await account.getTransactionHistoryV2();

        setExtrisicHistory(data);

        const identity = await account.getIdentity();
        if (!identity) return;

        const instructions = await identity.getHistoricalInstructions();

        setInstructionsHistory(instructions);
      } catch (error: Error) {
        setDataError(error.message);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [sdk, selectedAccount]);

  return { extrinsicHistory, instructionsHistory, dataLoading, dataError };
};

export default useHistoricData;
