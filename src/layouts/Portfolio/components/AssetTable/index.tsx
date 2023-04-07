import { useState } from 'react';
import { Table } from '~/components';
import { useAssetTable } from './hooks';
import { EAssetsTableTabs } from './constants';

export const AssetTable = () => {
  const [tab, setTab] = useState<`${EAssetsTableTabs}`>(
    EAssetsTableTabs.TOKENS,
  );
  const { table, tableDataLoading } = useAssetTable(tab);
  return (
    <Table
      title="Assets"
      data={{ table, tab }}
      loading={tableDataLoading}
      tabs={Object.values(EAssetsTableTabs)}
      setTab={setTab}
    />
  );
};
