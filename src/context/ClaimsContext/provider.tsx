import {
  Claim,
  ClaimData,
  ClaimScope,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { notifyError } from '~/helpers/notifications';
import { AccountContext } from '../AccountContext';
import { PolymeshContext } from '../PolymeshContext';
import ClaimsContext from './context';
import { getScopesFromClaims } from './helpers';

interface IProviderProps {
  children: React.ReactNode;
}

const ClaimsProvider = ({ children }: IProviderProps) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const [receivedClaims, setReceivedClaims] = useState<ClaimData<Claim>[]>([]);
  const [issuedClaims, setIssuedClaims] = useState<ClaimData<Claim>[]>([]);
  const [receivedScopes, setReceivedScopes] = useState<ClaimScope[]>([]);
  const [issuedScopes, setIssuedScopes] = useState<ClaimScope[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [shouldRefetchClaims, setShouldRefetchClaims] = useState(true);
  const identityRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sdk || !identity) {
      setShouldRefetchClaims(true);
      return;
    }
    if (!shouldRefetchClaims) return;

    (async () => {
      try {
        setClaimsLoading(true);

        const { data: targeting } = await sdk.claims.getTargetingClaimsV2({
          target: identity,
        });
        const targetingClaims = targeting.flatMap(({ claims }) => claims);
        setReceivedClaims(targetingClaims);

        const { data: issued } = await sdk.claims.getIssuedClaimsV2({
          target: identity,
        });
        setIssuedClaims(issued);

        setReceivedScopes(getScopesFromClaims(targetingClaims));
        setIssuedScopes(getScopesFromClaims(issued));
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setClaimsLoading(false);
        setShouldRefetchClaims(false);
        identityRef.current = identity.did;
      }
    })();
  }, [sdk, shouldRefetchClaims, identity]);

  useEffect(() => {
    if (shouldRefetchClaims) return;

    if (identity && identity.did !== identityRef.current) {
      setShouldRefetchClaims(true);
    }
  }, [shouldRefetchClaims, identity]);

  const refreshClaims = () => {
    // getIssuedClaimsV2 doesn't return updated data immediately after adding claims
    // some delay is required not to reload page manually

    const timeoutId = setTimeout(() => {
      setShouldRefetchClaims(true);
      clearTimeout(timeoutId);
    }, 1500);
  };

  const contextValue = useMemo(
    () => ({
      receivedClaims,
      issuedClaims,
      receivedScopes,
      issuedScopes,
      claimsLoading,
      refreshClaims,
    }),
    [receivedClaims, issuedClaims, receivedScopes, issuedScopes, claimsLoading],
  );

  return (
    <ClaimsContext.Provider value={contextValue}>
      {children}
    </ClaimsContext.Provider>
  );
};

export default ClaimsProvider;
