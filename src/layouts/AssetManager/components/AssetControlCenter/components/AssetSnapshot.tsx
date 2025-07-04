import React, { useState } from 'react';
import { Icon, CopyToClipboard } from '~/components';
import { Button, RefreshButton } from '~/components/UiKit';
import { formatDid, formatUuid } from '~/helpers/formatters';
import type { AssetSnapshotProps } from '../types';
import { IssueTokensModal } from './modals/IssueTokensModal';
import { MoreActionsModal } from './modals/MoreActionsModal';
import { RedeemTokensModal } from './modals/RedeemTokensModal';
import { ForceTransferModal } from './modals/ForceTransferModal';
import { TransferOwnershipModal } from './modals/TransferOwnershipModal';
import { EditNameModal } from './modals/EditNameModal';
import { EditTypeModal } from './modals/EditTypeModal';
import { SetFundingRoundModal } from './modals/SetFundingRoundModal';
import { LinkTickerModal } from './modals/LinkTickerModal';
import { MintNftsModal } from './modals/MintNftsModal';
import {
  SnapshotContainer,
  HeaderBar,
  LeftSection,
  RightSection,
  AssetName,
  AssetNameContainer,
  EditIcon,
  AssetIdentifier,
  StatusActions,
  StatusBadge,
  DetailsCard,
  DetailsGrid,
  DetailItem,
  DetailLabel,
  DetailValue,
} from '../styles';
import { useAssetActions } from '~/hooks/polymesh';

