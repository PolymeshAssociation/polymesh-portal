import { useContext, useEffect, useState } from 'react';
import {
  InstructionAffirmation,
  Leg,
} from '@polymeshassociation/polymesh-sdk/types';
import { NumberedPortfolio } from '@polymeshassociation/polymesh-sdk/internal';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { CopyToClipboard, Icon } from '~/components';
import {
  StyledLegWrapper,
  StyledLeg,
  StyledLabel,
  StyledInfoItem,
  StyledInfoValue,
  StyledExpandedErrors,
  StyledNftsWrapper,
  StyledNftItem,
  StyledNftImage,
} from './styles';
import { formatBalance, formatDid } from '~/helpers/formatters';
import {
  EInstructionDirection,
  getAffirmationStatus,
  getLegDirection,
  parseNfts,
} from './helpers';
import { useWindowWidth } from '~/hooks/utility';

interface ILegProps {
  data: {
    leg: Leg;
    errors: string[];
  };
  affirmationsData: InstructionAffirmation[];
}
interface ILegDetails {
  sendingDid: string;
  sendingName: string;
  receivingDid: string;
  receivingName: string;
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
  const { identity } = useContext(AccountContext);
  const [legDetails, setLegDetails] = useState<ILegDetails | null>(null);
  const [legErrorExpanded, setLegErrorExpanded] = useState(false);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { isMobile, isTablet } = useWindowWidth();

  const isSmallScreen = isMobile || isTablet;
  useEffect(() => {
    if (!leg || !identity) return;

    (async () => {
      const { from, to, asset } = leg;
      let fromName = '';
      let toName = '';
      try {
        if (from instanceof NumberedPortfolio) {
          fromName = `${from.toHuman().id} / ${await from.getName()}`;
        }
      } catch (error) {
        fromName = `${from.toHuman().id} / unknown`;
      }
      try {
        if (to instanceof NumberedPortfolio) {
          toName = `${to.toHuman().id} / ${await to.getName()}`;
        }
      } catch (error) {
        toName = `${to.toHuman().id} / unknown`;
      }
      const amount =
        'amount' in leg
          ? formatBalance(leg.amount.toNumber())
          : leg.nfts?.length;

      const nfts = 'nfts' in leg ? await parseNfts(leg.nfts) : [];

      const parsedData = {
        sendingDid: from.toHuman().did,
        sendingName: fromName || 'Default',
        receivingDid: to.toHuman().did,
        receivingName: toName || 'Default',
        asset: asset.ticker,
        direction: getLegDirection({ from, to, identity }),
        amount,
        nfts,
      } as ILegDetails;

      setLegDetails(parsedData);
    })();
  }, [affirmationsData, leg, identity]);

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
          Asset
          <StyledInfoValue>
            <Icon name="Coins" size="16px" />
            <Text size="large" bold>
              {legDetails.asset}
            </Text>
          </StyledInfoValue>
        </StyledInfoItem>
        <StyledInfoItem>
          {legDetails.nfts?.length ? 'NFT Count' : 'Amount'}
          <Text size="large" bold>
            {legDetails?.amount}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Sending DID
          <StyledInfoValue
            $affirmationStatus={getAffirmationStatus(
              affirmationsData,
              legDetails.sendingDid,
            )}
          >
            <Text size="large" bold>
              {legDetails.sendingDid === identity?.did
                ? 'Selected DID'
                : formatDid(legDetails.sendingDid)}
            </Text>
            <CopyToClipboard value={legDetails.sendingDid} />
          </StyledInfoValue>
        </StyledInfoItem>
        <StyledInfoItem>
          Sending Portfolio
          <Text size="large" bold>
            {legDetails.sendingName}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Receiving DID
          <StyledInfoValue
            $affirmationStatus={getAffirmationStatus(
              affirmationsData,
              legDetails.receivingDid,
            )}
          >
            <Text size="large" bold>
              {legDetails.receivingDid === identity?.did
                ? 'Selected DID'
                : formatDid(legDetails.receivingDid)}
            </Text>
            <CopyToClipboard value={legDetails.receivingDid} />
          </StyledInfoValue>
        </StyledInfoItem>
        <StyledInfoItem>
          Receiving Portfolio
          <Text size="large" bold>
            {legDetails.receivingName}
          </Text>
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
          <span>Asset ID ({legDetails?.nfts?.length}):</span>
          {legDetails.nfts
            .sort((a, b) => a.id - b.id)
            .map((nft) => (
              <StyledNftItem key={nft.id}>
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
