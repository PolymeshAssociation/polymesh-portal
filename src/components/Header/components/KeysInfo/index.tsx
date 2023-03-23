import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { StyledWrapper } from './styles';

export const KeysInfo = () => {
  const { selectedAccount } = useContext(AccountContext);

  return (
    <StyledWrapper>
      <Icon name="KeyIcon" className="key-icon" size="14px" />
      <WalletSelect />
      <CopyToClipboard value={selectedAccount} />
    </StyledWrapper>
  );
};
