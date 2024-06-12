import { Icon } from '~/components';
import { EActionButtonStatus } from '../../constants';
import {
  StyledActionButtonWrapper,
  StyledActionButton,
  StyledActionLabelWrap,
  StyledActionLabel,
} from './styles';

interface IActionButtonProps {
  title: string;
  label: string;
  icon: 'ConnectWalletIcon' | 'ConnectIdentityIcon';
  status: EActionButtonStatus;
  handleClick: () => void;
}

export const ActionButton = ({
  title,
  label,
  icon,
  status,
  handleClick,
}: IActionButtonProps) => {
  const handleButtonClick = () => {
    if (status === EActionButtonStatus.ACTION_DISABLED) {
      return;
    }
    handleClick();
  };

  return (
    <StyledActionButtonWrapper>
      <StyledActionLabel>{title}</StyledActionLabel>
      <StyledActionButton $status={status} onClick={handleButtonClick}>
        <Icon name={icon} size="24px" className="icon" />
        <StyledActionLabelWrap>
          {status === EActionButtonStatus.ACTION_PENDING ? (
            <>
              <StyledActionLabel>{label}:</StyledActionLabel>
              <StyledActionLabel $status={status} $underlined>
                Pending
              </StyledActionLabel>
            </>
          ) : (
            <StyledActionLabel $status={status}>{label}</StyledActionLabel>
          )}
        </StyledActionLabelWrap>
      </StyledActionButton>
    </StyledActionButtonWrapper>
  );
};
