import {
  AuthorizationRequest,
  Instruction,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState, useEffect } from 'react';
import { AccountContext } from '~/context/AccountContext';

const useNotifications = () => {
  const { account, identity, identityLoading } = useContext(AccountContext);
  const [pendingInstructions, setPendingInstructions] = useState<Instruction[]>(
    [],
  );
  const [pendingAuthorizations, setPendingAuthorizations] = useState<
    AuthorizationRequest[]
  >([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  //   Get all pending instructions and authorizations for current account
  useEffect(() => {
    if (!account || identityLoading) return;

    (async () => {
      try {
        setNotificationsLoading(true);

        if (!identity) {
          const authorizations = await account.authorizations.getReceived();
          setPendingInstructions([]);
          setPendingAuthorizations(
            authorizations.sort(
              (a, b) => a.authId.toNumber() - b.authId.toNumber(),
            ),
          );
        } else {
          const instructions = await identity.getInstructions();
          const identityAuthorizations =
            await identity.authorizations.getReceived();

          setPendingAuthorizations(
            identityAuthorizations.sort(
              (a, b) => a.authId.toNumber() - b.authId.toNumber(),
            ),
          );
          setPendingInstructions(instructions.pending);
        }
      } catch (error) {
        setNotificationsError((error as Error).message);
      } finally {
        setNotificationsLoading(false);
      }
    })();
  }, [identity, account, identityLoading]);

  return {
    pendingInstructions,
    pendingAuthorizations,
    totalPending: pendingInstructions.length + pendingAuthorizations.length,
    count: {
      instructions: pendingInstructions.length,
      authorizations: pendingAuthorizations.length,
    },
    notificationsLoading,
    notificationsError,
  };
};

export default useNotifications;
