import { useRef, useState } from 'react';
import { useNotifications } from '~/hooks/polymesh';
import { StyledWrapper } from './styles';
import { Icon, NotificationHistory } from '~/components';
import { NotificationCounter } from '~/components/UiKit';

export const NotificationInfo = () => {
  const { notificationsLoading, totalPending } = useNotifications();
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<JSX.Element | null>();

  const toggleDropdown = () => setExpanded((prev) => !prev);
  const handleClose = () => setExpanded(false);

  return (
    <>
      <StyledWrapper
        onClick={expanded ? null : toggleDropdown}
        expanded={expanded}
      >
        <Icon name="NotificationIcon" />
        {!notificationsLoading && totalPending ? (
          <NotificationCounter count={totalPending} className="notification" />
        ) : null}
      </StyledWrapper>
      {expanded && <NotificationHistory handleClose={handleClose} ref={ref} />}
    </>
  );
};
