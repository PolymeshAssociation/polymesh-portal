import { type PermissionedAccount } from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ConfirmationModal, Icon } from '~/components';
import { Button, SkeletonLoader } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { useWindowWidth } from '~/hooks/utility';
import { EditPermissionsModal } from './components/EditPermissions';
import { NoSecondaryKeysView } from './components/NoSecondaryKeysView';
import { SecondaryKeyItem } from './components/SecondaryKeyItem';
import { StyledPageHeader, StyledSecondaryKeysList } from './styles';
import { IPermissionFormData } from './types';
import { convertKeyDataToFormData, convertUiPermissionsToSdk } from './utils';

const SecondaryKeys = () => {
  const { isMobile, isTablet } = useWindowWidth();
  const isSmallScreen = isMobile || isTablet;

  const {
    identity,
    identityLoading,
    secondaryKeys,
    secondaryKeysLoading,
    refreshSecondaryKeys,
  } = useContext(AccountContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const { sdk } = useContext(PolymeshContext).api;

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<{
    address: string;
    permissions: IPermissionFormData;
  } | null>(null);
  const [keyToRemovePermissions, setKeyToRemovePermissions] =
    useState<PermissionedAccount | null>(null);
  const [keyToRemoveCompletely, setKeyToRemoveCompletely] =
    useState<PermissionedAccount | null>(null);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [isLoadingFrozenState, setIsLoadingFrozenState] = useState(false);

  const fetchFrozenState = useCallback(async () => {
    if (secondaryKeys.length === 0 || secondaryKeysLoading) {
      return;
    }

    try {
      setIsLoadingFrozenState(true);
      // Only check the first key - all secondary accounts are frozen/unfrozen together
      const firstKeyFrozen = await secondaryKeys[0].account.isFrozen();
      setIsFrozen(firstKeyFrozen);
    } catch (error) {
      // Default to false if we can't determine state
      setIsFrozen(false);
    } finally {
      setIsLoadingFrozenState(false);
    }
  }, [secondaryKeys, secondaryKeysLoading]);

  // Fetch isFrozen state from first secondary key (they're all frozen/unfrozen together)
  useEffect(() => {
    fetchFrozenState();
  }, [fetchFrozenState]);

  const handleEdit = useCallback((key: PermissionedAccount) => {
    const formData = convertKeyDataToFormData(key);
    setEditingKey({
      address: key.account.address,
      permissions: formData,
    });
    setIsAddModalOpen(true);
  }, []);

  const handleRemove = useCallback((key: PermissionedAccount) => {
    setKeyToRemovePermissions(key);
  }, []);

  const handleConfirmRemovePermissions = useCallback(async () => {
    if (!keyToRemovePermissions || !identity || !sdk) return;

    try {
      await executeTransaction(
        sdk.accountManagement.revokePermissions({
          secondaryAccounts: [keyToRemovePermissions.account.address],
        }),
        {
          onTransactionRunning: () => {
            setKeyToRemovePermissions(null);
          },
          onSuccess: () => {
            refreshSecondaryKeys();
          },
        },
      );
    } catch (error) {
      // Error is already handled by the transaction context
    }
  }, [
    keyToRemovePermissions,
    identity,
    sdk,
    executeTransaction,
    refreshSecondaryKeys,
  ]);

  const handleRemoveKeyCompletely = useCallback((key: PermissionedAccount) => {
    setKeyToRemoveCompletely(key);
  }, []);

  const handleConfirmRemoveKeyCompletely = useCallback(async () => {
    if (!keyToRemoveCompletely || !sdk) return;

    try {
      const account = await sdk.accountManagement.getAccount({
        address: keyToRemoveCompletely.account.address,
      });

      await executeTransaction(
        sdk.accountManagement.removeSecondaryAccounts({
          accounts: [account],
        }),
        {
          onTransactionRunning: () => {
            setKeyToRemoveCompletely(null);
          },
          onSuccess: () => {
            // AccountContext will handle the refresh
          },
        },
      );
    } catch (error) {
      // Error is already handled by the transaction context
    }
  }, [keyToRemoveCompletely, sdk, executeTransaction]);

  const handleEditPermission = useCallback(
    async (keyAddress: string, permissions: IPermissionFormData) => {
      if (!identity || !sdk) return;

      try {
        const sdkPermissions = await convertUiPermissionsToSdk(
          permissions,
          identity,
        );

        await executeTransaction(
          sdk.accountManagement.modifyPermissions({
            secondaryAccounts: [
              {
                account: keyAddress,
                permissions: sdkPermissions,
              },
            ],
          }),
          {
            onTransactionRunning: () => {
              setIsAddModalOpen(false);
              setEditingKey(null);
            },
            onSuccess: () => {
              refreshSecondaryKeys();
            },
          },
        );
      } catch (error) {
        // Error is already handled by the transaction context
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to modify secondary key permissions', error);
        }
      }
    },
    [identity, sdk, executeTransaction, refreshSecondaryKeys],
  );

  const handleModalClose = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingKey(null);
  }, []);

  const handleToggleFreezeAll = useCallback(async () => {
    if (!sdk || secondaryKeys.length === 0) return;

    try {
      const method = isFrozen
        ? sdk.accountManagement.unfreezeSecondaryAccounts()
        : sdk.accountManagement.freezeSecondaryAccounts();

      await executeTransaction(method, {
        onSuccess: () => {
          fetchFrozenState();
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context
    }
  }, [
    sdk,
    secondaryKeys.length,
    isFrozen,
    executeTransaction,
    fetchFrozenState,
  ]);

  // Check if there are any secondary keys for this identity
  const shouldShowNoSecondaryKeysView =
    !identityLoading &&
    identity &&
    secondaryKeys.length === 0 &&
    !secondaryKeysLoading;

  // Show NoSecondaryKeysView if identity has no secondary keys or selected account is a secondary key
  if (shouldShowNoSecondaryKeysView) {
    return <NoSecondaryKeysView />;
  }

  return (
    <>
      {secondaryKeysLoading && (
        <SkeletonLoader height={isSmallScreen ? 312 : 162} />
      )}

      {!secondaryKeysLoading && secondaryKeys.length > 0 && (
        <>
          <StyledPageHeader>
            <div />
            <Button
              variant="modalPrimary"
              onClick={handleToggleFreezeAll}
              disabled={isTransactionInProgress || isLoadingFrozenState}
              title={`${
                isFrozen ? 'Unfreeze' : 'Freeze'
              } all secondary keys (blocks identity/asset actions only)`}
              aria-label="Toggle freeze status for all secondary keys"
            >
              <Icon name="LockIcon" size="24px" />
              {isFrozen ? 'Unfreeze All' : 'Freeze All'}
            </Button>
          </StyledPageHeader>
          <StyledSecondaryKeysList>
            {secondaryKeys.map((key) => (
              <SecondaryKeyItem
                key={key.account.address}
                data={key}
                onEdit={() => handleEdit(key)}
                onRemovePermissions={() => handleRemove(key)}
                onRemoveKey={() => handleRemoveKeyCompletely(key)}
                isTransactionInProgress={isTransactionInProgress}
              />
            ))}
          </StyledSecondaryKeysList>
        </>
      )}

      {isAddModalOpen && editingKey && (
        <EditPermissionsModal
          onClose={handleModalClose}
          onConfirm={handleEditPermission}
          initialData={editingKey.permissions}
          selectedKeyAddress={editingKey.address}
          isEdit={!!editingKey}
          isSubmitting={isTransactionInProgress}
        />
      )}

      <ConfirmationModal
        isOpen={!!keyToRemovePermissions}
        onClose={() => setKeyToRemovePermissions(null)}
        onConfirm={handleConfirmRemovePermissions}
        title="Confirm Revoke Permissions"
        message={`Are you sure you want to revoke all permissions for secondary key ${keyToRemovePermissions?.account.address.slice(0, 14)}...? This will remove all identity and asset-related access rights, but the secondary key will remain linked to your identity.`}
        confirmLabel="Confirm Revoke"
        cancelLabel="Cancel"
        isProcessing={isTransactionInProgress}
      />

      <ConfirmationModal
        isOpen={!!keyToRemoveCompletely}
        onClose={() => setKeyToRemoveCompletely(null)}
        onConfirm={handleConfirmRemoveKeyCompletely}
        title="Confirm Remove Secondary Key"
        message={`Warning: Are you sure you want to completely remove secondary key ${keyToRemoveCompletely?.account.address.slice(0, 14)}...? This will remove the key from your identity entirely and it will no longer be able to perform any actions on your behalf.`}
        confirmLabel="Confirm Remove"
        cancelLabel="Cancel"
        isProcessing={isTransactionInProgress}
      />
    </>
  );
};

export default SecondaryKeys;
