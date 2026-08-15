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

  // These lists are keyed by wallet name and are not exhaustive — the desktop list has no entry for
  // mobile-only wallets and vice versa, since the caller filters by platform first. Default rather
  // than index blindly: a wallet without an entry should render a plainer card, not take the whole
  // connect modal down with it.
  const features = WALLET_FEATURES_LIST[wallet.walletName] ?? [];
  const mobileFeature = WALLET_FEATURES_LIST_MOBILE[wallet.walletName];

  return (
    <ActionCard hovered>
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
            {mobileFeature && <Text>({mobileFeature})</Text>}
          </StyledExtensionNameMobile>
        ) : (
          <Text size="large">{wallet.walletName}</Text>
        )}
      </StyledExtensionName>
      {!isMobileDevice && !!features.length && (
        <StyledExtensionFeaturesList>
          {features.map((item) => (
            <li key={item}>
              <Text size="small">{item}</Text>
            </li>
          ))}
        </StyledExtensionFeaturesList>
      )}
    </ActionCard>
  );
};
