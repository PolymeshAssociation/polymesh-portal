import { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { MultiSigHeader } from './components/MultiSigHeader';
import { MultiSigList } from './components/MultiSigList';
import { MultiSigTable } from './components/MultiSigTable';
import { NotMultiSigView } from './components/NotMultiSigView';
import { EMultiSigTypes, ESortOptions } from './types';

const MultiSig = () => {
  const [sortBy, setSortBy] = useState<ESortOptions>(ESortOptions.NEWEST);

  const { accountIsMultisigSigner, accountLoading } =
    useContext(AccountContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    if (type && type !== EMultiSigTypes.NOT_MULTISIG) return;

    if (type === EMultiSigTypes.NOT_MULTISIG && accountIsMultisigSigner) {
      setSearchParams({ type: EMultiSigTypes.PENDING });
    }

    setSearchParams({ type: EMultiSigTypes.PENDING });
  }, [type, setSearchParams, accountIsMultisigSigner]);

  useEffect(() => {
    if (!accountLoading && !accountIsMultisigSigner) {
      setSearchParams({ type: EMultiSigTypes.NOT_MULTISIG });
    }
  }, [accountLoading, accountIsMultisigSigner, setSearchParams]);

  if (type === EMultiSigTypes.NOT_MULTISIG) {
    return <NotMultiSigView />;
  }

  return (
    <>
      <MultiSigHeader setSortBy={setSortBy} sortBy={sortBy} />
      {type === EMultiSigTypes.PENDING ? (
        <MultiSigList sortBy={sortBy} />
      ) : (
        <MultiSigTable />
      )}
    </>
  );
};

export default MultiSig;
