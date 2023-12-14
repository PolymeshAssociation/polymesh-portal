import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from '~/components';
import { useAssetTable } from './hooks';
import { EAssetsTableTabs, AssetTableItem, ITokenItem } from './constants';

export const AssetTable = () => {
  const [tab, setTab] = useState<`${EAssetsTableTabs}`>(
    EAssetsTableTabs.TOKENS,
  );
  const { table, tableDataLoading, totalItems } = useAssetTable(tab);

  // const [searchParams, setSearchParams] = useSearchParams();
  // const id = searchParams.get('id');

  // const handleTowClick = (original: AssetTableItem) => {
  //   if (tab !== EAssetsTableTabs.TOKENS) return;

  //   const { ticker } = original as ITokenItem;

  //   const params = id
  //     ? { id, asset: ticker }
  //     : ({ asset: ticker } as Record<string, string>);
  //   setSearchParams(params);
  // };

  return (
    <Table
      title="Fungible Assets"
      data={{ table, tab }}
      loading={tableDataLoading}
      tabs={Object.values(EAssetsTableTabs)}
      setTab={setTab}
      totalItems={totalItems}
      // handleRowClick={handleTowClick}
    />
  );
};
