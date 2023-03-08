// import { useEffect, useState } from 'react';
import { useAccounts } from '~/hooks/polymesh';
import { Icon, CopyToClipboard } from '~/components';
import { StyledWrapper, StyledPrimaryLabel } from './styles';
import { WalletSelect } from '../WalletSelect';

export const KeysInfo = () => {
  const { selectedAccount } = useAccounts();
  // const { identity } = useAccountIdentity();
  // const [isPrimary, setIsPrimary] = useState(false);

  // useEffect(() => {
  //   if (!selectedAccount || !identity) return;

  //   identity.getPrimaryAccount(({ account }) => {
  //     setIsPrimary(account.address === selectedAccount);
  //   });
  // }, [identity, selectedAccount]);

  return (
    <StyledWrapper>
      <Icon name="KeyIcon" />
      <StyledPrimaryLabel>Primary</StyledPrimaryLabel>
      <WalletSelect />
      <CopyToClipboard value={selectedAccount} />
    </StyledWrapper>
  );
};
