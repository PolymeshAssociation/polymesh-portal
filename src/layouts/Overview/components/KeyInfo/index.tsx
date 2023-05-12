import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { SkeletonLoader, Text } from '~/components/UiKit';
import {
  StyledWrapper,
  IconWrapper,
  KeyInfoWrapper,
  StyledLabel,
} from './styles';
import { useWindowWidth } from '~/hooks/utility';

export const KeyInfo = () => {
  const {
    selectedAccount,
    primaryKey,
    secondaryKeys,
    accountIsMultisigSigner,
  } = useContext(AccountContext);
  const { isMobile, isSmallDesktop } = useWindowWidth();

  return (
    <StyledWrapper>
      {!isMobile && !isSmallDesktop && (
        <IconWrapper size="64px">
          <Icon name="KeyIcon" className="key-icon" size="26px" />
        </IconWrapper>
      )}
      <div className="info-wrapper">
        <Text marginBottom={4}>Selected key</Text>
        <KeyInfoWrapper>
          {selectedAccount && selectedAccount === primaryKey && (
            <StyledLabel>Primary</StyledLabel>
          )}
          {secondaryKeys.includes(selectedAccount) && (
            <StyledLabel>Secondary</StyledLabel>
          )}
          {accountIsMultisigSigner && (
            <StyledLabel>MultiSig Signer</StyledLabel>
          )}
          {selectedAccount &&
            selectedAccount !== primaryKey &&
            !secondaryKeys.includes(selectedAccount) &&
            !accountIsMultisigSigner && <StyledLabel>Unassigned</StyledLabel>}
          <WalletSelect placement="widget" trimValue={false} />
          <IconWrapper>
            {selectedAccount ? (
              <CopyToClipboard value={selectedAccount} />
            ) : (
              <SkeletonLoader
                circle
                height="32px"
                width="32px"
                baseColor="rgba(255,255,255,0.05)"
                highlightColor="rgba(255, 255, 255, 0.24)"
              />
            )}
          </IconWrapper>
        </KeyInfoWrapper>
      </div>
    </StyledWrapper>
  );
};
