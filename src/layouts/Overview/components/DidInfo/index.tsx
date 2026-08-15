import { useContext, useState } from 'react';
import { CopyToClipboard, DidSelect, Icon } from '~/components';
import { Button, SkeletonLoader, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { useWindowWidth } from '~/hooks/utility';
import { Details } from './components/Details';
import {
  IconWrapper,
  StyledBottomInfo,
  StyledButtonWrapper,
  StyledDidWrapper,
  StyledLink,
  StyledTopInfo,
  StyledWrapper,
} from './styles';

export const DidInfo = () => {
  const { identity, identityLoading } = useContext(AccountContext);
  const { setShowIdentityPopup } = useAuthContext();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const { isMobile, isSmallDesktop } = useWindowWidth();

  const toggleModal = () => setDetailsExpanded((prev) => !prev);

  const isSmallScreen = isMobile || isSmallDesktop;

  return (
    <>
      <StyledWrapper>
        <StyledTopInfo>
          {!isMobile && !isSmallDesktop && (
            <IconWrapper $size="64px">
              <Icon name="IdCard" size="32px" className="id-icon" />
            </IconWrapper>
          )}
          <div className="did-wrapper">
            {!identityLoading && !identity ? (
              <Text bold size="large" marginTop={isSmallScreen ? 0 : 22}>
                This key is not linked to an on-chain identity
              </Text>
            ) : (
              <>
                <Text marginBottom={4}>Your DID</Text>
                <StyledDidWrapper>
                  <DidSelect />
                  <IconWrapper>
                    {identityLoading ? (
                      <SkeletonLoader
                        circle
                        height="32px"
                        width="32px"
                        baseColor="rgba(255,255,255,0.05)"
                        highlightColor="rgba(255, 255, 255, 0.24)"
                      />
                    ) : (
                      <CopyToClipboard value={identity?.did} />
                    )}
                  </IconWrapper>
                </StyledDidWrapper>
              </>
            )}
          </div>
        </StyledTopInfo>
        <StyledBottomInfo>
          {identityLoading ? (
            <SkeletonLoader
              count={1}
              baseColor="rgba(255,255,255,0.05)"
              highlightColor="rgba(255, 255, 255, 0.24)"
            />
          ) : (
            !identity && (
              <>
                <Text size="small" marginTop={6}>
                  A Decentralized Identity (DID) is required for asset
                  management and identity-related features. Click the below
                  button to register a new identity or{' '}
                  <StyledLink
                    href={import.meta.env.VITE_ASSIGN_KEY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    click here
                  </StyledLink>{' '}
                  if you want to learn how to assign this key to an existing
                  DID.
                </Text>
                <Text size="small" marginBottom={6}>
                  <strong>* DID registration is optional:</strong> You can send
                  and receive POLYX and participate in staking without a
                  registered identity. A DID is required for asset management,
                  portfolios, and other identity-related features.
                </Text>
              </>
            )
          )}
        </StyledBottomInfo>
        <StyledButtonWrapper>
          {!identityLoading && !identity ? (
            <Button onClick={() => setShowIdentityPopup(true)}>
              Register DID
            </Button>
          ) : (
            <>
              {identityLoading && (
                <SkeletonLoader
                  height={48}
                  baseColor="rgba(255,255,255,0.05)"
                  highlightColor="rgba(255, 255, 255, 0.24)"
                />
              )}
              {!identityLoading && (
                <Button
                  variant="transparent"
                  onClick={toggleModal}
                  disabled={identityLoading}
                >
                  Details
                </Button>
              )}
            </>
          )}
        </StyledButtonWrapper>
      </StyledWrapper>
      {detailsExpanded && (
        <Details toggleModal={toggleModal} did={identity?.did} />
      )}
    </>
  );
};
