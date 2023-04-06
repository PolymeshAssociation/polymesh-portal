import { useContext, useState, useEffect, useMemo } from 'react';
import { AuthorizationRequest } from '@polymeshassociation/polymesh-sdk/types';
import { AccountContext } from '../AccountContext';
import AuthorizationsContext from './context';
import { notifyError } from '~/helpers/notifications';

interface IAuthorizationsProviderProps {
  children: React.ReactNode;
}

const AuthorizationsProvider = ({ children }: IAuthorizationsProviderProps) => {
  const { account, identity, identityLoading } = useContext(AccountContext);
  const [incomingAuthorizations, setIncomingAuthorizations] = useState<
    AuthorizationRequest[]
  >([]);
  const [outgoingAuthorizations, setOutgoingAuthorizations] = useState<
    AuthorizationRequest[]
  >([]);
  const [authorizationsLoading, setAuthorizationsLoading] = useState(true);
  const [shouldRefreshData, setShouldRefreshData] = useState(true);

  useEffect(() => {
    if (!account || identityLoading || !shouldRefreshData) return;
    (async () => {
      try {
        setAuthorizationsLoading(true);

        if (!identity) {
          const incoming = await account.authorizations.getReceived();
          setIncomingAuthorizations(
            incoming.sort((a, b) => a.authId.toNumber() - b.authId.toNumber()),
          );
          setOutgoingAuthorizations([]);
        } else {
          const identityIncoming = await identity.authorizations.getReceived();
          const outgoing = await identity.authorizations.getSent();

          setIncomingAuthorizations(
            identityIncoming.sort(
              (a, b) => a.authId.toNumber() - b.authId.toNumber(),
            ),
          );

          setOutgoingAuthorizations(
            outgoing.data.sort(
              (a, b) => a.authId.toNumber() - b.authId.toNumber(),
            ),
          );
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setAuthorizationsLoading(false);
        setShouldRefreshData(false);
      }
    })();
  }, [account, identity, identityLoading, shouldRefreshData]);

  const refreshAuthorizations = () => {
    setShouldRefreshData(true);
  };

  const contextValues = useMemo(
    () => ({
      incomingAuthorizations,
      outgoingAuthorizations,
      authorizationsLoading,
      refreshAuthorizations,
    }),
    [authorizationsLoading, incomingAuthorizations, outgoingAuthorizations],
  );

  return (
    <AuthorizationsContext.Provider value={contextValues}>
      {children}
    </AuthorizationsContext.Provider>
  );
};

export default AuthorizationsProvider;
