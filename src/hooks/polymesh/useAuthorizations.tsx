import { useState, useEffect, useContext } from 'react';
import { AuthorizationRequest } from '@polymeshassociation/polymesh-sdk/types';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';

const useAuthorizations = () => {
  const { account, identity } = useContext(AccountContext);
  const [incomingAuthorizations, setIncomingAuthorizations] = useState<
    AuthorizationRequest[]
  >([]);
  const [outgoingAuthorizations, setOutgoingAuthorizations] = useState<
    AuthorizationRequest[]
  >([]);
  const [authorizationsLoading, setAuthorizationsLoading] = useState(true);

  useEffect(() => {
    if (!account) return;

    (async () => {
      try {
        setAuthorizationsLoading(true);

        const incoming = await account.authorizations.getReceived();
        const outgoing = await identity?.authorizations.getSent();

        setIncomingAuthorizations(incoming);
        if (outgoing) {
          setOutgoingAuthorizations(outgoing.data);
        } else {
          setOutgoingAuthorizations([]);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setAuthorizationsLoading(false);
      }
    })();
  }, [account, identity]);

  return {
    incomingAuthorizations,
    outgoingAuthorizations,
    authorizationsLoading,
  };
};

export default useAuthorizations;
