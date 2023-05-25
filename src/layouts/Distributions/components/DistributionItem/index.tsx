import { useEffect, useState } from 'react';
import {
  DistributionParticipant,
  DividendDistribution,
  NoArgsProcedureMethod,
} from '@polymeshassociation/polymesh-sdk/types';
import { Icon } from '~/components';
import { Button, Text } from '~/components/UiKit';
import {
  StyledItemWrapper,
  StyledInfoWrapper,
  StyledButtonsWrapper,
  StyledSelect,
  StyledInfoItem,
  StyledDetails,
  StyledInfoValue,
} from './styles';

import { toParsedDate } from '~/helpers/dateTime';
import { notifyError } from '~/helpers/notifications';

interface IDistributionItemProps {
  distribution: DividendDistribution;
  onSelect: () => void;
  isSelected: boolean;
  executeAction: (action: NoArgsProcedureMethod<void, void>) => void;
  actionInProgress: boolean;
}

export const DistributionItem: React.FC<IDistributionItemProps> = ({
  distribution,
  onSelect,
  isSelected,
  executeAction,
  actionInProgress,
}) => {
  const [participantDetails, setParticipantDetails] =
    useState<DistributionParticipant | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  useEffect(() => {
    if (!distribution) return;

    (async () => {
      setDetailsLoading(true);
      try {
        const participant = await distribution.getParticipant();
        if (participant) {
          setParticipantDetails(participant);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setDetailsLoading(false);
      }
    })();
  }, [distribution]);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        <StyledSelect isSelected={isSelected} onClick={onSelect}>
          <Icon name="Check" size="16px" />
        </StyledSelect>
        <StyledInfoItem>
          Corporate Action ID
          <Text size="large" bold>
            {distribution.id.toString()}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Asset
          <Text size="large" bold>
            {distribution.asset.toHuman()}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Amount
          <Text size="large" bold>
            {detailsLoading ? (
              'loading'
            ) : (
              <>
                {participantDetails?.amount.toString() || null}{' '}
                {participantDetails ? distribution.currency : null}
              </>
            )}
          </Text>
        </StyledInfoItem>

        <StyledInfoItem>
          Payment Date
          <Text size="large" bold>
            {toParsedDate(distribution.paymentDate.toISOString())}
          </Text>
        </StyledInfoItem>

        {!!distribution.expiryDate && (
          <StyledInfoItem>
            Expiry Date
            <Text size="large" bold>
              {toParsedDate(distribution.expiryDate.toISOString())}
            </Text>
          </StyledInfoItem>
        )}
      </StyledInfoWrapper>
      {detailsExpanded && (
        <StyledDetails>
          <StyledInfoItem>
            Distribution Asset
            <StyledInfoValue>
              <Text size="large" bold>
                {distribution.currency}
              </Text>
            </StyledInfoValue>
          </StyledInfoItem>
          <StyledInfoItem>
            Amount
            <Text size="large" bold>
              {detailsLoading
                ? 'loading'
                : participantDetails?.amount.toString() || ''}
            </Text>
          </StyledInfoItem>
          <StyledInfoItem>
            Withholding Tax
            <Text size="large" bold>
              {participantDetails
                ? participantDetails.taxWithholdingPercentage.toString()
                : distribution.defaultTaxWithholding.toString()}
              %
            </Text>
          </StyledInfoItem>
          <StyledInfoItem>
            Amount After Tax
            <StyledInfoValue>
              <Text size="large" bold>
                {detailsLoading
                  ? 'loading'
                  : participantDetails?.amountAfterTax.toString() || ''}
              </Text>
            </StyledInfoValue>
          </StyledInfoItem>
          <StyledInfoItem>
            Per share rate
            <Text size="large" bold>
              {distribution.perShare.toString()}
            </Text>
          </StyledInfoItem>
          <StyledInfoItem>
            Declaration Date
            <StyledInfoValue>
              <Text size="large" bold>
                {toParsedDate(distribution.declarationDate.toISOString())}
              </Text>
            </StyledInfoValue>
          </StyledInfoItem>
          <StyledInfoItem>
            Description
            <StyledInfoValue>
              <Text size="large" bold>
                {distribution.description}
              </Text>
            </StyledInfoValue>
          </StyledInfoItem>
        </StyledDetails>
      )}
      <StyledButtonsWrapper expanded={detailsExpanded}>
        <Button
          variant="success"
          onClick={() => executeAction(distribution.claim)}
          disabled={actionInProgress}
        >
          <Icon name="Check" size="24px" />
          Claim
        </Button>
        <Button variant="secondary" onClick={toggleDetails}>
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
