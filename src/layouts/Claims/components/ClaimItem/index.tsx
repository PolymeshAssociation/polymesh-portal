import { useContext, useState } from 'react';
import {
  Claim,
  ClaimData,
  ClaimType,
  CountryCode,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { CopyToClipboard, Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { ClaimsContext } from '~/context/ClaimsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { toParsedDate } from '~/helpers/dateTime';
import { formatDid, splitByCapitalLetters } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { EClaimsType } from '../../constants';
import {
  StyledClaimItem,
  StyledClaimWrapper,
  StyledDidWrapper,
  RevokeButton,
} from './styles';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { useWindowWidth } from '~/hooks/utility';

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
  const { isMobile } = useWindowWidth();
  const { claim } = claimData;

  const handleRevoke = async () => {
    if (type === EClaimsType.RECEIVED || !sdk) return;

    let unsubCb: UnsubCallback | undefined;
    try {
      setRevokeInProgress(true);
      const revokeTx = await sdk.claims.revokeClaims({
        claims: [{ claim, target: claimData.target }],
      });
      unsubCb = await revokeTx.onStatusChange((transaction) =>
        handleStatusChange(transaction),
      );
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

  const getCountryName = (countryCode: CountryCode) => {
    const country = countryCodes.find(
      ({ code }) => code === countryCode.toUpperCase(),
    );
    return country ? country.name.split(',')[0] : '';
  };

  return (
    <StyledClaimWrapper>
      <StyledClaimItem>
        Claim Type
        <Text bold size="large">
          {splitByCapitalLetters(claim.type)}
        </Text>
      </StyledClaimItem>
      {type === EClaimsType.RECEIVED ? (
        <StyledClaimItem>
          Issued by
          <StyledDidWrapper>
            {formatDid(
              claimData.issuer.did,
              isMobile ? 4 : 7,
              isMobile ? 5 : 8,
            )}
            <CopyToClipboard value={claimData.issuer.did} />
          </StyledDidWrapper>
        </StyledClaimItem>
      ) : (
        <StyledClaimItem>
          Target
          <StyledDidWrapper>
            {formatDid(
              claimData.target.did,
              isMobile ? 4 : 7,
              isMobile ? 5 : 8,
            )}
            <CopyToClipboard value={claimData.target.did} />
          </StyledDidWrapper>
        </StyledClaimItem>
      )}
      {!!claimData.expiry && (
        <StyledClaimItem>
          Expiry Date
          <Text bold size="large">
            {toParsedDate(claimData.expiry.toISOString())}
          </Text>
        </StyledClaimItem>
      )}
      <StyledClaimItem>
        Issued At
        <Text bold size="large">
          {toParsedDate(claimData.issuedAt.toISOString())}
        </Text>
      </StyledClaimItem>
      {!!claimData.lastUpdatedAt &&
        claimData.issuedAt.getTime() !== claimData.lastUpdatedAt.getTime() && (
          <StyledClaimItem>
            Last Updated
            <Text bold size="large">
              {toParsedDate(claimData.lastUpdatedAt.toISOString())}
            </Text>
          </StyledClaimItem>
        )}
      {claim.type === ClaimType.Jurisdiction && (
        <StyledClaimItem>
          Region
          <Text bold size="large">
            {getCountryName(claim.code)}
          </Text>
        </StyledClaimItem>
      )}
      {type === EClaimsType.ISSUED && (
        <RevokeButton disabled={revokeInProgress} onClick={handleRevoke}>
          <Icon name="CloseIcon" size="24px" />
          Revoke
        </RevokeButton>
      )}
    </StyledClaimWrapper>
  );
};
