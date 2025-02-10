import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '~/components';
import { useAssetManagerTable } from './hooks';
import {
  AssetManagerTableItem,
  EAssetManagerTableTabs,
  IOwnedAssetItem,
} from './constants';
import { PATHS } from '~/constants/routes';

export const AssetManagerTable = () => {
  const [tab, setTab] = useState<EAssetManagerTableTabs>(
    EAssetManagerTableTabs.OWNED_ASSETS,
  );
  const { table, tableDataLoading, totalItems } = useAssetManagerTable(tab);
  const navigate = useNavigate();

  const handleRowClick = (original: AssetManagerTableItem) => {
    if (tab !== EAssetManagerTableTabs.OWNED_ASSETS) return;
    const { id: assetId } = original as IOwnedAssetItem;

    navigate(`${PATHS.ASSET_MANAGER}/${assetId}`);
  };

  return (
    <Table
      title={
        tab === EAssetManagerTableTabs.OWNED_ASSETS
          ? 'Owned Assets'
          : 'Ticker Reservations'
      }
      data={{ table, tab }}
      loading={tableDataLoading}
      tabs={Object.values(EAssetManagerTableTabs)}
      setTab={setTab}
      totalItems={totalItems}
      handleRowClick={
        tab === EAssetManagerTableTabs.OWNED_ASSETS ? handleRowClick : undefined
      }
    />
  );
};
