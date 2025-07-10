import { Icon } from '~/components';
import { useCopyToClipboard } from '~/hooks/utility/';
import { StyledCopyWrapper } from './styles';

interface ICopyProps {
  value: string | number | undefined;
}

const CopyToClipboard: React.FC<ICopyProps> = ({ value }) => {
  const { copy, isCopied, copySuccess } = useCopyToClipboard(350);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    copy(value);
  };

  return (
    <div onClick={handleClick} role="presentation">
      <StyledCopyWrapper>
        {isCopied ? (
          <Icon
            name={copySuccess ? 'Check' : 'CloseIcon'}
            className={`check-icon ${copySuccess ? 'success' : 'failure'}`}
            size="16px"
          />
        ) : (
          <Icon name="CopyIcon" className="copy-icon" />
        )}
      </StyledCopyWrapper>
    </div>
  );
};

export default CopyToClipboard;
