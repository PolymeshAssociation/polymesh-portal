import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '~/hooks/polymesh';
import { Icon } from '~/components';
import { Heading, Text } from '~/components/UiKit';
import {
  StyledWrapper,
  StyledCloseButton,
  StyledNotificationItem,
  StyledTopContainer,
  //   StyledTimestamp,
} from './styles';

interface INotificationHistoryProps {
  handleClose: () => void;
  expanded: boolean;
}

const NotificationHistory: React.FC<INotificationHistoryProps> = ({
  handleClose,
  expanded,
}) => {
  const {
    pendingAuthorizations,
    pendingInstructions,
    pendingDistributions,
    unsignedProposals,
  } = useNotifications();
  const navigate = useNavigate();

  const allNotifications = useMemo(() => {
    const notificationData = [
      ...pendingAuthorizations.map((auth) => ({
        ...auth.toHuman(),
        type: 'authorizations',
      })),
      ...pendingInstructions.map((instruction) => ({
        id: instruction.toHuman(),
        type: 'transfers',
        data: {
          type: 'Instruction',
        },
      })),
      ...pendingDistributions.map(({ distribution }) => ({
        id: `${distribution.asset.toHuman()}/${distribution.id.toString()}`,
        type: 'distributions',
        data: {
          type: 'Corporate Action',
        },
      })),
      ...unsignedProposals.map((proposal: number) => ({
        id: `${proposal}`,
        type: 'multiSig',
        data: {
          type: 'MultiSig Proposal',
        },
      })),
    ];
    return notificationData;
  }, [
    pendingAuthorizations,
    pendingInstructions,
    pendingDistributions,
    unsignedProposals,
  ]);

  return (
    <StyledWrapper $expanded={expanded}>
      <StyledTopContainer>
        <StyledCloseButton onClick={handleClose}>
          <Icon name="CloseIcon" size="24px" />
        </StyledCloseButton>
        <Heading type="h4" marginBottom={32}>
          Notifications
        </Heading>
      </StyledTopContainer>
      {allNotifications.length ? (
        allNotifications.map(({ data, id, type }) => (
          <StyledNotificationItem
            key={id}
            onClick={() => {
              navigate(`/${type}`);
              handleClose();
            }}
          >
            <Text bold size="large" marginBottom={8} transform="capitalize">
              {type}
            </Text>
            {data?.type} ID {id}{' '}
            {data?.type === 'Corporate Action'
              ? 'can be claimed'
              : 'needs to be approved or rejected'}
            {/* <StyledTimestamp>22 min ago</StyledTimestamp> */}
          </StyledNotificationItem>
        ))
      ) : (
        <Text color="secondary">No new notifications</Text>
      )}
    </StyledWrapper>
  );
};

export default NotificationHistory;
