import {
  InstructionAffirmation,
  Leg,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CopyToClipboard, Icon } from '~/components';
import { AssetDetailsModal } from '~/components/AssetDetailsModal';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { formatBalance, formatDid, formatUuid } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import {
  getAssetHolderIdentifier,
  getDidIdentifier,
  isPortfolioHolder,
} from '~/layouts/Transfers/helpers';
import {
  EInstructionDirection,
  getAffirmationStatus,
  getAssetHolderName,
  getLegDirection,
  parseNfts,
} from './helpers';
import {
  StyledClickableWrapper,
  StyledExpandedErrors,
  StyledInfoItem,
  StyledInfoValue,
  StyledLabel,
  StyledLeg,
  StyledLegWrapper,
  StyledNftImage,
  StyledNftItem,
  StyledNftsWrapper,
} from './styles';

interface ILegProps {
  data: {
    leg: Leg;
    errors: string[];
  };
  affirmationsData: InstructionAffirmation[];
}
interface ILegDetails {
  sendingIdentifier: string;
  sendingDid: string;
  sendingName: string;
  sendingAddress?: string;
  receivingIdentifier: string;
  receivingDid: string;
  receivingName: string;
  receivingAddress?: string;
  asset: string;
  amount: string;
  direction: `${EInstructionDirection}`;
  nfts?: {
    id: number;
    imgUrl: string;
  }[];
}

