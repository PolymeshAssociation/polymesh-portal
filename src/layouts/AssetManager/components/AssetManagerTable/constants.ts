export interface IOwnedAssetItem {
  id: string;
  name?: string;
  ticker?: string;
  nonFungible: boolean;
}

export interface IManagedAssetItem {
  id: string;
  name?: string;
  ticker?: string;
  nonFungible: boolean;
}

export interface ITickerReservationItem {
  ticker: string;
  expiryDate: Date | null;
}

export type AssetManagerTableItem =
  | IOwnedAssetItem
  | IManagedAssetItem
  | ITickerReservationItem;

export enum EAssetManagerTableTabs {
  OWNED_ASSETS = 'owned assets',
  MANAGED_ASSETS = 'managed assets',
  TICKER_RESERVATIONS = 'ticker reservations',
}
