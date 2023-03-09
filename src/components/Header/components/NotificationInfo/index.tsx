import { useNotifications } from '~/hooks/polymesh';
import { StyledWrapper } from './styles';
import { Icon } from '~/components';
import { NotificationCounter } from '~/components/UiKit';

export const NotificationInfo = () => {
  const { notificationsLoading, totalPending } = useNotifications();
  return (
    <StyledWrapper>
      <Icon name="NotificationIcon" />
      {!notificationsLoading && totalPending ? (
        <NotificationCounter count={totalPending} className="notification" />
      ) : null}
    </StyledWrapper>
  );
};
