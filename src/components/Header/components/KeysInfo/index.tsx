import { useContext } from 'react';
import clsx from 'clsx';
import { AccountContext } from '~/context/AccountContext';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { StyledWrapper } from './styles';
import { SkeletonLoader } from '~/components/UiKit';

export const KeysInfo = () => {
  const { selectedAccount } = useContext(AccountContext);

  return (
    <StyledWrapper>
      <div className={clsx('icon-wrapper')}>
        <Icon name="KeyIcon" className={clsx('key-icon')} size="14px" />
      </div>
      <WalletSelect />
      {selectedAccount ? (
        <CopyToClipboard value={selectedAccount} />
      ) : (
        <SkeletonLoader circle width="24px" height="24px" />
      )}
    </StyledWrapper>
  );
};
