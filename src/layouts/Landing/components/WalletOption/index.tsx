import {
  StyledWrapper,
  StyledWalletIconBox,
  StyledStatusIconBox,
  StyledSelectedIconBox,
  StyledCaption,
} from './styles';
import { Icon } from '~/components';

interface IWalletOptionProps {
  htmlFor: string;
  walletName: string;
  iconName: string;
  isInstalled: boolean;
  onClick?: () => void;
}

export const WalletOption: React.FC<IWalletOptionProps> = ({
  htmlFor,
  walletName,
  iconName,
  isInstalled,
  onClick,
}) => {
  return (
    <StyledWrapper onClick={onClick} htmlFor={htmlFor}>
      <StyledWalletIconBox installed={isInstalled}>
        <Icon name={iconName} size="56px" />
      </StyledWalletIconBox>
      <StyledSelectedIconBox className="selected-icon">
        <Icon name="SelectedIcon" />
      </StyledSelectedIconBox>
      {!isInstalled && (
        <StyledStatusIconBox>
          <Icon name="DownloadIcon" />
        </StyledStatusIconBox>
      )}
      <StyledCaption installed={isInstalled}>{walletName}</StyledCaption>
    </StyledWrapper>
  );
};
