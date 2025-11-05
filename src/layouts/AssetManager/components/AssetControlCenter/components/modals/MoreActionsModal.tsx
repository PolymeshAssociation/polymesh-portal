import React, { useState } from 'react';
import { Modal, Icon, ConfirmationModal } from '~/components';
import { Heading } from '~/components/UiKit';
import { TIcons } from '~/assets/icons/types';
import type { AssetSnapshotProps } from '../../types';
import {
  ModalContainer,
  ModalContent,
  ModalActionsGrid,
  ModalActionButton,
} from '../../styles';

interface MoreActionsModalProps {
  assetDetails: AssetSnapshotProps['asset'];
  isOpen: boolean;
  onClose: () => void;
  onActionSelect: (action: string) => void;
}

interface ActionConfig {
  id: string;
  label: string;
  icon: TIcons;
  disabled?: boolean;
}

export const MoreActionsModal: React.FC<MoreActionsModalProps> = ({
  assetDetails,
  isOpen,
  onClose,
  onActionSelect,
}) => {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const isNftCollection = assetDetails.details?.isNftCollection;
  const isFrozen = assetDetails.details?.isFrozen;
  const isDivisible = assetDetails.details?.isDivisible;
  const hasTicker = !!assetDetails.details?.ticker;

  // Define all available actions
  const actions: ActionConfig[] = [
    {
      id: 'redeemTokens',
      label: 'Redeem/Burn Tokens',
      icon: 'MinusCircle',
    },
    {
      id: 'controllerTransfer',
      label: 'Force Transfer',
      icon: 'ArrowTopRight',
    },
    // Show freeze/unfreeze based on current state
    ...(isFrozen
      ? [
          {
            id: 'unfreeze' as const,
            label: 'Unfreeze Transfers',
            icon: 'LockIcon' as TIcons,
          },
        ]
      : [
          {
            id: 'freeze' as const,
            label: 'Freeze Transfers',
            icon: 'LockIcon' as TIcons,
          },
        ]),
    // Show link/unlink ticker based on current state
    ...(hasTicker
      ? [
          {
            id: 'unlinkTicker' as const,
            label: 'Unlink Ticker',
            icon: 'Link' as TIcons,
          },
        ]
      : [
          {
            id: 'linkTicker' as const,
            label: 'Link Ticker',
            icon: 'Link' as TIcons,
          },
        ]),
    {
      id: 'transferOwnership',
      label: 'Transfer Ownership',
      icon: 'ArrowTopRight',
    },
    {
      id: 'modifyAssetName',
      label: 'Modify Name',
      icon: 'Edit',
    },
    // Only show edit type for fungible assets (not NFT collections)
    ...(!isNftCollection
      ? [
          {
            id: 'modifyAssetType' as const,
            label: 'Modify Asset Type',
            icon: 'Edit' as TIcons,
          },
        ]
      : []),
    {
      id: 'modifyFundingRound',
      label: 'Modify Funding Round',
      icon: 'Edit',
    },
    // Only show make divisible if asset is fungible and not already divisible
    ...(!isNftCollection && !isDivisible
      ? [
          {
            id: 'makeAssetDivisible' as const,
            label: 'Make Divisible',
            icon: 'Edit' as TIcons,
          },
        ]
      : []),
  ];

  const handleActionClick = (actionId: string) => {
    // Actions that require confirmation
    const requiresConfirmation = [
      'freeze',
      'unfreeze',
      'unlinkTicker',
      'makeAssetDivisible',
    ];

    if (requiresConfirmation.includes(actionId)) {
      setPendingAction(actionId);
      return;
    }

    // For other actions, proceed directly
    onActionSelect(actionId);
    onClose();
  };

  const confirmAction = () => {
    if (pendingAction) {
      onActionSelect(pendingAction);
      setPendingAction(null);
      onClose();
    }
  };

  // Get confirmation modal content based on pending action
  const getConfirmationContent = () => {
    switch (pendingAction) {
      case 'freeze':
        return {
          title: 'Confirm Freeze',
          message:
            'Are you sure you want to block all transfers for this asset?',
          confirmLabel: 'Freeze',
        };
      case 'unfreeze':
        return {
          title: 'Confirm Unfreeze',
          message: 'Are you sure you want to allow transfers for this asset?',
          confirmLabel: 'Unfreeze',
        };
      case 'unlinkTicker':
        return {
          title: 'Confirm Unlink',
          message: `Are you sure you want to unlink ${assetDetails.details?.ticker} from asset ${assetDetails.assetId}? Once unlinked the ticker will immediately become available for use by other assets.`,
          confirmLabel: 'Unlink',
        };
      case 'makeAssetDivisible':
        return {
          title: 'Make Asset Divisible',
          message: `Are you sure you want to make ${assetDetails.assetId} divisible? This change is permanent and cannot be reversed.`,
          confirmLabel: 'Make Divisible',
        };
      default:
        return {
          title: '',
          message: '',
          confirmLabel: 'Confirm',
        };
    }
  };

  const confirmationContent = getConfirmationContent();

  return (
    <Modal handleClose={onClose} customWidth="600px">
      <ModalContainer>
        <Heading type="h4">More Actions</Heading>

        <ModalContent>
          <ModalActionsGrid>
            {actions.map((action) => (
              <ModalActionButton
                key={action.id}
                variant="modalSecondary"
                disabled={action.disabled}
                onClick={() => handleActionClick(action.id)}
              >
                <Icon name={action.icon} size="16px" />
                {action.label}
              </ModalActionButton>
            ))}
          </ModalActionsGrid>
        </ModalContent>
      </ModalContainer>

      <ConfirmationModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
        title={confirmationContent.title}
        message={confirmationContent.message}
        confirmLabel={confirmationContent.confirmLabel}
        cancelLabel="Cancel"
      />
    </Modal>
  );
};
