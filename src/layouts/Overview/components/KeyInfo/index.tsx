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
  const { selectedAccount, allAccountsWithMeta, keyIdentityRelationships } =
    useContext(AccountContext);
  const { isMobile, isSmallDesktop } = useWindowWidth();
  const ref = useRef<HTMLDivElement>(null);
  const [selectedKeyName, setSelectedKeyName] = useState('');
  const [truncatedSelectedKeyName, setTruncatedSelectedKeyName] =
    useState<string>('');

  useEffect(() => {
    const updateWrapperWidth = () => {
      const keyName = allAccountsWithMeta.find(
        ({ address }) => address === selectedAccount,
      )?.meta.name;
      setSelectedKeyName(keyName ?? '');
    };

    updateWrapperWidth();
  }, [selectedAccount, allAccountsWithMeta]);

  useEffect(() => {
    const container = ref.current;

    const handleResize = () => {
      if (container) {
        const truncateLength = Math.floor((container.clientWidth - 100) / 11);
        setTruncatedSelectedKeyName(
          truncateText(selectedKeyName, truncateLength),
        );
      }
    };

    handleResize(); // Initial calculation

    const resizeObserver = new ResizeObserver(handleResize);

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [selectedKeyName]);

  return (
    <StyledWrapper>
      {!isMobile && !isSmallDesktop && (
        <IconWrapper $size="64px">
          <Icon name="KeyIcon" className="key-icon" size="26px" />
        </IconWrapper>
      )}
      <div className="info-wrapper" ref={ref}>
        <Text marginBottom={4}>
          Selected key:{' '}
          <span className="key-name">{truncatedSelectedKeyName}</span>
        </Text>
        <KeyInfoWrapper>
          {selectedAccount && keyIdentityRelationships[selectedAccount] ? (
            <StyledLabel>
              {keyIdentityRelationships[selectedAccount]}
            </StyledLabel>
          ) : (
            <SkeletonLoader
              containerClassName="loader"
              height="32px"
              width="91px"
              baseColor="rgba(255,255,255,0.05)"
              highlightColor="rgba(255, 255, 255, 0.24)"
            />
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
