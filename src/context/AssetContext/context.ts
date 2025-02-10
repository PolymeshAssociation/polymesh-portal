import { createContext } from 'react';
import { initialAssetContext, IAssetContext } from './constants';

const AssetContext = createContext<IAssetContext>(initialAssetContext);

export default AssetContext;
