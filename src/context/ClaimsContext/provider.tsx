import {
  Claim,
  ClaimData,
  ClaimScope,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { notifyError } from '~/helpers/notifications';

import { PolymeshContext } from '../PolymeshContext';
import ClaimsContext from './context';

interface IProviderProps {
  children: React.ReactNode;
}

const target =
  '0x005e9edd535c59583f744cf9cf2d28204902f11b07ba979e3e26db7af82b122d';

const ClaimsProvider = ({ children }: IProviderProps) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const [scopeOptions, setScopeOptions] = useState<ClaimScope[]>([]);
  const [receivedClaims, setReceivedClaims] = useState<ClaimData<Claim>[]>([]);
  const [issuedClaims, setIssuedClaims] = useState<ClaimData<Claim>[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [shouldRefetchClaims, setShouldRefetchClaims] = useState(true);

  useEffect(() => {
    if (!sdk) {
      setShouldRefetchClaims(true);
      return;
    }
    if (!shouldRefetchClaims) return;

    (async () => {
      try {
        setClaimsLoading(true);

        const claimScopes = await sdk.claims.getClaimScopes({ target });
        setScopeOptions(claimScopes);

        const { data: targeting } = await sdk.claims.getTargetingClaimsV2({
          target,
        });
        setReceivedClaims(targeting.flatMap(({ claims }) => claims));

        const { data: issued } = await sdk.claims.getIssuedClaimsV2({ target });
        setIssuedClaims(issued);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setClaimsLoading(false);
        setShouldRefetchClaims(false);
      }
    })();
  }, [sdk, shouldRefetchClaims]);

  const refreshClaims = () => {
    setShouldRefetchClaims(true);
  };

  const contextValue = useMemo(
    () => ({
      scopeOptions,
      receivedClaims,
      issuedClaims,
      claimsLoading,
      refreshClaims,
    }),
    [scopeOptions, receivedClaims, issuedClaims, claimsLoading],
  );

  return (
    <ClaimsContext.Provider value={contextValue}>
      {children}
    </ClaimsContext.Provider>
  );
};

export default ClaimsProvider;
