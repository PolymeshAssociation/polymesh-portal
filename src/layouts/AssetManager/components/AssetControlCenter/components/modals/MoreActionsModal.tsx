import React from 'react';
import { Modal, Icon } from '~/components';
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
    onActionSelect(actionId);
    onClose();
  };

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
    </Modal>
  );
};
