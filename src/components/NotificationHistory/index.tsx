import React, { useEffect, useMemo } from 'react';
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
}

const NotificationHistory = React.forwardRef(function NotificationHistoryPopup(
  props: INotificationHistoryProps,
  ref,
) {
  const { handleClose } = props;
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
      })),
    ];
    return notificationData;
  }, [pendingAuthorizations, pendingInstructions]);

  // Close dropdown when clicked outside of it
  useEffect(() => {
    const handleClickOutside: React.ReactEventHandler = (event) => {
      if (ref?.current && !ref.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose, ref]);

  return (
    <StyledWrapper ref={ref}>
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
            {data.type || 'Instruction'} ID {id} needs to be approved / rejected
            {/* <StyledTimestamp>22 min ago</StyledTimestamp> */}
          </StyledNotificationItem>
        ))
      ) : (
        <Text variant="secondary">No new notifications</Text>
      )}
    </StyledWrapper>
  );
});

export default NotificationHistory;
