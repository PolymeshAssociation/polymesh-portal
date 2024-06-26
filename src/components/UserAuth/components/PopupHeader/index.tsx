import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { StyledCloseButton } from '../../styles';
import {
  StyledPopupHeaderWrap,
  StyledPopupHeader,
  StyledPopupTitle,
} from './styles';

interface IPopupHeaderProps {
  title: string;
  icon: 'ConnectWalletIcon' | 'ConnectIdentityIcon';
  subTitle?: string;
  isWide?: boolean;
  children?: React.ReactNode;
  handleClick: () => void;
}

export const PopupHeader = ({
  title,
  icon,
  subTitle = '',
  isWide = false,
  children = null,
  handleClick,
}: IPopupHeaderProps) => {
  return (
    <StyledPopupHeaderWrap $isWide={isWide}>
      <StyledPopupHeader>
        <StyledPopupTitle>
          <Icon name={icon} size="24px" className="title-icon" />
          <Text size="large" bold>
            {title}
          </Text>
        </StyledPopupTitle>
        {/* <StyledCloseButton onClick={handleClick}>
          <Icon name="CloseCircledIcon" size="20px" className="close-btn" />
        </StyledCloseButton> */}
      </StyledPopupHeader>
      {children || (
        <Text size="large" bold>
          {subTitle}
        </Text>
      )}
    </StyledPopupHeaderWrap>
  );
};
