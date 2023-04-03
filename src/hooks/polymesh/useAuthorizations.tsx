import { useState, useEffect, useContext } from 'react';
import { AuthorizationRequest } from '@polymeshassociation/polymesh-sdk/types';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';

const useAuthorizations = () => {
  const { account, identity, identityLoading } = useContext(AccountContext);
  const [incomingAuthorizations, setIncomingAuthorizations] = useState<
    AuthorizationRequest[]
  >([]);
  const [outgoingAuthorizations, setOutgoingAuthorizations] = useState<
    AuthorizationRequest[]
  >([]);
  const [authorizationsLoading, setAuthorizationsLoading] = useState(true);

  useEffect(() => {
    if (!account || identityLoading) return;

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
      }
    })();
  }, [account, identity, identityLoading]);

  return {
    incomingAuthorizations,
    outgoingAuthorizations,
    authorizationsLoading,
  };
};

export default useAuthorizations;
