import clsx from 'clsx';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
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
}

export const PopupHeader = ({
  title,
  icon,
  subTitle = '',
  isWide = false,
  children = null,
}: IPopupHeaderProps) => {
  return (
    <StyledPopupHeaderWrap $isWide={isWide}>
      <StyledPopupHeader>
        <StyledPopupTitle>
          <Icon name={icon} size="24px" className={clsx('title-icon')} />
          <Text size="large" bold>
            {title}
          </Text>
        </StyledPopupTitle>
      </StyledPopupHeader>
      {children || (
        <Text size="large" bold>
          {subTitle}
        </Text>
      )}
    </StyledPopupHeaderWrap>
  );
};
