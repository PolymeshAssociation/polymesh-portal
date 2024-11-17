import { useEffect, useState } from 'react';
import { CopyToClipboard as BaseCopyToClipboard } from 'react-copy-to-clipboard';
import clsx from 'clsx';
import { Icon } from '~/components';
import { StyledCopyWrapper } from './styles';

interface ICopyProps {
  value: string | number | undefined;
}

const CopyToClipboard: React.FC<ICopyProps> = ({ value }) => {
  const [success, setSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // prevent event bubbling
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const handleCopy = (_: unknown, result: boolean) => {
    setSuccess(result);
  };

  // Show and hide successful copy notification
  useEffect(() => {
    if (!success) return undefined;

    setShowNotification(true);
    const id = setTimeout(() => {
      setSuccess(false);
      setShowNotification(false);
    }, 350);

    return () => {
      clearTimeout(id);
    };
  }, [showNotification, success]);

  return (
    <div onClick={handleClick} role="presentation">
      <BaseCopyToClipboard text={value as string} onCopy={handleCopy}>
        <StyledCopyWrapper>
          {showNotification ? (
            <Icon
              name={value ? 'Check' : 'CloseIcon'}
              className={clsx('check-icon', {
                success: value,
                failure: !value,
              })}
              size="16px"
            />
          ) : (
            <Icon name="CopyIcon" className={clsx('copy-icon')} />
          )}
        </StyledCopyWrapper>
      </BaseCopyToClipboard>
    </div>
  );
};

export default CopyToClipboard;
