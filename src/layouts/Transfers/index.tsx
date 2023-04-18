import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TransfersHeader } from './components/TransfersHeader';
import { TransfersList } from './components/TransfersList';

const Transfers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    if (type) return;

    setSearchParams({ type: 'pending' });
  }, [type, setSearchParams]);

  return (
    <>
      <TransfersHeader />
      <TransfersList />
    </>
  );
};

export default Transfers;
