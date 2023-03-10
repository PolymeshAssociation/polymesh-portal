import { useContext, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useHistoricData } from '~/hooks/polymesh';
import { Table } from '~/components';
import { useActivityTable } from './config';

export const ActivityTable = () => {
  const { table, setTableData } = useActivityTable([]);
  const {
    state: { connecting, selectedAccount },
  } = useContext(PolymeshContext);
  const { extrinsicHistory, dataLoading } = useHistoricData();

  useEffect(() => {
    if (connecting || dataLoading) return;

    const parsedData = extrinsicHistory.map(
      ({ blockNumber, extrinsicIdx, success, txTag }) => ({
        extrinsicIdx: extrinsicIdx.toString(),
        blockNumber: blockNumber.toString(),
        module: txTag.split('.')[0],
        call: txTag.split('.')[1],
        success,
      }),
    );

    setTableData(parsedData);
  }, [
    connecting,
    dataLoading,
    extrinsicHistory,
    selectedAccount,
    setTableData,
  ]);

  return (
    <Table table={table} title="Activity" loading={connecting || dataLoading} />
  );
};
