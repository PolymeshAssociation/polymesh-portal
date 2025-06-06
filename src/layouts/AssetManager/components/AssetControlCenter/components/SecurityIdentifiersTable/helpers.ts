import { SecurityIdentifier } from '../../types';
import { ISecurityIdentifierTableItem } from './constants';

// Parse security identifiers data for the table
export const parseSecurityIdentifiersData = (
  identifiers: SecurityIdentifier[],
): ISecurityIdentifierTableItem[] => {
  return identifiers.map((identifier) => ({
    id: identifier.id,
    type: identifier.type.toLocaleUpperCase(),
    value: identifier.value,
    actions: null,
  }));
};
