import {
  InstructionDetails,
  InstructionType,
  VenueType,
} from '@polymeshassociation/polymesh-sdk/types';
import { useEffect, useState } from 'react';
import { SkeletonLoader, Text } from '~/components/UiKit';
import {
  StyledDetailsWrapper,
  StyledInfoItem,
  StyledVenueDetails,
  StyledVenueId,
} from './styles';
import { toParsedDate } from '~/helpers/dateTime';
import { splitCamelCase } from '~/helpers/formatters';

interface IDetailsProps {
  data: InstructionDetails | null;
  affirmationsCount: number;
  instructionId: string;
  counterparties: number;
}

interface IVenueDetails {
  description: string;
  type: `${VenueType}` | 'Default';
}

export const Details: React.FC<IDetailsProps> = ({
  data,
  affirmationsCount,
  instructionId,
  counterparties,
}) => {
  const [venueDetails, setVenueDetails] = useState<IVenueDetails | null>(null);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  useEffect(() => {
    if (!data) return;

    (async () => {
      const { description, type } = (await data.venue?.details()) || {
        description: 'Global default venue',
        type: 'Default',
      };
      setVenueDetails({ description, type });
    })();

    if (data.type === InstructionType.SettleOnBlock) {
      setBlockNumber(data.endBlock.toString());
    }
    if (data.type === InstructionType.SettleManual) {
      setBlockNumber(data.endAfterBlock.toString());
    }
  }, [data]);

  return (
    <StyledDetailsWrapper>
      <StyledInfoItem $isId={!data}>
        Instruction ID
        <Text size="large" bold>
          {instructionId}
        </Text>
      </StyledInfoItem>
      {!data ? (
        <SkeletonLoader height={46} />
      ) : (
        <>
          <StyledVenueId
            onMouseEnter={() => setDetailsExpanded(true)}
            onMouseLeave={() => setDetailsExpanded(false)}
          >
            Venue ID
            <Text size="large" bold>
              {data?.venue ? data.venue.toHuman() : 'None'}
            </Text>
            {!!venueDetails && detailsExpanded && (
              <StyledVenueDetails>
                <Text size="small" marginBottom={16}>
                  <span>Type: </span>
                  {venueDetails.type}
                </Text>
                <Text size="small">
                  <span>Description: </span>
                  {venueDetails.description}
                </Text>
              </StyledVenueDetails>
            )}
          </StyledVenueId>
          <StyledInfoItem>
            # counterparties
            <Text size="large" bold>
              {counterparties} (
              {affirmationsCount
                ? `affirmed by ${affirmationsCount}`
                : 'no affirmations'}
              )
            </Text>
          </StyledInfoItem>
          <StyledInfoItem>
            Settlement type
            <Text size="large" bold>
              {splitCamelCase(data?.type || '')}
            </Text>
          </StyledInfoItem>
          {blockNumber && (
            <StyledInfoItem>
              {data?.type === InstructionType.SettleOnBlock
                ? 'Scheduled block'
                : 'Earliest execution block'}
              <Text size="large" bold>
                {blockNumber}
              </Text>
            </StyledInfoItem>
          )}
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
      )}
    </StyledDetailsWrapper>
  );
};
