import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '~/components';
import { useAssetManagerTable } from './hooks';
import {
  AssetManagerTableItem,
  EAssetManagerTableTabs,
  IOwnedAssetItem,
  IManagedAssetItem,
} from './constants';
import { PATHS } from '~/constants/routes';

export const AssetManagerTable = () => {
  const [tab, setTab] = useState<EAssetManagerTableTabs>(
    EAssetManagerTableTabs.OWNED_ASSETS,
  );
  const { table, tableDataLoading, totalItems } = useAssetManagerTable(tab);
  const navigate = useNavigate();

  const handleRowClick = (original: AssetManagerTableItem) => {
    if (
      tab !== EAssetManagerTableTabs.OWNED_ASSETS &&
      tab !== EAssetManagerTableTabs.MANAGED_ASSETS
    )
      return;
    const { id: assetId } = original as IOwnedAssetItem | IManagedAssetItem;

    navigate(`${PATHS.ASSET_MANAGER}/${assetId}`);
  };

  const getTableTitle = () => {
    switch (tab) {
      case EAssetManagerTableTabs.OWNED_ASSETS:
        return 'Owned Assets';
      case EAssetManagerTableTabs.MANAGED_ASSETS:
        return 'Managed Assets';
      case EAssetManagerTableTabs.TICKER_RESERVATIONS:
        return 'Ticker Reservations';
      default:
        return 'Assets';
    }
  };

  return (
    <Table
      title={getTableTitle()}
      data={{ table, tab }}
      loading={tableDataLoading}
      tabs={Object.values(EAssetManagerTableTabs)}
      setTab={setTab}
      totalItems={totalItems}
      handleRowClick={
        tab === EAssetManagerTableTabs.OWNED_ASSETS ||
        tab === EAssetManagerTableTabs.MANAGED_ASSETS
          ? handleRowClick
          : undefined
      }
    />
  );
};
