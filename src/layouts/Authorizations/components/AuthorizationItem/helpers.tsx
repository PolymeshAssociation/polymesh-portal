import { HumanReadable } from '@polymeshassociation/polymesh-sdk/api/entities/AuthorizationRequest';
import {
  AuthorizationRequest,
  AuthorizationType,
  DefaultPortfolio,
  JoinIdentityAuthorizationData,
  Permissions,
  PolymeshError,
  PortfolioCustodyAuthorizationData,
  RotatePrimaryKeyToSecondaryData,
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

function getTickerPermissions(permissions: Permissions) {
  const tickerPermission =
    permissions.assets?.type === 'Exclude'
      ? 'Excluded Tickers'
      : 'Included Tickers';

  let tickerPermissionDetails: string[];
  if (permissions.assets) {
    if (permissions.assets.values.length) {
      tickerPermissionDetails = permissions.assets.values.map((asset) => {
        return asset.ticker;
      });
    } else {
      tickerPermissionDetails = ['None'];
    }
  } else {
    tickerPermissionDetails = ['All'];
  }

  return {
    permission: tickerPermission,
    type: permissions.assets ? permissions.assets.type : 'Include',
    details: tickerPermissionDetails,
  };
}

async function getPortfolioName(
  portfolio: NumberedPortfolio | DefaultPortfolio,
): Promise<string> {
  if (portfolio instanceof NumberedPortfolio) {
    try {
      const name = await portfolio.getName();
      return `${portfolio.id.toString()} / ${name}`;
    } catch (error) {
      if ((error as PolymeshError).message === "The Portfolio doesn't exist") {
        return `${portfolio.id.toString()} / Non-existent portfolio`;
      }
      throw error;
    }
  }
  return 'Default';
}

async function getPortfolioPermissions(permissions: Permissions) {
  const portfolioPermission =
    permissions.portfolios?.type === 'Exclude'
      ? 'Excluded Portfolios'
      : 'Included Portfolios';

  let portfolios: string[];
  if (permissions.portfolios) {
    if (permissions.portfolios.values.length) {
      portfolios = await Promise.all(
        permissions.portfolios.values.map(async (portfolio) => {
          const shortDid = formatDid(portfolio.owner.did, 6, 7);
          const portfolioIdAndName = await getPortfolioName(portfolio);
          return `${shortDid} / ${portfolioIdAndName}`;
        }),
      );
    } else {
      portfolios = ['None'];
    }
  } else {
    portfolios = ['All'];
  }

  return {
    permission: portfolioPermission,
    type: permissions.portfolios ? permissions.portfolios.type : 'Include',
    details: portfolios,
  };
}

function getTransactionPermissions(permissions: Permissions) {
  let primaryPermissionType: string;
  let exceptionPermissionType: string;
  if (permissions.transactions?.type === 'Exclude') {
    primaryPermissionType = 'Excluded Transactions';
    exceptionPermissionType = 'Exceptions (included)';
  } else {
    primaryPermissionType = 'Included Transactions';
    exceptionPermissionType = 'Exceptions (excluded)';
  }

  let transactionsPermissions: string[];
  if (permissions.transactions) {
    if (permissions.transactions.values.length) {
      transactionsPermissions = permissions.transactions.values.map((value) => {
        if (!value.includes('.')) {
          return `all ${value} transactions`;
        }
        return value;
      });
    } else {
      transactionsPermissions = ['None'];
    }
  } else {
    transactionsPermissions = ['All'];
  }

  let exceptions: string[];
  if (permissions.transactions) {
    if (permissions.transactions.exceptions?.length) {
      exceptions = permissions.transactions.exceptions;
    } else {
      exceptions = ['None'];
    }
  } else {
    exceptions = ['None'];
  }

  return [
    {
      permission: primaryPermissionType,
      type: permissions.transactions
        ? permissions.transactions.type
        : 'Include',
      details: transactionsPermissions,
    },
    {
      permission: exceptionPermissionType,
      type: permissions.transactions
        ? permissions.transactions.type
        : 'Exclude',
      details: exceptions,
    },
  ];
}

const parseDetails = async (
  staticData: HumanReadable,
  rawData: AuthorizationRequest,
) => {
  const details = staticData.data;

  switch (details.type) {
    case AuthorizationType.JoinIdentity: {
      const permissions = (rawData.data as JoinIdentityAuthorizationData).value;
      const txPermissions = getTransactionPermissions(permissions);
      return [
        getTickerPermissions(permissions),
        await getPortfolioPermissions(permissions),
        txPermissions[0],
        txPermissions[1],
      ];
    }

    case AuthorizationType.RotatePrimaryKey:
      return [];

    case AuthorizationType.RotatePrimaryKeyToSecondary: {
      const permissions = (rawData.data as RotatePrimaryKeyToSecondaryData)
        .value;
      const txPermissions = getTransactionPermissions(permissions);

      return [
        {
          permission: 'Key to become secondary',
          type: null,
          details: [(await rawData.issuer.getPrimaryAccount()).account.address],
        },
        getTickerPermissions(permissions),
        await getPortfolioPermissions(permissions),
        txPermissions[0],
        txPermissions[1],
      ];
    }

    case AuthorizationType.PortfolioCustody:
      return [
        {
          permission: 'Target Portfolio',
          type: null,
          details: [
            await getPortfolioName(
              (rawData.data as PortfolioCustodyAuthorizationData).value,
            ),
          ],
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

  return parsedDetails.length ? (
    <StyledDetailsWrapper>
      {parsedDetails.map(({ permission, details }) =>
        permission ? (
          <StyledDetailItem key={permission}>
            {permission}:
            {details.map((detail) => (
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
            ))}
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
