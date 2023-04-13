import { useState } from 'react';
import { Table } from '~/components';
import { useActivityTable } from './hooks';
import { EActivityTableTabs } from './constants';

export const ActivityTable = () => {
  const [tab, setTab] = useState<`${EActivityTableTabs}`>(
    EActivityTableTabs.HISTORICAL_ACTIVITY,
  );
  const { table, tableLoading } = useActivityTable(tab);

  return (
    <Table
      data={{ table, tab }}
      tabs={Object.values(EActivityTableTabs)}
      setTab={setTab}
      title="Activity"
      loading={tableLoading}
    />
  );
};
