import { useEffect, useState, useContext } from 'react';
import { Identity } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { EKeyIdentityStatus } from '~/context/AccountContext/constants';
import { Icon, CopyToClipboard, DidSelect } from '~/components';
import { Text, Button, SkeletonLoader } from '~/components/UiKit';
import {
  StyledWrapper,
  IconWrapper,
  StyledTopInfo,
  StyledVerifiedLabel,
  StyledDidWrapper,
  StyledBottomInfo,
  StyledButtonWrapper,
  Separator,
  StyledLink,
} from './styles';
import { formatDid } from '~/helpers/formatters';
import { Details } from './components/Details';
import { systematicCddProviders } from './constants';
import { useWindowWidth } from '~/hooks/utility';

export const DidInfo = () => {
  const {
    api: { sdk, polkadotApi },
  } = useContext(PolymeshContext);
  const {
    identity,
    identityLoading,
    identityHasValidCdd,
    keyCddVerificationInfo,
  } = useContext(AccountContext);
  const { setIdentityPopup } = useAuthContext();
  const [expiry, setExpiry] = useState<null | Date | undefined>(undefined);
  const [issuer, setIssuer] = useState<string | null>(null);
  const [claimDetailsLoading, setClaimDetailsLoading] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const { isMobile, isSmallDesktop } = useWindowWidth();

  useEffect(() => {
    setClaimDetailsLoading(true);
    if (identityLoading || !sdk) return undefined;
    if (!identity) {
      setExpiry(undefined);
      setIssuer(null);
      setClaimDetailsLoading(false);
      return undefined;
    }

    (async () => {
      const claims = await sdk.claims.getCddClaims({ target: identity });
      if (!claims.length) {
        setExpiry(undefined);
        setIssuer(null);
        setClaimDetailsLoading(false);
        return;
      }
      // Filter to claims from the current CDD providers only.
      const filteredClaims = await Promise.all(
        claims.filter(async (claim) => {
          const issuerIsCddProvider =
            (await claim.issuer.isCddProvider()) ||
            systematicCddProviders.includes(claim.issuer.did);

          return issuerIsCddProvider;
        }),
      );
      // Sort claims latest expiry first, null (= never) is sorted first
      const sortedClaims = filteredClaims.sort((a, b) => {
        if (!a.expiry) return -1;
        if (!b.expiry) return 1;
        return b.expiry.getTime() - a.expiry.getTime();
      });

      setExpiry(sortedClaims[0].expiry);
      setIssuer(sortedClaims[0].issuer.did);
      setClaimDetailsLoading(false);
    })();

    return () => {
      setExpiry(undefined);
      setIssuer(null);
      setClaimDetailsLoading(false);
    };
  }, [identity, identityLoading, sdk]);

  const parseExpiry = (expiryValue: null | Date | undefined) => {
    if (typeof expiryValue === 'undefined') return 'CDD claim missing';

    if (expiryValue === null) return 'Never';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric' as const,
      month: '2-digit' as const,
      day: '2-digit' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false,
    };

    const localDateString = expiryValue
      .toLocaleString('en-CA', options) // locale 'en-CA' returns format YYYY-MM-DD h:mm:ss
      .replace(',', '');
    return localDateString;
  };

  const toggleModal = () => setDetailsExpanded((prev) => !prev);

  const isSmallScreen = isMobile || isSmallDesktop;

  const renderBottomInfo = (
    activeIdentity: Identity | null,
    expiryDate: Date | null | undefined,
    issuerDid: string | null,
  ) => {
    const date = parseExpiry(expiryDate);
    if (!activeIdentity) {
      return (
        <Text size="small">
          Complete onboarding to link this key to a new Polymesh identity. If
          you have already completed onboarding and want to assign this key to
          an existing account,{' '}
          <StyledLink
            href={import.meta.env.VITE_ASSIGN_KEY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            click here
          </StyledLink>{' '}
          to learn how.
        </Text>
      );
    }
    if (expiryDate === undefined) {
      return (
        <Text size="small">
          The selected identity is missing a valid customer due diligence claim.
          To use this identity, complete the onboarding process with a Polymesh
          customer due diligence provider to receive a valid CDD claim.
        </Text>
      );
    }
    if (expiryDate && expiryDate <= new Date()) {
      return (
        <Text size="small">
          The previous identity claim associated with this key has expired as of{' '}
          <span>{date}</span>. Please renew your identity verification by
          completing the onboarding process with a Polymesh customer due
          diligence provider.
        </Text>
      );
    }
    return (
      <>
        <div>
          Expires on:
          <span>{date}</span>
        </div>
        {!isSmallScreen && <Separator />}
        <div>
          Verified by:
          <span>
            {formatDid(issuerDid)}
            {!!issuerDid && (
              <IconWrapper>
                <CopyToClipboard value={issuerDid} />
              </IconWrapper>
            )}
          </span>
        </div>
      </>
    );
  };

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
                This key is not linked to an identity
              </Text>
            ) : (
              <>
                {identityHasValidCdd && (
                  <StyledVerifiedLabel>Verified</StyledVerifiedLabel>
                )}
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
          {!identityLoading &&
            !claimDetailsLoading &&
            renderBottomInfo(identity, expiry, issuer)}
          {identityLoading || claimDetailsLoading ? (
            <SkeletonLoader
              count={2}
              baseColor="rgba(255,255,255,0.05)"
              highlightColor="rgba(255, 255, 255, 0.24)"
            />
          ) : null}
        </StyledBottomInfo>
        <StyledButtonWrapper>
          {!identityLoading && !identity ? (
            <Button
              disabled={
                polkadotApi?.genesisHash.toString() !==
                import.meta.env.VITE_GENESIS_HASH
              }
              onClick={() =>
                setIdentityPopup({
                  type:
                    keyCddVerificationInfo?.status ===
                    EKeyIdentityStatus.PENDING
                      ? 'pending'
                      : 'providers',
                })
              }
              matomoData={{
                eventCategory: 'onboarding',
                eventAction: 'verify-identity',
                eventName: 'did-view'
              }}
            >
              Complete onboarding
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
        <Details
          toggleModal={toggleModal}
          isVerified={identityHasValidCdd}
          did={identity?.did}
          expiry={parseExpiry(expiry)}
          issuer={issuer}
        />
      )}
    </>
  );
};
