import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from '~/components';
import {
  buildBalanceSearchParams,
  EBalanceHolder,
  getBalanceHolder,
} from '../../helpers';
import { AssetTableItem, EAssetsTableTabs, ITokenItem } from './constants';
import { useAssetTable } from './hooks';
// import { EAssetsTableTabs } from './constants';

export const AssetTable = () => {
  const [tab, setTab] = useState<EAssetsTableTabs>(EAssetsTableTabs.TOKENS);
  const { table, tableDataLoading, totalItems } = useAssetTable(tab);

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const selectedHolder = getBalanceHolder(holder, id);

  const handleRowClick = (original: AssetTableItem) => {
    if (tab !== EAssetsTableTabs.TOKENS) return;

    const { assetId } = original as ITokenItem;

    const params = buildBalanceSearchParams({
      holder: selectedHolder,
      portfolioId: selectedHolder === EBalanceHolder.PORTFOLIO ? id : undefined,
      accountAddress:
        selectedHolder === EBalanceHolder.ACCOUNT ? address : undefined,
      additionalParams: { asset: assetId },
    });
    setSearchParams(params);
  };

  return (
    <Table
      title="Fungible Assets"
      data={{ table, tab }}
      loading={tableDataLoading}
      tabs={Object.values(EAssetsTableTabs)}
      setTab={setTab}
      totalItems={totalItems}
      handleRowClick={
        tab === EAssetsTableTabs.TOKENS ? handleRowClick : undefined
      }
    />
  );
};
