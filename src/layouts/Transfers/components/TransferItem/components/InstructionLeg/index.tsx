import { Leg } from '@polymeshassociation/polymesh-sdk/types';
import { useEffect, useState } from 'react';
import { NumberedPortfolio } from '@polymeshassociation/polymesh-sdk/internal';
import { Text } from '~/components/UiKit';
import { CopyToClipboard, Icon } from '~/components';
import {
  StyledLeg,
  StyledLabel,
  StyledInfoItem,
  StyledInfoValue,
} from './styles';
import { formatBalance, formatDid } from '~/helpers/formatters';

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
}

export const InstructionLeg: React.FC<ILegProps> = ({ data }) => {
  const [legDetails, setLegDetails] = useState<ILegDetails | null>(null);

  useEffect(() => {
    if (!data) return;

    (async () => {
      const { from, to, amount, asset } = data;
      let fromName = '';
      let toName = '';
      try {
        if (from instanceof NumberedPortfolio) {
          fromName = await from.getName();
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
      const parsedData = {
        sendingDid: from.toHuman().did,
        sendingName: fromName || 'Default',
        receivingDid: to.toHuman().did,
        receivingName: toName || 'Default',
        asset: asset.ticker,
        amount: formatBalance(amount.toNumber()),
      } as ILegDetails;

      setLegDetails(parsedData);
    })();
  }, [data]);
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
      <StyledLabel>Pending</StyledLabel>
    </StyledLeg>
  ) : (
    <StyledLeg>Loading</StyledLeg>
  );
};
