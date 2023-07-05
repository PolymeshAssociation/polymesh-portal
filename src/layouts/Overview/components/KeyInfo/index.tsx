import { useEffect, useState, useContext, useRef } from 'react';
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
import { truncateText } from '~/helpers/formatters';

export const KeyInfo = () => {
  const {
    selectedAccount,
    allAccountsWithMeta,
    primaryKey,
    secondaryKeys,
    accountIsMultisigSigner,
    identityLoading,
  } = useContext(AccountContext);
  const { isMobile, isSmallDesktop } = useWindowWidth();
  const ref = useRef<HTMLDivElement>(null);
  const [selectedKeyName, setSelectedKeyName] = useState('');

  useEffect(() => {
    const updateWrapperWidth = () => {
      const keyName = allAccountsWithMeta.find(
        ({ address }) => address === selectedAccount,
      )?.meta.name;
      setSelectedKeyName(keyName ?? '');
    };

    updateWrapperWidth();
  }, [selectedAccount, allAccountsWithMeta]);

  const wrapperWidth = ref.current?.clientWidth ?? 150;
  const truncateLength = Math.floor((wrapperWidth - 100) / 11);
  const truncatedSelectedKeyName = truncateText(
    selectedKeyName,
    truncateLength,
  );

  return (
    <StyledWrapper>
      {!isMobile && !isSmallDesktop && (
        <IconWrapper size="64px">
          <Icon name="KeyIcon" className="key-icon" size="26px" />
        </IconWrapper>
      )}
      <div className="info-wrapper" ref={ref}>
        <Text marginBottom={4}>
          Selected key:{' '}
          <span className="key-name">{truncatedSelectedKeyName}</span>
        </Text>
        <KeyInfoWrapper>
          {!identityLoading && (
            <>
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
                !accountIsMultisigSigner && (
                  <StyledLabel>Unassigned</StyledLabel>
                )}
            </>
          )}
          <WalletSelect placement="widget" />
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
