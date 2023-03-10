import { ExtrinsicData } from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';

const useHistoricData = () => {
  const {
    api: { sdk },
    state: { selectedAccount },
  } = useContext(PolymeshContext);
  const [extrinsicHistory, setExtrisicHistory] = useState<ExtrinsicData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // Get all extrinsics history for current account
  useEffect(() => {
    if (!selectedAccount) return;

    (async () => {
      try {
        setDataLoading(true);
        const account = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });
        if (!account) return;

        const { data, count } = await account.getTransactionHistoryV2();

        setExtrisicHistory(data);
        setTotalCount(count?.toNumber() || 0);
      } catch (error: Error) {
        setDataError(error.message);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [sdk, selectedAccount]);

  return { extrinsicHistory, totalCount, dataLoading, dataError };
};

export default useHistoricData;
