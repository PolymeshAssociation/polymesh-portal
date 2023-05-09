import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TransfersHeader } from './components/TransfersHeader';
import { TransfersList } from './components/TransfersList';
import { ESortOptions } from './types';

const Transfers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');
  const [sortBy, setSortBy] = useState<ESortOptions>(ESortOptions.NEWEST);

  useEffect(() => {
    if (type) return;

    setSearchParams({ type: 'pending' });
  }, [type, setSearchParams]);

  return (
    <>
      <TransfersHeader sortBy={sortBy} setSortBy={setSortBy} />
      <TransfersList sortBy={sortBy} />
    </>
  );
};

export default Transfers;
