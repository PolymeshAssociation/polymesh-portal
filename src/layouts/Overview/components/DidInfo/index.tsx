import { useEffect, useState, useContext } from 'react';
import { Identity } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAccountIdentity } from '~/hooks/polymesh';
import { Icon, CopyToClipboard, DidSelect } from '~/components';
import { Text, Button } from '~/components/UiKit';
import {
  StyledWrapper,
  IconWrapper,
  StyledTopInfo,
  StyledVerifiedLabel,
  StyledDidWrapper,
  StyledBottomInfo,
} from './styles';
import { formatDid } from '~/helpers/formatters';

export const DidInfo = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity, identityLoading } = useAccountIdentity();
  const [isVerified, setIsVerified] = useState(false);
  const [expiry, setExpiry] = useState<null | Date>(null);
  const [issuer, setIssuer] = useState<Identity | null>(null);

  useEffect(() => {
    if (!identity || !sdk) return undefined;

    (async () => {
      const hasValidCdd = await identity.hasValidCdd();
      setIsVerified(hasValidCdd);

      if (!hasValidCdd) return;

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
  }, [identity, sdk]);

  const parseExpiry = (expiryValue: null | Date | undefined) => {
    if (typeof expiryValue === 'undefined') return 'unknown';

    if (expiryValue === null) return 'never';

    return expiry;
  };

  return (
    <StyledWrapper>
      <StyledTopInfo>
        <IconWrapper size="64px">
          <Icon name="IdCard" size="32px" className="id-icon" />
        </IconWrapper>
        <div className="did-wrapper">
          {isVerified && <StyledVerifiedLabel>Verified</StyledVerifiedLabel>}
          <Text marginBottom={4}>Your DID</Text>
          <StyledDidWrapper>
            <DidSelect />
            <IconWrapper>
              <CopyToClipboard value={identity?.did} />
            </IconWrapper>
          </StyledDidWrapper>
        </div>
      </StyledTopInfo>
      <StyledBottomInfo>
        <Text>
          Expires on
          <span>{identityLoading ? '...' : parseExpiry(expiry)}</span>
        </Text>
        <Text>
          Verified by <span>{identityLoading ? '...' : formatDid(issuer)}</span>
        </Text>
      </StyledBottomInfo>
      <Button variant="transparent" marginTop={20}>
        Details
      </Button>
    </StyledWrapper>
  );
};