export const AssetSnapshot: React.FC<AssetSnapshotProps> = ({
  asset,
  assetInstance,
  onRefresh,
  isLoading = false,
}) => {
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isMoreActionsModalOpen, setIsMoreActionsModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isForceTransferModalOpen, setIsForceTransferModalOpen] =
    useState(false);
  const [isTransferOwnershipModalOpen, setIsTransferOwnershipModalOpen] =
    useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
  const [isSetFundingRoundModalOpen, setIsSetFundingRoundModalOpen] =
    useState(false);
  const [isLinkTickerModalOpen, setIsLinkTickerModalOpen] = useState(false);
  const [isMintNftsModalOpen, setIsMintNftsModalOpen] = useState(false);

  const {
    freeze,
    unfreeze,
    unlinkTicker,
    linkTicker,
    makeAssetDivisible,
    issueTokens,
    redeemTokens,
    redeemNfts,
    controllerTransfer,
    transferOwnership,
    modifyAssetName,
    modifyAssetType,
    modifyFundingRound,
    createCustomAssetType,
    transactionInProcess,
  } = useAssetActions(assetInstance, onRefresh);

  const handleEditName = () => {
    setIsEditNameModalOpen(true);
  };

  const handlePrimaryAction = () => {
    if (asset.details?.isNftCollection) {
      setIsMintNftsModalOpen(true);
    } else {
      setIsIssueModalOpen(true);
    }
  };

  const handleMoreActions = () => {
    setIsMoreActionsModalOpen(true);
  };

  const handleActionSelect = async (actionId: string) => {
    switch (actionId) {
      case 'redeemTokens':
        setIsRedeemModalOpen(true);
        break;
      case 'controllerTransfer':
        setIsForceTransferModalOpen(true);
        break;
      case 'freeze':
        await freeze();
        break;
      case 'unfreeze':
        await unfreeze();
        break;
      case 'linkTicker':
        setIsLinkTickerModalOpen(true);
        break;
      case 'unlinkTicker':
        await unlinkTicker();
        break;
      case 'transferOwnership':
        setIsTransferOwnershipModalOpen(true);
        break;
      case 'modifyAssetName':
        setIsEditNameModalOpen(true);
        break;
      case 'modifyAssetType':
        setIsEditTypeModalOpen(true);
        break;
      case 'modifyFundingRound':
        setIsSetFundingRoundModalOpen(true);
        break;
      case 'makeAssetDivisible':
        await makeAssetDivisible();
        break;
      default:
        // Unknown action
        break;
    }
  };

  return (
    <SnapshotContainer>
      <HeaderBar>
        <LeftSection>
          <AssetNameContainer>
            <AssetName>Name: {asset.details?.name || ''}</AssetName>
            <EditIcon onClick={handleEditName}>
              <Icon name="Edit" size="20px" />
            </EditIcon>
          </AssetNameContainer>
          <AssetIdentifier>
            Asset ID: {formatUuid(asset.assetId, 8, 8)}
            <CopyToClipboard value={asset.assetId} />
          </AssetIdentifier>
        </LeftSection>

        <RightSection>
          <StatusActions>
            <Button
              variant="modalPrimary"
              onClick={handlePrimaryAction}
              disabled={transactionInProcess}
            >
              <Icon
                name={asset.details?.isNftCollection ? 'Plus' : 'Coins'}
                size="16px"
              />
              {asset.details?.isNftCollection ? 'Mint NFTs' : 'Issue Tokens'}
            </Button>

            <Button
              variant="modalSecondary"
              onClick={handleMoreActions}
              disabled={transactionInProcess}
            >
              <Icon name="BurgerMenu" size="16px" />
              More Actions
            </Button>

            <RefreshButton onClick={onRefresh} disabled={isLoading} />
          </StatusActions>
        </RightSection>
      </HeaderBar>

      <DetailsCard>
        <DetailsGrid>
          {asset.details?.ticker && (
            <DetailItem>
              <DetailLabel>Ticker</DetailLabel>
              <DetailValue>{asset.details.ticker}</DetailValue>
            </DetailItem>
          )}
          <DetailItem>
            <DetailLabel>Status</DetailLabel>
            <DetailValue>
              {asset.details?.isFrozen ? (
                <StatusBadge $status="frozen">
                  <Icon name="LockIcon" size="16px" />
                  Frozen
                </StatusBadge>
              ) : (
                <StatusBadge $status="active">Active</StatusBadge>
              )}
            </DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Type</DetailLabel>
            <DetailValue>
              {asset.details?.isNftCollection
                ? 'Non-Fungible Collection'
                : 'Fungible Asset'}
            </DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Asset Type</DetailLabel>
            <DetailValue>{asset.details?.assetType}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Owner DID</DetailLabel>
            <DetailValue>
              {formatDid(asset.details?.owner || '', 8, 8)}
              <CopyToClipboard value={asset.details?.owner || ''} />
            </DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Total Supply</DetailLabel>
            <DetailValue>{asset.details?.totalSupply}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Holders Count</DetailLabel>
            <DetailValue>{asset.details?.holderCount || '-'}</DetailValue>
          </DetailItem>
          {!asset.details?.isNftCollection && (
            <DetailItem>
              <DetailLabel>Divisible</DetailLabel>
              <DetailValue>
                {asset.details?.isDivisible ? 'Yes' : 'No'}
              </DetailValue>
            </DetailItem>
          )}
          <DetailItem>
            <DetailLabel>Created</DetailLabel>
            <DetailValue>
              {asset.details?.createdAt
                ? asset.details.createdAt.toLocaleDateString()
                : '-'}
            </DetailValue>
          </DetailItem>
          {asset.details?.fundingRound && (
            <DetailItem>
              <DetailLabel>Funding Round</DetailLabel>
              <DetailValue>{asset.details?.fundingRound}</DetailValue>
            </DetailItem>
          )}
        </DetailsGrid>
      </DetailsCard>
      <MoreActionsModal
        assetDetails={asset}
        isOpen={isMoreActionsModalOpen}
        onClose={() => setIsMoreActionsModalOpen(false)}
        onActionSelect={handleActionSelect}
      />
      <IssueTokensModal
        assetDetails={asset}
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        issueTokens={issueTokens}
        transactionInProcess={transactionInProcess}
      />

      <RedeemTokensModal
        assetDetails={asset}
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        redeemTokens={redeemTokens}
        redeemNfts={redeemNfts}
        transactionInProcess={transactionInProcess}
      />

      <ForceTransferModal
        assetDetails={asset}
        isOpen={isForceTransferModalOpen}
        onClose={() => setIsForceTransferModalOpen(false)}
        controllerTransfer={controllerTransfer}
        transactionInProcess={transactionInProcess}
      />

      <TransferOwnershipModal
        isOpen={isTransferOwnershipModalOpen}
        onClose={() => setIsTransferOwnershipModalOpen(false)}
        onTransferOwnership={transferOwnership}
        transactionInProcess={transactionInProcess}
      />

      <EditNameModal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        asset={asset}
        onModifyAssetName={modifyAssetName}
        transactionInProcess={transactionInProcess}
      />

      <EditTypeModal
        isOpen={isEditTypeModalOpen}
        onClose={() => setIsEditTypeModalOpen(false)}
        asset={asset}
        onModifyAssetType={modifyAssetType}
        onCreateAssetType={createCustomAssetType}
        transactionInProcess={transactionInProcess}
      />

      <SetFundingRoundModal
        isOpen={isSetFundingRoundModalOpen}
        onClose={() => setIsSetFundingRoundModalOpen(false)}
        asset={asset}
        onModifyFundingRound={modifyFundingRound}
        transactionInProcess={transactionInProcess}
      />

      <LinkTickerModal
        isOpen={isLinkTickerModalOpen}
        onClose={() => setIsLinkTickerModalOpen(false)}
        asset={asset}
        onLinkTicker={linkTicker}
        transactionInProcess={transactionInProcess}
      />

      <MintNftsModal
        isOpen={isMintNftsModalOpen}
        onClose={() => setIsMintNftsModalOpen(false)}
        transactionInProcess={transactionInProcess}
      />
    </SnapshotContainer>
  );
};
