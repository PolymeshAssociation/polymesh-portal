import { HumanReadable } from '@polymeshassociation/polymesh-sdk/api/entities/AuthorizationRequest';
import { AuthorizationType } from '@polymeshassociation/polymesh-sdk/types';
import {
  StyledDetailsWrapper,
  StyledDetailItem,
  StyledDetailValue,
} from './styles';
import { formatDid } from '~/helpers/formatters';

const parseDetails = (staticData: HumanReadable) => {
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
      return [
        {
          permission: 'Portfolio',
          type: null,
          details: [details.value.did],
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

    default:
      return [];
  }
};

export const renderDetails = (staticData: HumanReadable) => {
  const parsedDetails = parseDetails(staticData);

  return parsedDetails.length ? (
    <StyledDetailsWrapper>
      {parsedDetails.map(({ permission, type, details }) =>
        permission ? (
          <StyledDetailItem key={permission}>
            {permission}:
            {details.length ? (
              details.map((detail) => (
                <StyledDetailValue key={detail}>
                  {detail.length === 66 ? formatDid(detail) : detail}
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
