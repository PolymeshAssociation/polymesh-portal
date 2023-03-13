import { useContext, useEffect, useState } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useHistoricData } from '~/hooks/polymesh';
import { Table } from '~/components';
import { useActivityTable } from './config';
import { EActivityTableTabs } from './constants';

export const ActivityTable = () => {
  const [tab, setTab] = useState(EActivityTableTabs.HISTORICAL_ACTIVITY);
  const { table, setTableData } = useActivityTable(tab);
  const {
    state: { connecting, selectedAccount },
  } = useContext(PolymeshContext);
  const { extrinsicHistory, instructionsHistory, dataLoading } =
    useHistoricData();

  useEffect(() => {
    if (connecting || dataLoading) return;

    switch (tab) {
      case EActivityTableTabs.HISTORICAL_ACTIVITY: {
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
        break;
      }

      case EActivityTableTabs.TOKEN_ACTIVITY: {
        const parsedData = instructionsHistory.map(
          ({ id, blockNumber, legs, venueId }) => ({
            id: id.toString(),
            blockNumber: blockNumber.toString(),
            legs: legs.toString(),
            venueId: venueId.toString(),
          }),
        );

        setTableData(parsedData);
        break;
      }

      default:
        break;
    }
  }, [
    connecting,
    dataLoading,
    extrinsicHistory,
    instructionsHistory,
    selectedAccount,
    setTableData,
    tab,
  ]);

  return (
    <Table
      data={{ table, tab }}
      tabs={Object.values(EActivityTableTabs)}
      setTab={setTab}
      title="Activity"
      loading={connecting || dataLoading}
    />
  );
};
