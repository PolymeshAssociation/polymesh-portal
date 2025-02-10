import {
  Asset,
  AssetDetails,
  TickerReservation,
  TickerReservationDetails,
  GlobalMetadataKey,
} from '@polymeshassociation/polymesh-sdk/types';
import { IAssetDetails } from '~/hooks/polymesh/useAssetDetails';

export type AssetWithDetails = Asset & AssetDetails;

export type TickerReservationWithDetails = TickerReservation &
  TickerReservationDetails;

export interface IAssetContext {
  ownedAssets: AssetWithDetails[];
  assetsLoading: boolean;
  setOwnedAssets: (assets: AssetWithDetails[]) => void;
  refreshAssets: () => void;
  tickerReservations: TickerReservationWithDetails[];
  fetchAssetDetails: (
    assetIdentifier: string | Asset,
    forceRefresh?: boolean,
  ) => Promise<IAssetDetails | undefined>;
  globalMetadata: GlobalMetadataKey[];
  refreshGlobalMetadata: () => void;
}

export const initialAssetContext: IAssetContext = {
  ownedAssets: [],
  assetsLoading: false,
  setOwnedAssets: () => {},
  refreshAssets: () => {},
  tickerReservations: [],
  fetchAssetDetails: async () => undefined,
  globalMetadata: [],
  refreshGlobalMetadata: () => {},
};
