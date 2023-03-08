import { useEffect, useState } from 'react';
import { CopyToClipboard as BaseCopyToClipboard } from 'react-copy-to-clipboard';
import { Icon } from '~/components';
import { StyledCopyWrapper, StyledNotification } from './styles';

interface ICopyProps {
  value: string | number;
}

const CopyToClipboard: React.FC<ICopyProps> = ({ value }) => {
  const [success, setSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleCopy = (_, result: boolean) => {
    setSuccess(result);
  };

  // Show and hide successful copy notification
  useEffect(() => {
    if (!success) return undefined;

    setShowNotification(true);
    const id = setTimeout(() => {
      setSuccess(false);
      setShowNotification(false);
    }, 500);

    return () => {
      clearTimeout(id);
    };
  }, [showNotification, success]);

  return (
    <BaseCopyToClipboard text={value} onCopy={handleCopy}>
      <StyledCopyWrapper>
        <Icon name="CopyIcon" />
        {showNotification && <StyledNotification />}
      </StyledCopyWrapper>
    </BaseCopyToClipboard>
  );
};

export default CopyToClipboard;
