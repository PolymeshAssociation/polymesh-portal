import {
  Claim,
  ClaimData,
  ClaimType,
  CountryCode,
} from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CopyToClipboard, Icon } from '~/components';
import { Text } from '~/components/UiKit';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { AccountContext } from '~/context/AccountContext';
import { ClaimsContext } from '~/context/ClaimsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { toParsedDate } from '~/helpers/dateTime';
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import { EClaimsType } from '../../constants';
import {
  RevokeButton,
  StyledClaimItem,
  StyledClaimWrapper,
  StyledDidWrapper,
} from './styles';

interface IClaimItemProps {
  claimData: ClaimData<Claim>;
}

export const ClaimItem: React.FC<IClaimItemProps> = ({ claimData }) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { isExternalConnection } = useContext(AccountContext);
  const { refreshClaims } = useContext(ClaimsContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { isMobile } = useWindowWidth();
  const { claim } = claimData;

  const countryLookup = useMemo(() => {
    return new Map(
      countryCodes.map(({ code, name }) => [code, name.split(',')[0]]),
    );
  }, []);

  const handleRevoke = async () => {
    if (type === EClaimsType.RECEIVED || !sdk) return;

    try {
      await executeTransaction(
        sdk.claims.revokeClaims({
          claims: [{ claim, target: claimData.target }],
        }),
        {
          onSuccess: () => {
            refreshClaims();
          },
        },
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const getCountryName = useCallback(
    (countryCode: CountryCode) => {
      return countryLookup.get(countryCode.toUpperCase()) || '';
    },
    [countryLookup],
  );

  return (
    <StyledClaimWrapper>
      <StyledClaimItem>
        Claim Type
        <Text bold size="large">
          {splitCamelCase(claim.type)}
        </Text>
      </StyledClaimItem>
      {claim.type === ClaimType.Custom &&
        'customClaimTypeId' in claim &&
        claim.customClaimTypeId && (
          <StyledClaimItem>
            Custom Claim ID
            <Text bold size="large">
              {claim.customClaimTypeId.toString()}
            </Text>
          </StyledClaimItem>
        )}

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
        <RevokeButton
          disabled={isTransactionInProgress || isExternalConnection}
          onClick={handleRevoke}
        >
          <Icon name="CloseIcon" size="24px" />
          Revoke
        </RevokeButton>
      )}
    </StyledClaimWrapper>
  );
};
