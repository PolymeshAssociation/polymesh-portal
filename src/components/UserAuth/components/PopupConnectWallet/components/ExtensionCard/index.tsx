import { useAuthContext } from '~/context/AuthContext';
import { useWindowWidth } from '~/hooks/utility';
import { IExtensionConnectOption } from '~/constants/wallets';
import { Text } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  WALLET_FEATURES_LIST,
  WALLET_FEATURES_LIST_MOBILE,
} from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import {
  StyledExtensionName,
  StyledExtensionFeaturesList,
  StyledExtensionNameMobile,
} from './styles';

interface IExtensionCardProps {
  wallet: IExtensionConnectOption;
}

export const ExtensionCard = ({ wallet }: IExtensionCardProps) => {
  const { windowWidth } = useWindowWidth();
  const { isMobileDevice } = useAuthContext();

  return (
    <ActionCard
      hovered
      matomoData={{
        eventCategory: "onboarding",
        eventAction: "wallet-select",
        eventName: `${wallet.walletName.toLowerCase()}`
      }}
    >
      <StyledExtensionName $isMobile={isMobileDevice}>
        <Icon
          name={wallet.iconName}
          size={windowWidth > 520 || isMobileDevice ? '48px' : '28px'}
        />
        {isMobileDevice ? (
          <StyledExtensionNameMobile>
            <Text size="large" bold>
              {wallet.walletName}
            </Text>
            <Text>({WALLET_FEATURES_LIST_MOBILE[wallet.walletName]})</Text>
          </StyledExtensionNameMobile>
        ) : (
          <Text size="large">{wallet.walletName}</Text>
        )}
      </StyledExtensionName>
      {!isMobileDevice && (
        <StyledExtensionFeaturesList>
          {WALLET_FEATURES_LIST[wallet.walletName].map((item) => (
            <li key={item}>
              <Text size="small">{item}</Text>
            </li>
          ))}
        </StyledExtensionFeaturesList>
      )}
    </ActionCard>
  );
};
