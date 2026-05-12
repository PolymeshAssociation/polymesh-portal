export enum EBalanceHolder {
  ALL = 'all',
  ACCOUNT = 'account',
  PORTFOLIO = 'portfolio',
}

export const getBalanceHolder = (
  holder: string | null,
  portfolioId: string | null,
): EBalanceHolder => {
  if (holder === EBalanceHolder.ACCOUNT) {
    return EBalanceHolder.ACCOUNT;
  }

  if (holder === EBalanceHolder.PORTFOLIO || portfolioId) {
    return EBalanceHolder.PORTFOLIO;
  }

  return EBalanceHolder.ALL;
};

export const buildBalanceSearchParams = ({
  holder,
  portfolioId,
  accountAddress,
  additionalParams,
}: {
  holder: EBalanceHolder;
  portfolioId?: string | null;
  accountAddress?: string | null;
  additionalParams?: Record<string, string | null | undefined>;
}): Record<string, string> => {
  const params: Record<string, string> = {};

  if (holder !== EBalanceHolder.ALL) {
    params.holder = holder;
  }

  if (holder === EBalanceHolder.PORTFOLIO && portfolioId) {
    params.id = portfolioId;
  }

  if (holder === EBalanceHolder.ACCOUNT && accountAddress) {
    params.address = accountAddress;
  }

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) {
        params[key] = value;
      }
    });
  }

  return params;
};
