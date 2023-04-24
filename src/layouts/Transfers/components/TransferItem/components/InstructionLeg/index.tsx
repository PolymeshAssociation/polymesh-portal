import { useContext, useEffect, useState } from 'react';
import { Leg } from '@polymeshassociation/polymesh-sdk/types';
import { NumberedPortfolio } from '@polymeshassociation/polymesh-sdk/internal';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { Text } from '~/components/UiKit';
import { CopyToClipboard, Icon } from '~/components';
import {
  StyledLeg,
  StyledLabel,
  StyledInfoItem,
  StyledInfoValue,
} from './styles';
import { formatBalance, formatDid } from '~/helpers/formatters';

enum EInstructionDirection {
  INCOMING = 'Incoming',
  OUTGOING = 'Outgoing',
  INTER_PORTFOLIO = 'Inter-Portfolio',
  NONE = 'None',
}

interface ILegProps {
  data: Leg;
}
interface ILegDetails {
  sendingDid: string;
  sendingName: string;
  receivingDid: string;
  receivingName: string;
  asset: string;
  amount: string;
  direction: `${EInstructionDirection}`;
}

export const InstructionLeg: React.FC<ILegProps> = ({ data }) => {
  const { identity } = useContext(AccountContext);
  const [legDetails, setLegDetails] = useState<ILegDetails | null>(null);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    if (!data || !identity) return;

    (async () => {
      const { from, to, amount, asset } = data;
      let fromName = '';
      let toName = '';
      let direction = '';
      try {
        if (from instanceof NumberedPortfolio) {
          fromName = `${from.toHuman().id} / ${await from.getName()}`;
        }
      } catch (error) {
        fromName = 'unknown';
      }
      try {
        if (to instanceof NumberedPortfolio) {
          toName = await to.getName();
        }
      } catch (error) {
        toName = 'unknown';
      }

      if (
        from.toHuman().did === identity.did &&
        to.toHuman().did === identity.did
      ) {
        direction = EInstructionDirection.INTER_PORTFOLIO;
      } else if (from.toHuman().did === identity.did) {
        direction = EInstructionDirection.OUTGOING;
      } else if (to.toHuman().did === identity.did) {
        direction = EInstructionDirection.INCOMING;
      } else {
        direction = EInstructionDirection.NONE;
      }
      const parsedData = {
        sendingDid: from.toHuman().did,
        sendingName: fromName || 'Default',
        receivingDid: to.toHuman().did,
        receivingName: toName || 'Default',
        asset: asset.ticker,
        amount: formatBalance(amount.toNumber()),
        direction,
      } as ILegDetails;

      setLegDetails(parsedData);
    })();
  }, [data, identity]);
  return legDetails ? (
    <StyledLeg>
      <StyledInfoItem>
        Sending DID
        <StyledInfoValue>
          <Text size="large" bold>
            {formatDid(legDetails.sendingDid)}
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
        <StyledInfoValue>
          <Text size="large" bold>
            {formatDid(legDetails.receivingDid)}
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
        Direction
        <Text size="large" bold>
          {legDetails.direction}
        </Text>
      </StyledInfoItem>
      <StyledInfoItem>
        Asset
        <StyledInfoValue>
          <Icon name="Coins" />
          <Text size="large" bold>
            {legDetails.asset}
          </Text>
        </StyledInfoValue>
      </StyledInfoItem>
      <StyledInfoItem>
        Amount
        <Text size="large" bold>
          {legDetails.amount}
        </Text>
      </StyledInfoItem>
      <StyledLabel>{type}</StyledLabel>
    </StyledLeg>
  ) : (
    <StyledLeg>Loading</StyledLeg>
  );
};
