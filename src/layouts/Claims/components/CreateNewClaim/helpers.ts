import { ScopeType } from '@polymeshassociation/polymesh-sdk/types';

export const createPlaceholderByScopeType = (type: ScopeType) => {
  switch (type) {
    case ScopeType.Ticker:
      return 'Enter Ticker';

    case ScopeType.Identity:
      return 'Ender DID';

    case ScopeType.Custom:
      return 'Ender custom value';

    default:
      return '';
  }
};
