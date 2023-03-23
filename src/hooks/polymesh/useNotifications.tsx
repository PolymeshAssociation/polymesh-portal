import {
  AuthorizationRequest,
  Instruction,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState, useEffect } from 'react';
import { AccountContext } from '~/context/AccountContext';

const useNotifications = () => {
  const { account, identity } = useContext(AccountContext);
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
    if (!account) return;

    (async () => {
      try {
        setNotificationsLoading(true);

        const authorizations = await account.authorizations.getReceived();

        const instructions = await identity?.getInstructions();

        if (instructions) {
          setPendingInstructions(instructions.pending);
        }
        if (authorizations) {
          setPendingAuthorizations(authorizations);
        }
      } catch (error) {
        setNotificationsError((error as Error).message);
      } finally {
        setNotificationsLoading(false);
      }
    })();
  }, [identity, account]);

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
