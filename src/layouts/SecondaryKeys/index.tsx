import { useState, useEffect, useContext, useCallback } from 'react';
import { SkeletonLoader } from '~/components/UiKit';
import { Modal } from '~/components';
import { Button } from '~/components/UiKit';
import { useWindowWidth } from '~/hooks/utility';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { SecondaryKeyItem } from './components/SecondaryKeyItem';
import { AddPermissionModal } from './components/AddPermission';
import { IPermissionFormData } from './components/AddPermission/constants';
import { StyledSecondaryKeysList, KeyPlaceholder } from './styles';
import { ISecondaryKeyData } from './components/SecondaryKeyItem/helpers';
import {
  convertSdkPermissionsToKeyData,
  convertUiPermissionsToSdk,
  createEmptyPermissions,
  convertKeyDataToFormData,
} from './utils';

const SecondaryKeys = () => {
  const { isMobile, isTablet } = useWindowWidth();
  const isSmallScreen = isMobile || isTablet;

  const { identity, identityLoading } = useContext(AccountContext);
  const { api: { sdk } } = useContext(PolymeshContext);
  const { executeTransaction, isTransactionInProgress } = useTransactionStatusContext();

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<{
    address: string;
    permissions: IPermissionFormData;
  } | null>(null);
  const [keyToRemove, setKeyToRemove] = useState<ISecondaryKeyData | null>(null);

  // Secondary keys with permissions data
  const [secondaryKeys, setSecondaryKeys] = useState<ISecondaryKeyData[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to refresh secondary keys list
  const refreshSecondaryKeys = useCallback(async () => {
    if (!identity) return;
    
    const { data: secondaryAccountsData } = await identity.getSecondaryAccounts();
    const keysWithPermissions = secondaryAccountsData.map(convertSdkPermissionsToKeyData);
    setSecondaryKeys(keysWithPermissions);
  }, [identity]);

  // Fetch secondary keys with their permissions
  useEffect(() => {
    if (!sdk || !identity || identityLoading) {
      setSecondaryKeys([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const { data: secondaryAccountsData } = await identity.getSecondaryAccounts();
        const keysWithPermissions = secondaryAccountsData.map(convertSdkPermissionsToKeyData);
        setSecondaryKeys(keysWithPermissions);
      } catch (error) {
        console.error('Failed to fetch secondary keys:', error);
        setSecondaryKeys([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [sdk, identity, identityLoading]);

  const handleEdit = useCallback((key: ISecondaryKeyData) => {
    const formData = convertKeyDataToFormData(key);
    setEditingKey({
      address: key.address,
      permissions: formData,
    });
    setIsAddModalOpen(true);
  }, []);

  const handleRemove = useCallback((key: ISecondaryKeyData) => {
    setKeyToRemove(key);
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    if (!keyToRemove || !identity || !sdk) return;

    try {
      const emptyPermissions = createEmptyPermissions();

      await executeTransaction(
        sdk.accountManagement.modifyPermissions({
          secondaryAccounts: [
            {
              account: keyToRemove.address,
              permissions: emptyPermissions,
            },
          ],
        }),
        {
          onTransactionRunning: () => {
            setKeyToRemove(null);
          },
          onSuccess: refreshSecondaryKeys,
        }
      );
    } catch (error) {
      // Error is already handled by the transaction context
      console.error('Failed to remove permissions:', error);
    }
  }, [keyToRemove, identity, sdk, executeTransaction, refreshSecondaryKeys]);

  const handleAddPermission = useCallback(async (
    keyAddress: string,
    permissions: IPermissionFormData
  ) => {
    if (!identity || !sdk) return;

    try {
      const sdkPermissions = await convertUiPermissionsToSdk(permissions, identity);

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
          onSuccess: refreshSecondaryKeys,
        }
      );
    } catch (error) {
      // Error is already handled by the transaction context
      console.error('Failed to modify permissions:', error);
    }
  }, [identity, sdk, executeTransaction, refreshSecondaryKeys]);

  const handleModalClose = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingKey(null);
  }, []);

  return (
    <>
      {loading && <SkeletonLoader height={isSmallScreen ? 312 : 162} />}

      {!loading && (
        <>
          {secondaryKeys.length === 0 ? (
            <KeyPlaceholder>No active secondary keys</KeyPlaceholder>
          ) : (
            <StyledSecondaryKeysList>
              {secondaryKeys.map((key) => (
                <SecondaryKeyItem
                  key={key.address}
                  data={key}
                  onEdit={() => handleEdit(key)}
                  onRemove={() => handleRemove(key)}
                />
              ))}
            </StyledSecondaryKeysList>
          )}
        </>
      )}

      {isAddModalOpen && (
        <AddPermissionModal
          onClose={handleModalClose}
          onConfirm={handleAddPermission}
          initialData={editingKey?.permissions}
          selectedKeyAddress={editingKey?.address}
          isEdit={!!editingKey}
          isSubmitting={isTransactionInProgress}
        />
      )}

      {keyToRemove && (
        <Modal handleClose={() => setKeyToRemove(null)} customWidth="500px">
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '500' }}>
              Confirm Removal of Permissions
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', lineHeight: '1.5', color: 'inherit' }}>
              Are you sure you want to remove the permissions for secondary key{' '}
              {keyToRemove.address}?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button 
                variant="modalSecondary" 
                onClick={() => setKeyToRemove(null)}
                disabled={isTransactionInProgress}
                aria-label="Cancel removal"
              >
                Cancel
              </Button>
              <Button 
                variant="modalPrimary" 
                onClick={handleConfirmRemove}
                disabled={isTransactionInProgress}
                aria-label="Confirm removal of permissions"
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SecondaryKeys;
