import { InstructionDetails } from '@polymeshassociation/polymesh-sdk/types';
import { Text } from '~/components/UiKit';
import { StyledInfoItem } from './styles';
import { toParsedDate } from '~/helpers/dateTime';

interface IDetailsProps {
  data: InstructionDetails | null;
  legs: number;
  counterparties: number;
}

export const Details: React.FC<IDetailsProps> = ({
  data,
  legs,
  counterparties,
}) => {
  return (
    <>
      <StyledInfoItem>
        Venue
        <Text size="large" bold>
          {data?.venue.toHuman()}
        </Text>
      </StyledInfoItem>
      <StyledInfoItem>
        # of legs
        <Text size="large" bold>
          {legs}
        </Text>
      </StyledInfoItem>
      <StyledInfoItem>
        # counterparties
        <Text size="large" bold>
          {counterparties}
        </Text>
      </StyledInfoItem>
      <StyledInfoItem>
        Settlement type
        <Text size="large" bold>
          {data?.type}
        </Text>
      </StyledInfoItem>
      {!!data?.tradeDate && (
        <StyledInfoItem>
          Trade date
          <Text size="large" bold>
            {toParsedDate(data.tradeDate.toISOString())}
          </Text>
        </StyledInfoItem>
      )}
      {!!data?.valueDate && (
        <StyledInfoItem>
          Value date
          <Text size="large" bold>
            {toParsedDate(data.valueDate.toISOString())}
          </Text>
        </StyledInfoItem>
      )}
      {!!data?.createdAt && (
        <StyledInfoItem>
          Created at
          <Text size="large" bold>
            {toParsedDate(data.createdAt.toISOString())}
          </Text>
        </StyledInfoItem>
      )}
    </>
  );
};
