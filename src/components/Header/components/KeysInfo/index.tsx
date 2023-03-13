// import { useEffect, useState } from 'react';
import { useAccounts } from '~/hooks/polymesh';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { StyledWrapper } from './styles';

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
      <Icon name="KeyIcon" className="key-icon" size="14px" />
      <WalletSelect />
      <CopyToClipboard value={selectedAccount} />
    </StyledWrapper>
  );
};
