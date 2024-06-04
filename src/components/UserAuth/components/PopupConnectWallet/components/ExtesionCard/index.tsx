import { IWalletConnectOption } from '~/constants/wallets';
import { Text } from '~/components/UiKit';
import { Icon } from '~/components';
import { WALLET_FEATURES_LIST } from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import { StyledExtensionName, StyledExtensionFeaturesList } from './styles';

interface IExtensionCardProps {
  wallet: IWalletConnectOption;
}

export const ExtensionCard = ({ wallet }: IExtensionCardProps) => {
  return (
    <ActionCard hovered>
      <StyledExtensionName>
        <Icon name={wallet.iconName} size="48px" />
        <Text size="large">{wallet.walletName}</Text>
      </StyledExtensionName>
      <StyledExtensionFeaturesList>
        {WALLET_FEATURES_LIST[wallet.walletName].map((item) => (
          <li key={item}>
            <Text size="small">{item}</Text>
          </li>
        ))}
      </StyledExtensionFeaturesList>
    </ActionCard>
  );
};
