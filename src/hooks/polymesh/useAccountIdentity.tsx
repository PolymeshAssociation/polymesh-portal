import { useState, useEffect, useContext } from 'react';
import {
  Identity,
  AuthorizationType,
  AuthorizationRequest,
} from '@polymeshassociation/polymesh-sdk/types';
import { Id, toast } from 'react-toastify';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { PendingJoinIdentityRequest } from '~/components/NotificationToasts';
import { notifyError } from '~/helpers/notifications';

const useAccountIdentity = () => {
  const {
    state: { initialized, selectedAccount },
    api: { sdk },
  } = useContext(PolymeshContext);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [allIdentities, setAllIdentities] = useState<Identity[]>([]);
  const [joinIdentityRequest, setJoinIdentityRequest] =
    useState<AuthorizationRequest | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState('');
  const { handleStatusChange } = useTransactionStatus();

  // Get identity data when sdk is initialized
  useEffect(() => {
    if (!initialized || !selectedAccount) return;

    (async () => {
      try {
        setIdentityLoading(true);
        const account = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });
        const signingAccounts =
          await sdk.accountManagement.getSigningAccounts();

        const accIdentity = await account.getIdentity();

        if (!accIdentity) {
          const pendingAuthorizations =
            await account.authorizations.getReceived({
              type: AuthorizationType.JoinIdentity,
            });
          setJoinIdentityRequest(pendingAuthorizations[0]);
        }

        const allAccIdentities = (
          await Promise.all(signingAccounts.map((acc) => acc.getIdentity()))
        ).filter((option) => option !== null);

        setIdentity(accIdentity);
        setAllIdentities(allAccIdentities);
      } catch (error) {
        setIdentityError(error.message);
      } finally {
        setIdentityLoading(false);
      }
    })();
  }, [initialized, sdk, selectedAccount]);

  // Show notification if account has pending Join Identity request
  useEffect(() => {
    if (!joinIdentityRequest) return;

    let toastId: Id;

    const approveRequest = async () => {
      let unsubCb: UnsubCallback | null = null;

      try {
        const acceptTx = await joinIdentityRequest.accept();

        unsubCb = acceptTx.onStatusChange(handleStatusChange);

        await acceptTx.run();
      } catch (error) {
        notifyError(error.message);
      } finally {
        toast.dismiss(toastId);
      }

      return () => (unsubCb ? unsubCb() : undefined);
    };

    const rejectRequest = async () => {
      let unsubCb: UnsubCallback | null = null;

      try {
        const rejectTx = await joinIdentityRequest.remove();

        unsubCb = rejectTx.onStatusChange(handleStatusChange);

        await rejectTx.run();
      } catch (error) {
        notifyError(error.message);
      } finally {
        toast.dismiss(toastId);
      }

      return () => (unsubCb ? unsubCb() : undefined);
    };

    toastId = toast.warning(
      <PendingJoinIdentityRequest
        authorizationRequest={joinIdentityRequest}
        id={toastId}
        approveRequest={approveRequest}
        rejectRequest={rejectRequest}
      />,
      {
        autoClose: false,
        toastId: joinIdentityRequest.uuid,
        closeOnClick: false,
        closeButton: true,
      },
    );
  }, [handleStatusChange, joinIdentityRequest]);

  return {
    identity,
    allIdentities,
    joinIdentityRequest,
    identityLoading,
    identityError,
  };
};

export default useAccountIdentity;
