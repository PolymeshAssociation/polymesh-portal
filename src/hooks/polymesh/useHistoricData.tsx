import { useContext, useState, useEffect } from 'react';
import {
  ExtrinsicData,
  ExtrinsicsOrderBy,
  HistoricInstruction,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { AccountContext } from '~/context/AccountContext';

interface IPaginationState {
  pageIndex: number;
  pageSize: number;
}

const useHistoricData = ({ pageIndex, pageSize }: IPaginationState) => {
  const { account, selectedAccount } = useContext(AccountContext);
  const [extrinsicHistory, setExtrisicHistory] = useState<ExtrinsicData[]>([]);
  const [extrinsicCount, setExtrinsicCount] = useState(0);
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

        const { data, count } = await account.getTransactionHistoryV2({
          orderBy: ExtrinsicsOrderBy.CreatedAtDesc,
          size: new BigNumber(pageSize),
          start: new BigNumber(pageIndex * pageSize),
        });

        setExtrisicHistory(data);
        if (count) {
          setExtrinsicCount(count.toNumber());
        }

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
  }, [account, selectedAccount, pageIndex, pageSize]);

  return {
    extrinsicHistory,
    extrinsicCount,
    instructionsHistory,
    dataLoading,
    dataError,
  };
};

export default useHistoricData;
