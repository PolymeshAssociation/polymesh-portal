import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { Text } from '~/components/UiKit';
import {
  StyledWrapper,
  IconWrapper,
  KeyInfoWrapper,
  StyledLabel,
} from './styles';

export const KeyInfo = () => {
  const {
    selectedAccount,
    allAccountsWithMeta,
    primaryKey,
    secondaryKeys,
    accountIsMultisigSigner,
  } = useContext(AccountContext);

  const selectedKeyName = allAccountsWithMeta.find(
    ({ address }) => address === selectedAccount,
  )?.meta.name;

  return (
    <StyledWrapper>
      <IconWrapper size="64px">
        <Icon name="KeyIcon" className="key-icon" size="26px" />
      </IconWrapper>
      <div className="info-wrapper">
        <Text marginBottom={4}>
          Selected key
          {selectedKeyName ? (
            <>
              : <span className="key-name">{selectedKeyName}</span>
            </>
          ) : null}
        </Text>
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
            <CopyToClipboard value={selectedAccount} />
          </IconWrapper>
        </KeyInfoWrapper>
      </div>
    </StyledWrapper>
  );
};
