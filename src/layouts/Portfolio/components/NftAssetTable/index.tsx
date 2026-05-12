import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from '~/components';
import {
  buildBalanceSearchParams,
  EBalanceHolder,
  getBalanceHolder,
} from '../../helpers';
import {
  ENftAssetsTableTabs,
  ICollectionItem,
  INftAssetItem,
  TNftTableItem,
} from './constants';
import { useNftAssetTable } from './hooks';

export const NftAssetTable = () => {
  const [tab, setTab] = useState<ENftAssetsTableTabs>(
    ENftAssetsTableTabs.COLLECTIONS,
  );

  const { table, tableDataLoading, totalItems } = useNftAssetTable(tab);

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const selectedHolder = getBalanceHolder(holder, id);

  const handleRowClick = (original: TNftTableItem) => {
    if (
      tab === ENftAssetsTableTabs.MOVEMENTS ||
      tab === ENftAssetsTableTabs.TRANSACTIONS
    ) {
      return;
    }

    const params = buildBalanceSearchParams({
      holder: selectedHolder,
      portfolioId: selectedHolder === EBalanceHolder.PORTFOLIO ? id : undefined,
      accountAddress:
        selectedHolder === EBalanceHolder.ACCOUNT ? address : undefined,
      additionalParams:
        tab === ENftAssetsTableTabs.COLLECTIONS
          ? {
              nftCollection: (original as ICollectionItem).collectionAssetId,
            }
          : {
              nftCollection: (original as INftAssetItem).collectionAssetId,
              nftId: (original as INftAssetItem).nftId.toString(),
            },
    });
    setSearchParams(params);
  };

  return (
    <Table
      title="Non-fungible Assets"
      data={{ table, tab }}
      loading={tableDataLoading}
      tabs={Object.values(ENftAssetsTableTabs)}
      setTab={setTab}
      totalItems={totalItems}
      handleRowClick={
        tab === ENftAssetsTableTabs.MOVEMENTS ||
        tab === ENftAssetsTableTabs.TRANSACTIONS
          ? undefined
          : handleRowClick
      }
    />
  );
};
