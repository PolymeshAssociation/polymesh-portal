import { useEffect, useState } from 'react';
import { CopyToClipboard as BaseCopyToClipboard } from 'react-copy-to-clipboard';
import { Icon } from '~/components';
import { StyledCopyWrapper } from './styles';

interface ICopyProps {
  value: string | number | undefined;
}

const CopyToClipboard: React.FC<ICopyProps> = ({ value }) => {
  const [success, setSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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
    <BaseCopyToClipboard text={value as string} onCopy={handleCopy}>
      <StyledCopyWrapper>
        {showNotification ? (
          <Icon
            name={value ? 'Check' : 'CloseIcon'}
            className={`check-icon ${value ? 'success' : 'failure'}`}
            size="16px"
          />
        ) : (
          <Icon name="CopyIcon" className="copy-icon" />
        )}
      </StyledCopyWrapper>
    </BaseCopyToClipboard>
  );
};

export default CopyToClipboard;
