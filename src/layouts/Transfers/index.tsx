import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TransfersHeader } from './components/TransfersHeader';
import { TransfersList } from './components/TransfersList';
import { EInstructionTypes, ESortOptions } from './types';

const Transfers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');
  const [sortBy, setSortBy] = useState<ESortOptions>(ESortOptions.NEWEST);

  useEffect(() => {
    if (
      type &&
      Object.values(EInstructionTypes).includes(type as EInstructionTypes)
    )
      return;

    setSearchParams({ type: EInstructionTypes.PENDING });
  }, [type, setSearchParams]);

  return (
    <>
      <TransfersHeader sortBy={sortBy} setSortBy={setSortBy} />
      <TransfersList sortBy={sortBy} />
    </>
  );
};

export default Transfers;
