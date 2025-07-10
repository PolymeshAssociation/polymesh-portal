import { ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import { ScopeItem } from '~/context/ClaimsContext/constants';
import { EScopeSortOptions } from './constants';

export const sortScopesBySortOption = (
  scopes: ScopeItem[],
  option: EScopeSortOptions,
) => {
  switch (option) {
    case EScopeSortOptions.ASSET:
      return scopes.sort((a, b) => {
        if (!a.scope || !b.scope || b.scope.type !== ScopeType.Asset) return -1;

        if (a.scope.type === ScopeType.Asset) {
          return 1;
        }
        return 0;
      });

    case EScopeSortOptions.IDENTITY:
      return scopes.sort((a, b) => {
        if (!a.scope || !b.scope || b.scope.type !== ScopeType.Identity)
          return -1;
        if (a.scope.type === ScopeType.Identity) {
          return 1;
        }
        return 0;
      });

    case EScopeSortOptions.CUSTOM:
      return scopes.sort((a, b) => {
        if (!a.scope || !b.scope || b.scope.type !== ScopeType.Custom)
          return -1;
        if (a.scope.type === ScopeType.Custom) {
          return 1;
        }
        return 0;
      });

    case EScopeSortOptions.NO_SCOPE:
      return [
        ...scopes.filter(({ scope }) => !scope),
        ...scopes.filter(({ scope }) => !!scope),
      ];

    default:
      return scopes;
  }
};
