import {
  InstructionDetails,
  VenueType,
} from '@polymeshassociation/polymesh-sdk/types';
import { useEffect, useState } from 'react';
import { Text } from '~/components/UiKit';
import { StyledInfoItem, StyledVenueDetails, StyledVenueId } from './styles';
import { toParsedDate } from '~/helpers/dateTime';

interface IDetailsProps {
  data: InstructionDetails | null;
  legs: number;
  counterparties: number;
}

interface IVenueDetails {
  description: string;
  type: `${VenueType}`;
}

export const Details: React.FC<IDetailsProps> = ({
  data,
  legs,
  counterparties,
}) => {
  const [venueDetails, setVenueDetails] = useState<IVenueDetails | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  useEffect(() => {
    if (!data) return;

    (async () => {
      const { description, type } = await data.venue.details();
      setVenueDetails({ description, type });
    })();
  }, [data]);

  return data ? (
    <>
      <StyledVenueId
        onMouseEnter={() => setDetailsExpanded(true)}
        onMouseLeave={() => setDetailsExpanded(false)}
      >
        Venue ID
        <Text size="large" bold>
          {data?.venue.toHuman()}
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
  ) : (
    <span>loading</span>
  );
};
