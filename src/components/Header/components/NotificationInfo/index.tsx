import { StyledWrapper } from './styles';
import { Icon } from '~/components';
import { NotificationCounter } from '~/components/UiKit';

const notificationCount = 9;

export const NotificationInfo = () => {
  return (
    <StyledWrapper>
      <Icon name="NotificationIcon" />
      {notificationCount ? (
        <NotificationCounter
          count={notificationCount}
          className="notification"
        />
      ) : null}
    </StyledWrapper>
  );
};
