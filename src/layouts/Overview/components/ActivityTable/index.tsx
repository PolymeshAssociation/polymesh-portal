import { useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useHistoricData, useAccountIdentity } from '~/hooks/polymesh';
import { Table } from '~/components';
import { useActivityTable } from './config';
import { EActivityTableTabs } from './constants';
import { toParsedDateTime } from '~/helpers/dateTime';
import { getAssetTransferEvents } from '~/constants/queries';
import { formatDid } from '~/helpers/formatters';

export const ActivityTable = () => {
  const [tab, setTab] = useState(EActivityTableTabs.HISTORICAL_ACTIVITY);
  const { table, setTableData } = useActivityTable(tab);
  const {
    state: { connecting, selectedAccount },
  } = useContext(PolymeshContext);
  const { extrinsicHistory, dataLoading } = useHistoricData();
  const { identity } = useAccountIdentity();
  const { loading, error, data } = useQuery(getAssetTransferEvents, {
    variables: { did: identity?.did || '' },
  });

  useEffect(() => {
    if (connecting || dataLoading || loading || error) return;

    switch (tab) {
      case EActivityTableTabs.HISTORICAL_ACTIVITY: {
        const parsedData = extrinsicHistory
          .map(({ blockNumber, extrinsicIdx, success, txTag }) => ({
            extrinsicIdx: extrinsicIdx.toString(),
            blockNumber: blockNumber.toString(),
            module: txTag.split('.')[0],
            call: txTag.split('.')[1],
            success,
          }))
          .reverse();

        setTableData(parsedData);
        break;
      }

      case EActivityTableTabs.TOKEN_ACTIVITY: {
        const parsedData = data.events.nodes.map(
          ({ id, blockId, extrinsicIdx, createdAt, attributes }) => {
            const [
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              { value: caller },
              { value: asset },
              { value: from },
              { value: to },
              { value: amount },
            ] = attributes;
            return {
              id: { eventId: id.replace('/', '-'), blockId, extrinsicIdx },
              dateTime: toParsedDateTime(createdAt),
              from: formatDid(from.did),
              to: formatDid(to.did),
              amount: balanceToBigNumber(amount).toString(),
              asset,
            };
          },
        );

        setTableData(parsedData);
        break;
      }

      default:
        break;
    }
  }, [
    connecting,
    data,
    dataLoading,
    error,
    extrinsicHistory,
    loading,
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
