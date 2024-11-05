import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from '~/components';
import { useNftAssetTable } from './hooks';
import {
  ENftAssetsTableTabs,
  TNftTableItem,
  INftAssetItem,
  ICollectionItem,
} from './constants';

export const NftAssetTable = () => {
  const [tab, setTab] = useState<ENftAssetsTableTabs>(
    ENftAssetsTableTabs.COLLECTIONS,
  );

  const { table, tableDataLoading, totalItems } = useNftAssetTable(tab);

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');

  const handleRowClick = (original: TNftTableItem) => {
    if (
      tab === ENftAssetsTableTabs.MOVEMENTS ||
      tab === ENftAssetsTableTabs.TRANSACTIONS
    ) {
      return;
    }

    let params = id ? { id } : ({} as Record<string, string>);

    if (tab === ENftAssetsTableTabs.COLLECTIONS) {
      params = {
        ...params,
        nftCollection: (original as ICollectionItem).collectionAssetId,
      };
    }
    if (tab === ENftAssetsTableTabs.ALL_NFTS) {
      params = {
        ...params,
        nftCollection: (original as INftAssetItem).collectionAssetId,
        nftId: (original as INftAssetItem).nftId.toString(),
      };
    }

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
