import { useContext, useEffect, useState } from 'react';
import {
  DistributionParticipant,
  DividendDistribution,
  NoArgsProcedureMethod,
} from '@polymeshassociation/polymesh-sdk/types';
import { Icon } from '~/components';
import { Button, SkeletonLoader, Text } from '~/components/UiKit';
import {
  StyledItemWrapper,
  StyledInfoWrapper,
  StyledButtonsWrapper,
  StyledSelect,
  StyledInfoItem,
  StyledDetails,
  StyledInfoValue,
  StyledLabel,
  StyledExpandedErrors,
} from './styles';
import { toParsedDate } from '~/helpers/dateTime';
import { notifyError } from '~/helpers/notifications';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { getDistributionErrors } from './helpers';
import { useWindowWidth } from '~/hooks/utility';
import { AssetIdCell } from '~/components/AssetIdCell';

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
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { isExternalConnection } = useContext(AccountContext);
  const [participantDetails, setParticipantDetails] =
    useState<DistributionParticipant | null>(null);
  const [distributionErrors, setDistributionErrors] = useState<string[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const { isMobile, isTablet } = useWindowWidth();

  const isSmallScreen = isMobile || isTablet;

  useEffect(() => {
    if (!distribution || !sdk) return;

    (async () => {
      setDetailsLoading(true);
      try {
        const participant = await distribution.getParticipant();

        if (participant) {
          setParticipantDetails(participant);

          const distributionAsset = await sdk.assets.getFungibleAsset({
            assetId: distribution.currency,
          });

          const errors = await getDistributionErrors({
            distribution,
            distributionAsset,
            participant,
          });
          setDistributionErrors(errors);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setDetailsLoading(false);
      }
    })();
  }, [distribution, sdk]);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        <StyledSelect $isSelected={isSelected} onClick={onSelect}>
          <Icon name="Check" size="16px" />
        </StyledSelect>
        <StyledInfoItem>
          Corporate Action ID
          <Text size="large" bold>
            {distribution.asset.toHuman()}/{distribution.id.toString()}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Asset
          <StyledInfoValue>
            <AssetIdCell assetId={distribution.asset.id} />
          </StyledInfoValue>
        </StyledInfoItem>
        <StyledInfoItem>
          Claimable Asset
          <StyledInfoValue>
            <AssetIdCell assetId={distribution.currency} />
          </StyledInfoValue>
        </StyledInfoItem>
        <StyledInfoItem>
          Claimable Amount
          <Text size="large" bold>
            {detailsLoading ? (
              <SkeletonLoader width={120} />
            ) : (
              participantDetails?.amountAfterTax.toString() || null
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
          {!!distributionErrors.length && (
            <StyledInfoItem>
              {isSmallScreen && 'Status'}
              <StyledLabel
                onMouseEnter={() => setErrorsExpanded(true)}
                onMouseLeave={() => setErrorsExpanded(false)}
              >
                Error
                {errorsExpanded && (
                  <StyledExpandedErrors>
                    {distributionErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </StyledExpandedErrors>
                )}
              </StyledLabel>
            </StyledInfoItem>
          )}
        </StyledDetails>
      )}
      <StyledButtonsWrapper $expanded={detailsExpanded}>
        <Button
          variant="success"
          onClick={() => executeAction(distribution.claim)}
          disabled={
            actionInProgress ||
            detailsLoading ||
            !!distributionErrors.length ||
            isExternalConnection
          }
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
