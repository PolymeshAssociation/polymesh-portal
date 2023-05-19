import { useRef, useState, useEffect, useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import { ThemeContext } from '~/context/ThemeContext';
import { useNotifications } from '~/hooks/polymesh';
import { StyledWrapper, StyledNotificationCenter } from './styles';
import { Icon, NotificationHistory } from '~/components';
import { NotificationCounter, ToastCloseButton } from '~/components/UiKit';

export const NotificationInfo = () => {
  const { currentTheme } = useContext(ThemeContext);
  const { notificationsLoading, totalPending } = useNotifications();
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setExpanded((prev) => !prev);
  const handleClose = () => setExpanded(false);

  // Close dropdown when clicked outside of it
  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return (
    <div ref={ref}>
      <StyledWrapper onClick={toggleDropdown} expanded={expanded}>
        <Icon name="NotificationIcon" />
        {!notificationsLoading && totalPending ? (
          <NotificationCounter count={totalPending} className="notification" />
        ) : null}
      </StyledWrapper>
      <StyledNotificationCenter>
        <NotificationHistory handleClose={handleClose} expanded={expanded} />
        <ToastContainer
          theme={currentTheme}
          closeButton={<ToastCloseButton />}
          enableMultiContainer
          containerId="notification-center"
        />
      </StyledNotificationCenter>
    </div>
  );
};
