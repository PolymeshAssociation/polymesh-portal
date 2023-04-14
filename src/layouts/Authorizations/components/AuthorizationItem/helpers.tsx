import { HumanReadable } from '@polymeshassociation/polymesh-sdk/api/entities/AuthorizationRequest';
import {
  AuthorizationRequest,
  AuthorizationType,
  PortfolioCustodyAuthorizationData,
} from '@polymeshassociation/polymesh-sdk/types';
import { NumberedPortfolio } from '@polymeshassociation/polymesh-sdk/internal';
import { CopyToClipboard } from '~/components';
import {
  StyledDetailsWrapper,
  StyledDetailItem,
  StyledDetailValue,
  StyledExpiryTime,
} from './styles';
import { formatDid } from '~/helpers/formatters';

const parseDetails = async (
  staticData: HumanReadable,
  rawData: AuthorizationRequest,
) => {
  const details = staticData.data;

  switch (details.type) {
    case AuthorizationType.JoinIdentity:
      return [
        {
          permission: details.value.assets ? 'Ticker' : null,
          type: details.value.assets ? details.value.assets.type : null,
          details: details.value.assets ? details.value.assets.values : [],
        },
        {
          permission: details.value.portfolios ? 'Portfolio(s)' : null,
          type: details.value.portfolios ? details.value.portfolios.type : null,
          details: details.value.portfolios
            ? details.value.portfolios.values.map(({ did }) => did)
            : [],
        },
        {
          permission: details.value.transactions ? 'Extrinsics' : null,
          type: details.value.transactions
            ? details.value.transactions.type
            : null,
          details: details.value.transactions
            ? details.value.transactions.values
            : [],
        },
      ];

    case AuthorizationType.RotatePrimaryKey:
      return [];

    case AuthorizationType.RotatePrimaryKeyToSecondary:
      return [
        {
          permission: details.value.assets ? 'Ticker' : null,
          type: details.value.assets ? details.value.assets.type : null,
          details: details.value.assets ? details.value.assets.values : [],
        },
        {
          permission: details.value.portfolios ? 'Portfolio(s)' : null,
          type: details.value.portfolios ? details.value.portfolios.type : null,
          details: details.value.portfolios
            ? details.value.portfolios.values.map(({ did }) => did)
            : [],
        },
        {
          permission: details.value.transactions ? 'Extrinsics' : null,
          type: details.value.transactions
            ? details.value.transactions.type
            : null,
          details: details.value.transactions
            ? details.value.transactions.values
            : [],
        },
      ];

    case AuthorizationType.PortfolioCustody:
      // eslint-disable-next-line no-case-declarations
      const targetPortfolio = (
        rawData.data as PortfolioCustodyAuthorizationData
      ).value;

      return [
        {
          permission: 'Target Portfolio',
          type: null,
          details:
            targetPortfolio instanceof NumberedPortfolio
              ? [
                  `${await targetPortfolio.getName()} / ${targetPortfolio.id.toString()}`,
                ]
              : ['Default / 0'],
        },
        {
          permission: 'Target DID',
          type: null,
          details: [staticData.target.value],
        },
      ];

    case AuthorizationType.BecomeAgent:
      return [
        {
          permission: 'Asset',
          type: null,
          details: [details.value.ticker],
        },
      ];

    case AuthorizationType.AddMultiSigSigner:
      return [
        {
          permission: 'Multisig',
          type: null,
          details: [details.value],
        },
      ];

    case AuthorizationType.TransferAssetOwnership:
      return [
        {
          permission: 'Ticker',
          type: null,
          details: [details.value],
        },
      ];

    case AuthorizationType.TransferTicker:
      return [
        {
          permission: 'Ticker',
          type: null,
          details: [details.value],
        },
      ];

    case AuthorizationType.AddRelayerPayingKey:
      return [
        {
          permission: details.value.allowance ? 'Allowance' : null,
          type: null,
          details: [details.value.allowance],
        },
        {
          permission: details.value.beneficiary ? 'Beneficiary' : null,
          type: null,
          details: [details.value.beneficiary],
        },
        {
          permission: details.value.subsidizer ? 'Subsidizer' : null,
          type: null,
          details: [details.value.subsidizer],
        },
      ];

    default:
      return [];
  }
};

export const renderDetails = async (
  staticData: HumanReadable,
  rawData: AuthorizationRequest,
) => {
  const parsedDetails = await parseDetails(staticData, rawData);

  if (
    parsedDetails.every(
      ({ permission, type }) => permission === null && type === null,
    )
  ) {
    return null;
  }

  return parsedDetails.length ? (
    <StyledDetailsWrapper>
      {parsedDetails.map(({ permission, type, details }) =>
        permission ? (
          <StyledDetailItem key={permission}>
            {permission}:
            {details.length ? (
              details.map((detail) => (
                <StyledDetailValue key={detail}>
                  {detail.length === 66 || detail.length === 48 ? (
                    <>
                      {formatDid(detail, 6, 7)}
                      <CopyToClipboard value={detail} />
                    </>
                  ) : (
                    detail
                  )}
                </StyledDetailValue>
              ))
            ) : (
              <StyledDetailValue>{type} all</StyledDetailValue>
            )}
          </StyledDetailItem>
        ) : null,
      )}
    </StyledDetailsWrapper>
  ) : null;
};

export const formatExpiry = (expiry: string) => {
  const [date, time] = expiry.split(' ');
  return (
    <>
      {date} /{' '}
      <StyledExpiryTime className="expiry-time">{time}</StyledExpiryTime>
    </>
  );
};
