import { DistributionWithDetails } from '@polymeshassociation/polymesh-sdk/types';
import { useState, useEffect, useContext, useMemo } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import DistributionsContext from './context';

interface IProviderProps {
  children: React.ReactNode;
}

const DistributionsProvider = ({ children }: IProviderProps) => {
  const { identity, identityLoading } = useContext(AccountContext);
  const [pendingDistributions, setPendingDistributions] = useState<
    DistributionWithDetails[]
  >([]);
  const [distributionsLoading, setDistributionsLoading] = useState(true);
  const [shouldRefreshData, setShouldRefreshData] = useState(true);

  useEffect(() => {
    if (identityLoading || !identity) {
      setPendingDistributions([]);
      setShouldRefreshData(true);
      return;
    }

    if (!shouldRefreshData) {
      return;
    }

    (async () => {
      setDistributionsLoading(true);
      try {
        const distributions = await identity.getPendingDistributions();
        setPendingDistributions(distributions);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setDistributionsLoading(false);
        setShouldRefreshData(false);
      }
    })();
  }, [identity, identityLoading, shouldRefreshData]);

  const refreshDistributions = () => {
    setShouldRefreshData(true);
  };

  const contextValue = useMemo(
    () => ({
      pendingDistributions,
      distributionsLoading,
      refreshDistributions,
    }),
    [distributionsLoading, pendingDistributions],
  );
  return (
    <DistributionsContext.Provider value={contextValue}>
      {children}
    </DistributionsContext.Provider>
  );
};

export default DistributionsProvider;
