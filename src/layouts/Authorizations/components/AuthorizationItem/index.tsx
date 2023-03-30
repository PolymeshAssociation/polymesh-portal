import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import { Button, Text } from '~/components/UiKit';
import { EAuthorizationDirections } from '../../constants';
import {
  StyledItemWrapper,
  StyledInfoItem,
  StyledInfoWrapper,
  StyledDetailsWrapper,
  StyledDetailItem,
  StyledDetailValue,
  StyledButtonsWrapper,
  StyledLabel,
} from './styles';

// Temporary hardcoded data
const info = [
  {
    label: 'Auth ID',
    value: '758123',
  },
  {
    label: 'Auth Type',
    value: 'Join Identity',
  },
  {
    label: 'Issuing DID',
    value: 'xdxx...fVqd7',
  },
  {
    label: 'Expire date',
    value: 'Aug 28, 2023',
  },
  {
    label: 'Created at',
    value: 'Aug 28, 2023',
  },
];

const authDetails = [
  {
    permission: 'Ticker',
    details: ['Bitcoin', 'Ethereum'],
  },
  {
    permission: 'Portfolio(s)',
    details: ['none'],
  },
  {
    permission: 'Extrinsics',
    details: ['Settlement', ' Identity'],
  },
];

export const AuthorizationItem = () => {
  const [searchParams] = useSearchParams();
  const direction = searchParams.get('direction');
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        {info.map(({ label, value }) => (
          <StyledInfoItem key={label}>
            {label}
            <Text size="large" bold>
              {value}
            </Text>
          </StyledInfoItem>
        ))}
        {direction === EAuthorizationDirections.OUTGOING && (
          <StyledLabel>Pending</StyledLabel>
        )}
      </StyledInfoWrapper>
      {detailsExpanded && (
        <StyledDetailsWrapper>
          {authDetails.map(({ permission, details }) => (
            <StyledDetailItem key={permission}>
              {permission}:
              {details.map((detail) => (
                <StyledDetailValue key={detail}>{detail}</StyledDetailValue>
              ))}
            </StyledDetailItem>
          ))}
        </StyledDetailsWrapper>
      )}
      <StyledButtonsWrapper expanded={detailsExpanded}>
        {direction === EAuthorizationDirections.INCOMING ? (
          <>
            <Button>Reject</Button>
            <Button variant="success">
              <Icon name="Check" size="24px" />
              Approve
            </Button>
          </>
        ) : (
          <Button variant="secondary">Cancel</Button>
        )}
        <Button variant="secondary" onClick={toggleDetails}>
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
