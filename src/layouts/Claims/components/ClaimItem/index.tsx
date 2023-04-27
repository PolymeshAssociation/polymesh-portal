import { useContext, useState } from 'react';
import {
  Claim,
  ClaimData,
  ClaimType,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { CopyToClipboard, Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { ClaimsContext } from '~/context/ClaimsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { toParsedDateTime } from '~/helpers/dateTime';
import { formatDid } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { EClaimsType } from '../../constants';
import {
  StyledClaimItem,
  StyledClaimWrapper,
  StyledDidWrapper,
  RevokeButton,
} from './styles';

interface IClaimItemProps {
  claimData: ClaimData<Claim>;
}

export const ClaimItem: React.FC<IClaimItemProps> = ({ claimData }) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { refreshClaims } = useContext(ClaimsContext);
  const { handleStatusChange } = useTransactionStatus();
  const [revokeInProgress, setRevokeInProgress] = useState(false);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { claim } = claimData;

  const handleRevoke = async () => {
    if (type === EClaimsType.RECEIVED || !sdk) return;

    let unsubCb: UnsubCallback | undefined;
    try {
      setRevokeInProgress(true);
      const revokeTx = await sdk.claims.revokeClaims({
        claims: [{ claim, target: claimData.target }],
      });
      unsubCb = await revokeTx.onStatusChange(handleStatusChange);
      await revokeTx.run();
      refreshClaims();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setRevokeInProgress(false);
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  return (
    <StyledClaimWrapper>
      <StyledClaimItem>
        Claim Type
        <Text bold size="large">
          {claim.type}
        </Text>
      </StyledClaimItem>
      <StyledClaimItem>
        Issued by
        <StyledDidWrapper>
          {formatDid(claimData.issuer.did, 10, 11)}
          <CopyToClipboard value={claimData.issuer.did} />
        </StyledDidWrapper>
      </StyledClaimItem>
      {!!claimData.expiry && (
        <StyledClaimItem>
          Expiry Date
          <Text bold size="large">
            {toParsedDateTime(claimData.expiry.toISOString())}
          </Text>
        </StyledClaimItem>
      )}
      <StyledClaimItem>
        Issued At
        <Text bold size="large">
          {toParsedDateTime(claimData.issuedAt.toISOString())}
        </Text>
      </StyledClaimItem>
      {claim.type === ClaimType.Jurisdiction && (
        <StyledClaimItem>
          Country
          <Text bold size="large">
            {claim.code}
          </Text>
        </StyledClaimItem>
      )}
      {claim.type === ClaimType.InvestorUniqueness &&
        (claim.cddId ? (
          <StyledClaimItem>
            CDD ID
            <Text bold size="large">
              {claim.cddId}
            </Text>
          </StyledClaimItem>
        ) : null)}
      {type === EClaimsType.ISSUED && (
        <RevokeButton disabled={revokeInProgress} onClick={handleRevoke}>
          <Icon name="CloseIcon" size="24px" />
          Revoke
        </RevokeButton>
      )}
    </StyledClaimWrapper>
  );
};
