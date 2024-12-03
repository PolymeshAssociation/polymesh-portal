import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { Icon, CopyToClipboard, WalletSelect } from '~/components';
import { StyledWrapper, StyledIconButton } from './styles';
import { SkeletonLoader } from '~/components/UiKit';
import { useExternalKeyWarningToast } from '~/hooks/polymesh/UseExternalKeyWarningToast';

export const KeysInfo = () => {
  const { selectedAccount, isExternalConnection, identityLoading } =
    useContext(AccountContext);
  const { showExternalKeyWarningToast } = useExternalKeyWarningToast();

  return (
    <StyledWrapper>
      <div className="icon-wrapper">
        {!identityLoading && isExternalConnection ? (
          <StyledIconButton type="button" onClick={showExternalKeyWarningToast}>
            <Icon
              name="EyeIcon"
              size="20px"
              className="eye-icon"
              aria-label="View-only mode"
            />
          </StyledIconButton>
        ) : (
          <Icon name="KeyIcon" className="key-icon" size="14px" />
        )}
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
