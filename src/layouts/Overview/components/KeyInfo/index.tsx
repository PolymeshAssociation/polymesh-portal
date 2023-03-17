import { useAccounts, useAccountIdentity } from '~/hooks/polymesh';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { Text } from '~/components/UiKit';
import {
  StyledWrapper,
  IconWrapper,
  KeyInfoWrapper,
  StyledLabel,
} from './styles';

export const KeyInfo = () => {
  const { selectedAccount } = useAccounts();
  const { primaryKey, secondaryKeys } = useAccountIdentity();

  return (
    <StyledWrapper>
      <IconWrapper size="64px">
        <Icon name="KeyIcon" className="key-icon" size="26px" />
      </IconWrapper>
      <div className="info-wrapper">
        <Text marginBottom={4}>Selected key</Text>
        <KeyInfoWrapper>
          {selectedAccount === primaryKey ? (
            <StyledLabel>Primary</StyledLabel>
          ) : null}
          {secondaryKeys.includes(selectedAccount) ? (
            <StyledLabel>Secondary</StyledLabel>
          ) : null}
          <WalletSelect placement="widget" trimValue={false} />
          <IconWrapper>
            <CopyToClipboard value={selectedAccount} />
          </IconWrapper>
        </KeyInfoWrapper>
      </div>
    </StyledWrapper>
  );
};
