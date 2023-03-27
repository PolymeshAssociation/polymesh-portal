import { useEffect, useState, useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { Icon, CopyToClipboard, DidSelect } from '~/components';
import { Text, Button } from '~/components/UiKit';
import {
  StyledWrapper,
  IconWrapper,
  StyledTopInfo,
  StyledVerifiedLabel,
  StyledDidWrapper,
  StyledBottomInfo,
  StyledButtonWrapper,
  Separator,
} from './styles';
import { formatDid } from '~/helpers/formatters';
import { Details } from './components/Details';

export const DidInfo = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity, identityLoading, identityHasValidCdd } =
    useContext(AccountContext);
  const [expiry, setExpiry] = useState<null | Date>(null);
  const [issuer, setIssuer] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  useEffect(() => {
    if (!identity || !sdk) return undefined;

    (async () => {
      if (!identityHasValidCdd) return;

      const claims = await sdk.claims.getCddClaims();
      if (!claims.length) return;

      setExpiry(claims[0].expiry);
      setIssuer(claims[0].issuer.did);
    })();

    return () => {
      setIsVerified(false);
      setExpiry(null);
      setIssuer(null);
    };
  }, [identity, identityHasValidCdd, sdk]);

  const parseExpiry = (expiryValue: null | Date | undefined) => {
    if (typeof expiryValue === 'undefined') return 'unknown';

    if (expiryValue === null) return 'never';

    return expiry?.toString();
  };

  const toggleModal = () => setDetailsExpanded((prev) => !prev);

  return (
    <>
      <StyledWrapper>
        <StyledTopInfo>
          <IconWrapper size="64px">
            <Icon name="IdCard" size="32px" className="id-icon" />
          </IconWrapper>
          <div className="did-wrapper">
            {!identityLoading && !identity ? (
              <Text bold size="large" marginTop={22}>
                Your account is incomplete
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
                    <CopyToClipboard value={identity?.did} />
                  </IconWrapper>
                </StyledDidWrapper>
              </>
            )}
          </div>
        </StyledTopInfo>
        <StyledBottomInfo>
          {!identityLoading && !identity ? (
            <Text size="small">
              The selected key is not associated with a Polymesh Account. In
              order to use this key, either create a Polymesh Account, or have
              the key assigned to another Polymesh Account.
            </Text>
          ) : (
            <>
              <div>
                Expires on:
                <span>{identityLoading ? '...' : parseExpiry(expiry)}</span>
              </div>
              <Separator />
              <div>
                Verified by:
                <span>
                  {identityLoading ? '...' : formatDid(issuer)}
                  {!!issuer && (
                    <IconWrapper>
                      <CopyToClipboard value={issuer} />
                    </IconWrapper>
                  )}
                </span>
              </div>
            </>
          )}
        </StyledBottomInfo>
        {!identityLoading && !identity ? (
          <StyledButtonWrapper>
            {/* todo: make url configutable */}
            <Button
              onClick={() =>
                window.open(
                  'https://testnet-onboarding.polymesh.live/',
                  '_blank',
                )
              }
            >
              Create account
            </Button>
            <Button
              variant="transparent"
              onClick={() =>
                window.open(
                  'https://polymath.network/polymesh-testnet/key-and-id-assignments',
                  '_blank',
                )
              }
            >
              Assign key to account
            </Button>
          </StyledButtonWrapper>
        ) : (
          <Button variant="transparent" onClick={toggleModal}>
            Details
          </Button>
        )}
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