export const InstructionLeg: React.FC<ILegProps> = ({
  data: { leg, errors },
  affirmationsData,
}) => {
  const { identity, selectedAccount, allAccountsWithMeta } =
    useContext(AccountContext);
  const [legDetails, setLegDetails] = useState<ILegDetails | null>(null);
  const [legErrorExpanded, setLegErrorExpanded] = useState(false);
  const [isAssetDetailsModalOpen, setAssetDetailsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { isMobile, isTablet } = useWindowWidth();

  const isSmallScreen = isMobile || isTablet;

  const toggleModal = () => {
    setAssetDetailsModalOpen(false);
  };

  useEffect(() => {
    if (!leg) return;

    (async () => {
      if ('offChainAmount' in leg) {
        const parsedData = {
          sendingIdentifier: getDidIdentifier(leg.from.did),
          sendingDid: leg.from.did,
          sendingName: 'Off Chain',
          receivingIdentifier: getDidIdentifier(leg.to.did),
          receivingDid: leg.to.did,
          receivingName: 'Off Chain',
          asset: leg.asset,
          direction: 'Off Chain',
          amount: leg.offChainAmount.toString(),
        } as ILegDetails;
        setLegDetails(parsedData);
        return;
      }
      const { from, to, asset } = leg;
      const fromName = await getAssetHolderName(from);
      const toName = await getAssetHolderName(to);
      const amount =
        'amount' in leg
          ? formatBalance(leg.amount.toNumber())
          : leg.nfts?.length;

      const nfts = 'nfts' in leg ? await parseNfts(leg.nfts) : [];

      let sendingDid: string;
      let sendingAddress: string | undefined;
      if (isPortfolioHolder(from)) {
        sendingDid = from.owner.did;
      } else {
        sendingAddress = from.address;
        const fromIdentity = await from.getIdentity();
        sendingDid = fromIdentity?.did ?? '';
      }

      let receivingDid: string;
      let receivingAddress: string | undefined;
      if (isPortfolioHolder(to)) {
        receivingDid = to.owner.did;
      } else {
        receivingAddress = to.address;
        const toIdentity = await to.getIdentity();
        receivingDid = toIdentity?.did ?? '';
      }

      const parsedData = {
        sendingIdentifier: getAssetHolderIdentifier(from),
        sendingDid,
        sendingName: fromName,
        sendingAddress,
        receivingIdentifier: getAssetHolderIdentifier(to),
        receivingDid,
        receivingName: toName,
        receivingAddress,
        asset: asset.id,
        direction: getLegDirection({
          from,
          to,
          identity,
          accountAddress: selectedAccount,
        }),
        amount,
        nfts,
      } as ILegDetails;

      setLegDetails(parsedData);
    })();
  }, [affirmationsData, leg, identity, selectedAccount]);

  return legDetails ? (
    <StyledLegWrapper>
      <StyledLeg>
        <StyledInfoItem>
          Direction
          <Text size="large" bold>
            {legDetails.direction}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Asset ID
          <StyledInfoValue>
            <StyledClickableWrapper
              onClick={() => setAssetDetailsModalOpen(true)}
            >
              <Icon name="Coins" size="16px" />
              <Text size="large" bold>
                {formatUuid(legDetails.asset)}
              </Text>
            </StyledClickableWrapper>
            <CopyToClipboard value={legDetails.asset} />
          </StyledInfoValue>
          {isAssetDetailsModalOpen && (
            <AssetDetailsModal
              asset={legDetails.asset}
              toggleModal={toggleModal}
            />
          )}
        </StyledInfoItem>
        <StyledInfoItem>
          {legDetails.nfts?.length ? 'NFT Count' : 'Amount'}
          <Text size="large" bold>
            {legDetails?.amount}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Sending Participant
          <StyledInfoValue
            $affirmationStatus={getAffirmationStatus(
              affirmationsData,
              legDetails.sendingIdentifier,
            )}
          >
            <Text size="large" bold>
              {legDetails.sendingDid === identity?.did
                ? 'Selected participant'
                : formatDid(legDetails.sendingDid)}
            </Text>
            <CopyToClipboard
              value={legDetails.sendingDid || legDetails.sendingAddress || ''}
            />
          </StyledInfoValue>
        </StyledInfoItem>
        <StyledInfoItem>
          Sending Holder
          {legDetails.sendingAddress ? (
            <StyledInfoValue>
              <Text size="large" bold>
                {allAccountsWithMeta.find(
                  (a) => a.address === legDetails.sendingAddress,
                )?.meta.name ?? formatDid(legDetails.sendingAddress)}
              </Text>
              <CopyToClipboard value={legDetails.sendingAddress} />
            </StyledInfoValue>
          ) : (
            <Text size="large" bold>
              {legDetails.sendingName}
            </Text>
          )}
        </StyledInfoItem>
        <StyledInfoItem>
          Receiving Participant
          <StyledInfoValue
            $affirmationStatus={getAffirmationStatus(
              affirmationsData,
              legDetails.receivingIdentifier,
            )}
          >
            <Text size="large" bold>
              {legDetails.receivingDid === identity?.did
                ? 'Selected participant'
                : formatDid(
                    legDetails.receivingDid || legDetails.receivingAddress,
                  )}
            </Text>
            <CopyToClipboard
              value={
                legDetails.receivingDid || legDetails.receivingAddress || ''
              }
            />
          </StyledInfoValue>
        </StyledInfoItem>
        <StyledInfoItem>
          Receiving Holder
          {legDetails.receivingAddress ? (
            <StyledInfoValue>
              <Text size="large" bold>
                {allAccountsWithMeta.find(
                  (a) => a.address === legDetails.receivingAddress,
                )?.meta.name ?? formatDid(legDetails.receivingAddress)}
              </Text>
              <CopyToClipboard value={legDetails.receivingAddress} />
            </StyledInfoValue>
          ) : (
            <Text size="large" bold>
              {legDetails.receivingName}
            </Text>
          )}
        </StyledInfoItem>
        <StyledInfoItem>
          {isSmallScreen && 'Status'}
          {errors.length ? (
            <StyledLabel
              $isError
              onMouseEnter={() => setLegErrorExpanded(true)}
              onMouseLeave={() => setLegErrorExpanded(false)}
            >
              Error
              {legErrorExpanded && (
                <StyledExpandedErrors>
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </StyledExpandedErrors>
              )}
            </StyledLabel>
          ) : (
            <StyledLabel>{type}</StyledLabel>
          )}
        </StyledInfoItem>
      </StyledLeg>
      {!!legDetails.nfts?.length && (
        <StyledNftsWrapper>
          <span>NFT ID ({legDetails?.nfts?.length}):</span>
          {legDetails.nfts
            .sort((a, b) => a.id - b.id)
            .map((nft) => (
              <StyledNftItem
                key={nft.id}
                onClick={() =>
                  window.open(
                    `${window.location.origin}/balances?nftCollection=${legDetails.asset}&nftId=${nft.id}`,
                    '_blank',
                  )
                }
              >
                <StyledNftImage>
                  {nft.imgUrl ? (
                    <img src={nft.imgUrl} alt={nft.id.toString()} />
                  ) : (
                    <Icon name="Coins" size="12px" />
                  )}
                </StyledNftImage>
                {nft.id}
              </StyledNftItem>
            ))}
        </StyledNftsWrapper>
      )}
    </StyledLegWrapper>
  ) : (
    <StyledLeg>
      {(() => {
        const skeletons = [];
        for (let i = 0; i < 8; i += 1) {
          skeletons.push(
            <StyledInfoItem key={i} $isLoading>
              <SkeletonLoader height={24} />
            </StyledInfoItem>,
          );
        }
        return skeletons;
      })()}
    </StyledLeg>
  );
};
