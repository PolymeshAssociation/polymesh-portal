import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DistributionsHeader } from './components/DistributionsHeader';
import { DistributionsList } from './components/DistributionsList';
import { DistributionsTable } from './components/DistributionsTable';
import { ESortOptions, EDistributionTypes } from './types';

const Distributions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');
  const [sortBy, setSortBy] = useState<ESortOptions>(ESortOptions.NEWEST);

  useEffect(() => {
    if (type) return;

    setSearchParams({ type: 'pending' });
  }, [type, setSearchParams]);

  return (
    <>
      <DistributionsHeader sortBy={sortBy} setSortBy={setSortBy} />
      {type === EDistributionTypes.PENDING ? (
        <DistributionsList sortBy={sortBy} />
      ) : (
        <DistributionsTable />
      )}
    </>
  );
};

export default Distributions;
