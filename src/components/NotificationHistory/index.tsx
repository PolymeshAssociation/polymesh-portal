import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '~/hooks/polymesh';
import { Icon } from '~/components';
import { Heading, Text } from '~/components/UiKit';
import {
  StyledWrapper,
  StyledCloseButton,
  StyledNotificationItem,
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
  const { pendingAuthorizations, pendingInstructions } = useNotifications();
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
        data: null,
      })),
    ];
    return notificationData;
  }, [pendingAuthorizations, pendingInstructions]);

  return (
    <StyledWrapper expanded={expanded}>
      <StyledCloseButton onClick={handleClose}>
        <Icon name="CloseIcon" size="24px" />
      </StyledCloseButton>
      <Heading type="h4" marginBottom={32}>
        Notifications
      </Heading>
      {allNotifications.length ? (
        allNotifications.map(({ data, id, type }) => (
          <StyledNotificationItem key={id} onClick={() => navigate(`/${type}`)}>
            <Text bold size="large" marginBottom={8} transform="capitalize">
              {type}
            </Text>
            {data?.type || 'Instruction'} ID {id} needs to be approved /
            rejected
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
