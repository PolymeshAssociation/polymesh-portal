import { Table } from '~/components';
import { useDistributionsTable } from './hooks';

export const DistributionsTable = () => {
  const { table, tableLoading, totalItems } = useDistributionsTable();

  return (
    <Table
      data={{ table }}
      title="Distributions History"
      loading={tableLoading}
      totalItems={totalItems}
    />
  );
};
