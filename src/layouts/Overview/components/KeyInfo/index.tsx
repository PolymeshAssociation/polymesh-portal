import { useState, useEffect } from 'react';
import { useAccounts, useAccountIdentity } from '~/hooks/polymesh';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { Text } from '~/components/UiKit';
import {
  StyledWrapper,
  IconWrapper,
  KeyInfoWrapper,
  StyledPrimaryLabel,
} from './styles';

export const KeyInfo = () => {
  const { selectedAccount } = useAccounts();
  const { identity } = useAccountIdentity();
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (!selectedAccount || !identity) return;

    identity.getPrimaryAccount(({ account }) => {
      setIsPrimary(account.address === selectedAccount);
    });
  }, [identity, selectedAccount]);

  return (
    <StyledWrapper>
      <IconWrapper size="64px">
        <Icon name="KeyIcon" className="key-icon" size="26px" />
      </IconWrapper>
      <div className="info-wrapper">
        <Text marginBottom={4}>Selected key</Text>
        <KeyInfoWrapper>
          {isPrimary && <StyledPrimaryLabel>Primary</StyledPrimaryLabel>}
          <WalletSelect placement="widget" trimValue={false} />
          <IconWrapper>
            <CopyToClipboard value={selectedAccount} />
          </IconWrapper>
        </KeyInfoWrapper>
      </div>
    </StyledWrapper>
  );
};
