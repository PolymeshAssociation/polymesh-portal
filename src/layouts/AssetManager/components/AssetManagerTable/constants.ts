export interface IOwnedAssetItem {
  id: string;
  name?: string;
  ticker?: string;
  nonFungible: boolean;
}

export interface ITickerReservationItem {
  ticker: string;
  expiryDate: Date | null;
}

export type AssetManagerTableItem = IOwnedAssetItem | ITickerReservationItem;

export enum EAssetManagerTableTabs {
  OWNED_ASSETS = 'owned assets',
  TICKER_RESERVATIONS = 'ticker reservations',
}
