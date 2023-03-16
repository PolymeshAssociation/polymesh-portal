import {
  AuthorizationRequest,
  Instruction,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';

const useNotifications = () => {
  const {
    api: { sdk },
    state: { selectedAccount },
  } = useContext(PolymeshContext);
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
    if (!sdk || !selectedAccount) return;

    (async () => {
      try {
        setNotificationsLoading(true);
        const account = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });
        const authorizations = await account.authorizations.getReceived();
        const identity = await account.getIdentity();

        const instructions = await identity?.getInstructions();

        if (instructions) {
          setPendingInstructions(instructions.pending);
        }
        if (authorizations) {
          setPendingAuthorizations(authorizations);
        }
      } catch (error: Error) {
        setNotificationsError(error.message);
      } finally {
        setNotificationsLoading(false);
      }
    })();
  }, [sdk, selectedAccount]);

  return {
    pendingInstructions,
    pendingAuthorizations,
    totalPending: pendingInstructions.length + pendingAuthorizations.length,
    notificationsLoading,
    notificationsError,
  };
};

export default useNotifications;
