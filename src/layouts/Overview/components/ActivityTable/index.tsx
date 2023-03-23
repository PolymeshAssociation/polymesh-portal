import { useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { useHistoricData } from '~/hooks/polymesh';
import { Table } from '~/components';
import { useActivityTable } from './config';
import { EActivityTableTabs } from './constants';
import { toParsedDateTime } from '~/helpers/dateTime';
import { getAssetTransferEvents } from '~/constants/queries';
import { IAddress, ITransferEvent } from '~/constants/queries/types';
import { getExtrinsicTime } from '~/helpers/graphqlQueries';

export const ActivityTable = () => {
  const [tab, setTab] = useState<`${EActivityTableTabs}`>(
    EActivityTableTabs.HISTORICAL_ACTIVITY,
  );
  const { table, setTableData } = useActivityTable(tab);
  const {
    state: { connecting },
  } = useContext(PolymeshContext);
  const { selectedAccount, identity } = useContext(AccountContext);
  const { extrinsicHistory, dataLoading } = useHistoricData();
  const { loading, error, data } = useQuery(getAssetTransferEvents, {
    variables: { did: identity?.did || '' },
  });

  useEffect(() => {
    if (!identity || connecting || dataLoading || loading || error) {
      return setTableData([]);
    }

    switch (tab) {
      /* 
          Should be implemented more efficiently in the future 
      */
      case EActivityTableTabs.HISTORICAL_ACTIVITY: {
        (async () => {
          const parsedData = await Promise.all(
            extrinsicHistory
              .map(async ({ blockNumber, extrinsicIdx, success, txTag }) => ({
                extrinsicId: `${blockNumber.toString()}-${extrinsicIdx.toString()}`,
                dateTime: await getExtrinsicTime(blockNumber, extrinsicIdx),
                module: txTag.split('.')[0],
                call: txTag.split('.')[1],
                success,
              }))
              .reverse(),
          );

          setTableData(parsedData);
        })();
        break;
      }

      /* 
          Should be implemented more efficiently in the future 
      */
      case EActivityTableTabs.TOKEN_ACTIVITY: {
        const parsedData = data.events.nodes.map(
          ({
            id,
            blockId,
            extrinsicIdx,
            block,
            attributes,
          }: ITransferEvent) => {
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
              dateTime: toParsedDateTime(block.datetime),
              from: (from as IAddress).did,
              to: (to as IAddress).did,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              amount: balanceToBigNumber(amount as number).toString(),
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

    return undefined;
  }, [
    identity,
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
