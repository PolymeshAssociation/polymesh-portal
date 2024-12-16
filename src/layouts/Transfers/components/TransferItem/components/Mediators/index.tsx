import React, { useContext } from 'react';
import { MediatorAffirmation } from '@polymeshassociation/polymesh-sdk/types';
import { Text } from '~/components/UiKit';
import { CopyToClipboard } from '~/components';
import { formatDid } from '~/helpers/formatters';
import {
  StyledMediatorItem,
  StyledMediatorList,
  StyledInfoItem,
  StyledInfoValue,
  StyledStatus,
  StyledHeader,
  StyledExpiryWrapper,
  StyledExpiry,
} from './styles';
import { toFormattedDateTime } from '~/helpers/dateTime';
import { useWindowWidth } from '~/hooks/utility';
import { AccountContext } from '~/context/AccountContext';

interface MediatorsProps {
  mediators: MediatorAffirmation[];
}

const getExpiryText = (
  expiry: Date | undefined,
  isAffirmed: boolean,
): string => {
  if (expiry) {
    return toFormattedDateTime(expiry.toISOString());
  }
  return isAffirmed ? 'Never' : '-';
};

export const Mediators: React.FC<MediatorsProps> = ({ mediators }) => {
  const { identity } = useContext(AccountContext);
  const { isMobile, isTablet } = useWindowWidth();
  const isSmallScreen = isMobile || isTablet;

  return (
    <StyledMediatorList>
      <StyledHeader>
        <div>Mediator DID</div>
        <div>Expiry</div>
        <div>Status</div>
      </StyledHeader>
      {mediators.map((mediator) => {
        const isExpired = mediator.expiry && new Date() > mediator.expiry;
        const isAffirmed = mediator.status === 'Affirmed';

        return (
          <StyledMediatorItem key={mediator.identity.did}>
            <StyledInfoItem>
              {isSmallScreen && <div>Mediator DID</div>}
              <StyledInfoValue
                $affirmationStatus={mediator.status}
                $isExpired={isExpired}
              >
                <Text size="large" bold>
                  {mediator.identity.did === identity?.did
                    ? 'Selected DID'
                    : formatDid(mediator.identity.did, 8, 8)}
                </Text>
                <CopyToClipboard value={mediator.identity.did} />
              </StyledInfoValue>
            </StyledInfoItem>
            <StyledExpiryWrapper>
              {isSmallScreen && <div>Expiry</div>}
              <StyledExpiry>
                <Text size="large" bold>
                  {mediator.expiry
                    ? toFormattedDateTime(mediator.expiry.toISOString())
                    : getExpiryText(mediator.expiry, isAffirmed)}
                </Text>
              </StyledExpiry>
            </StyledExpiryWrapper>
            <StyledInfoItem>
              {isSmallScreen && <div>Status</div>}
              <StyledStatus $isExpired={isExpired} $isAffirmed={isAffirmed}>
                {isExpired ? 'Affirmation Expired' : mediator.status}
              </StyledStatus>
            </StyledInfoItem>
          </StyledMediatorItem>
        );
      })}
    </StyledMediatorList>
  );
};
